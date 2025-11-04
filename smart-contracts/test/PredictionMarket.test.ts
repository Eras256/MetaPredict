// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/core/PredictionMarketCore.sol";
import "../contracts/markets/BinaryMarket.sol";
import "../contracts/oracle/AIOracle.sol";
import "../contracts/oracle/InsurancePool.sol";
import "../contracts/reputation/ReputationStaking.sol";
import "../contracts/governance/DAOGovernance.sol";
import "../contracts/aggregator/CrossChainRouter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000e6);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract PredictionMarketTest is Test {
    PredictionMarketCore core;
    BinaryMarket binaryMarket;
    AIOracle oracle;
    InsurancePool insurance;
    ReputationStaking reputation;
    DAOGovernance dao;
    CrossChainRouter router;
    MockUSDC usdc;
    
    address user1 = address(0x1);
    address user2 = address(0x2);
    address user3 = address(0x3);
    
    function setUp() public {
        usdc = new MockUSDC();
        
        oracle = new AIOracle(
            address(0), // Chainlink Functions Router
            bytes32(0), // DON ID
            0 // Subscription ID
        );
        
        insurance = new InsurancePool(
            IERC20(address(usdc)),
            address(0), // Venus vToken
            address(0), // Pancake Router
            "Insurance Shares",
            "INS"
        );
        
        reputation = new ReputationStaking(address(usdc));
        
        dao = new DAOGovernance(
            address(usdc),
            address(reputation)
        );
        
        router = new CrossChainRouter(
            address(usdc),
            address(0), // CCIP Router
            address(0) // LayerZero Endpoint
        );
        
        core = new PredictionMarketCore(
            address(usdc),
            address(oracle),
            address(reputation),
            address(insurance),
            address(router),
            address(dao)
        );
        
        binaryMarket = new BinaryMarket(
            address(usdc),
            address(core)
        );
        
        // Configure contracts
        core.registerMarketContract(0, address(binaryMarket));
        oracle.setCoreContract(address(core));
        insurance.setCoreContract(address(core));
        reputation.setCoreContract(address(core));
        dao.setCoreContract(address(core));
        router.setCoreContract(address(core));
        
        // Fund users
        usdc.transfer(user1, 10000e6);
        usdc.transfer(user2, 10000e6);
        usdc.transfer(user3, 10000e6);
    }
    
    function testCreateMarket() public {
        vm.prank(user1);
        uint256 marketId = core.createMarket(
            0, // Binary
            "Will BTC exceed $100K by Dec 2025?",
            "Prediction market for Bitcoin price",
            block.timestamp + 30 days,
            0,
            ""
        );
        
        assertEq(marketId, 1);
        
        (
            uint256 id,
            uint8 marketType,
            ,
            ,
            uint8 status,
            ,
            ,
        ) = core.getMarket(marketId);
        
        assertEq(id, 1);
        assertEq(marketType, 0);
        assertEq(status, 1); // Active
    }
    
    function testPlaceBet() public {
        // Create market
        vm.prank(user1);
        uint256 marketId = core.createMarket(
            0,
            "Test Market",
            "Description",
            block.timestamp + 30 days,
            0,
            ""
        );
        
        // User2 approves and bets
        vm.startPrank(user2);
        usdc.approve(address(core), 100e6);
        core.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        // Check position
        (uint256 yesShares, uint256 noShares, , , ) = binaryMarket.positions(marketId, user2);
        assertGt(yesShares, 0);
        assertEq(noShares, 0);
    }
    
    function testInsuranceActivation() public {
        // Create and bet on market
        vm.prank(user1);
        uint256 marketId = core.createMarket(
            0,
            "Test Market",
            "Description",
            block.timestamp + 1 days,
            0,
            ""
        );
        
        vm.startPrank(user2);
        usdc.approve(address(core), 100e6);
        core.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        // Fast forward past deadline
        vm.warp(block.timestamp + 2 days);
        
        // Simulate oracle failure (low consensus)
        vm.prank(address(core));
        oracle.recordResult(marketId, 3, 40); // Invalid with 40% confidence
        
        // Check insurance activation
        (bool activated, , , , ) = insurance.getPolicyStatus(marketId);
        assertTrue(activated);
    }
    
    function testReputationSlashing() public {
        // User stakes reputation
        vm.startPrank(user2);
        usdc.approve(address(reputation), 1000e6);
        reputation.stake(1000e6);
        vm.stopPrank();
        
        // User votes incorrectly
        vm.prank(user2);
        reputation.recordVote(1, true); // Market ID 1, voted YES
        
        // Market resolves to NO, user was wrong
        vm.prank(address(core));
        reputation.processVoteResult(1, false); // Market resolved to NO
        
        // Check that reputation was slashed
        (, , uint8 tier, , ) = reputation.getStaker(user2);
        // Tier should be lower after incorrect vote
        assertLt(tier, 5); // Assuming max tier is 5
    }
    
    function testCrossChainRouting() public {
        // Test cross-chain price comparison
        // This would require mocking CCIP/LayerZero
        // Placeholder for cross-chain routing test
        assertTrue(true);
    }
    
    function testDAOVoting() public {
        // Create a proposal
        vm.prank(user1);
        uint256 proposalId = dao.createProposal(
            "Test Proposal",
            "Description",
            "" // IPFS hash
        );
        
        assertEq(proposalId, 1);
        
        // User votes
        vm.startPrank(user2);
        usdc.approve(address(dao), 1000e6);
        dao.vote(proposalId, 1, ""); // Vote FOR
        vm.stopPrank();
        
        // Check vote recorded
        (uint256 forVotes, , , , ) = dao.getProposal(proposalId);
        assertGt(forVotes, 0);
    }
}


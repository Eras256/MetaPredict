// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/markets/PredictionMarket.sol";
import "../contracts/oracle/AIOracle.sol";
import "../contracts/oracle/InsurancePool.sol";
import "../contracts/libraries/Errors.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000e6);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockAIOracle {
    PredictionMarket public predictionMarket;
    
    function setPredictionMarket(address _market) external {
        predictionMarket = PredictionMarket(payable(_market));
    }
    
    function resolveMarket(uint256 _marketId, PredictionMarket.Outcome _outcome, uint8 _confidence) external {
        predictionMarket.resolveMarket(_marketId, _outcome, _confidence);
    }
}

contract PredictionMarketTest is Test {
    PredictionMarket market;
    MockAIOracle oracle;
    InsurancePool insurance;
    MockERC20 token;
    
    address owner = address(0x1);
    address user1 = address(0x2);
    address user2 = address(0x3);
    
    function setUp() public {
        vm.startPrank(owner);
        
        token = new MockERC20();
        oracle = new MockAIOracle();
        insurance = new InsurancePool(
            IERC20(address(token)),
            address(0), // Venus vToken mock
            "Insurance Pool",
            "INS"
        );
        
        market = new PredictionMarket(
            address(token),
            address(oracle),
            address(insurance)
        );
        
        oracle.setPredictionMarket(address(market));
        insurance.setPredictionMarket(address(market));
        
        // Fund users
        token.mint(user1, 10000e6);
        token.mint(user2, 10000e6);
        
        vm.stopPrank();
    }
    
    // ============ Market Creation Tests ============
    
    function test_CreateMarket() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Will BTC exceed $100K?",
            "Bitcoin price prediction",
            block.timestamp + 30 days,
            "ipfs://hash",
            0 // No Pyth price ID
        );
        
        assertEq(marketId, 1);
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.id, 1);
        assertEq(m.creator, user1);
        assertEq(uint256(m.status), uint256(PredictionMarket.MarketStatus.Active));
    }
    
    function test_CreateMarket_InvalidTime() public {
        vm.prank(user1);
        vm.expectRevert(Errors.InvalidTime.selector);
        market.createMarket(
            "Test",
            "Test description",
            block.timestamp + 30 minutes, // Too soon
            "",
            0
        );
    }
    
    function test_CreateMarket_QuestionTooShort() public {
        vm.prank(user1);
        vm.expectRevert(Errors.QuestionTooShort.selector);
        market.createMarket(
            "Short", // Too short
            "Test",
            block.timestamp + 30 days,
            "",
            0
        );
    }
    
    // ============ Betting Tests ============
    
    function test_PlaceBet() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Will BTC exceed $100K?",
            "Test",
            block.timestamp + 30 days,
            "",
            0
        );
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        market.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        PredictionMarket.Position memory pos = market.getPosition(marketId, user1);
        assertGt(pos.yesShares, 0);
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertGt(m.yesPool, 0);
    }
    
    function test_PlaceBet_InsufficientBalance() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 30 days,
            "",
            0
        );
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        vm.expectRevert(Errors.TransferFailed.selector);
        market.placeBet(marketId, true, 1000000e6); // More than balance
        vm.stopPrank();
    }
    
    function test_PlaceBet_MarketNotActive() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 30 days,
            "",
            0
        );
        
        // Resolve market first
        vm.prank(address(oracle));
        market.resolveMarket(marketId, PredictionMarket.Outcome.Yes, 90);
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        vm.expectRevert(Errors.MarketNotActive.selector);
        market.placeBet(marketId, true, 100e6);
        vm.stopPrank();
    }
    
    // ============ Resolution Tests ============
    
    function test_ResolveMarket() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 1 days,
            "",
            0
        );
        
        vm.warp(block.timestamp + 2 days);
        
        vm.prank(user1);
        market.initiateResolution(marketId);
        
        vm.prank(address(oracle));
        market.resolveMarket(marketId, PredictionMarket.Outcome.Yes, 90);
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.status), uint256(PredictionMarket.MarketStatus.Resolved));
        assertEq(uint256(m.outcome), uint256(PredictionMarket.Outcome.Yes));
    }
    
    function test_ResolveMarket_LowConfidence() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 1 days,
            "",
            0
        );
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        market.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 2 days);
        vm.prank(user1);
        market.initiateResolution(marketId);
        
        vm.prank(address(oracle));
        market.resolveMarket(marketId, PredictionMarket.Outcome.Yes, 60); // Low confidence
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.status), uint256(PredictionMarket.MarketStatus.Disputed));
    }
    
    // ============ Claim Tests ============
    
    function test_ClaimWinnings() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 1 days,
            "",
            0
        );
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        market.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 2 days);
        vm.prank(user1);
        market.initiateResolution(marketId);
        
        vm.prank(address(oracle));
        market.resolveMarket(marketId, PredictionMarket.Outcome.Yes, 90);
        
        uint256 balanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        market.claimWinnings(marketId);
        uint256 balanceAfter = token.balanceOf(user1);
        
        assertGt(balanceAfter, balanceBefore);
    }
    
    function test_ClaimWinnings_AlreadyClaimed() public {
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test",
            "Test",
            block.timestamp + 1 days,
            "",
            0
        );
        
        vm.startPrank(user1);
        token.approve(address(market), 100e6);
        market.placeBet(marketId, true, 100e6);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 2 days);
        vm.prank(user1);
        market.initiateResolution(marketId);
        
        vm.prank(address(oracle));
        market.resolveMarket(marketId, PredictionMarket.Outcome.Yes, 90);
        
        vm.prank(user1);
        market.claimWinnings(marketId);
        
        vm.prank(user1);
        vm.expectRevert(Errors.AlreadyClaimed.selector);
        market.claimWinnings(marketId);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_PlaceBet(uint256 amount) public {
        vm.assume(amount >= 1e6 && amount <= 10000e6);
        
        vm.prank(user1);
        uint256 marketId = market.createMarket(
            "Test question with enough length",
            "Test",
            block.timestamp + 30 days,
            "",
            0
        );
        
        vm.assume(token.balanceOf(user1) >= amount);
        
        vm.startPrank(user1);
        token.approve(address(market), amount);
        market.placeBet(marketId, true, amount);
        vm.stopPrank();
        
        PredictionMarket.Position memory pos = market.getPosition(marketId, user1);
        assertGt(pos.yesShares, 0);
    }
}


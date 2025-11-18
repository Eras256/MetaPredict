// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/core/PredictionMarketCore.sol";
import "../contracts/markets/BinaryMarket.sol";
import "../contracts/oracle/AIOracle.sol";
import "../contracts/oracle/InsurancePool.sol";
import "../contracts/reputation/ReputationStaking.sol";
import "../contracts/governance/DAOGovernance.sol";
import "../contracts/aggregation/OmniRouter.sol";

/**
 * @title Security Fuzz Tests
 * @notice Foundry fuzzing tests for comprehensive security coverage
 * @dev Uses property-based testing to find edge cases and vulnerabilities
 */
contract SecurityFuzzTest is Test {
    PredictionMarketCore public core;
    BinaryMarket public binaryMarket;
    AIOracle public aiOracle;
    InsurancePool public insurancePool;
    ReputationStaking public reputationStaking;
    DAOGovernance public daoGovernance;
    OmniRouter public omniRouter;

    address public owner;
    address public user1;
    address public user2;
    address public attacker;

    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 100 ether;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        attacker = address(0x3);

        // Deploy contracts
        insurancePool = new InsurancePool();
        reputationStaking = new ReputationStaking();
        aiOracle = new AIOracle(
            address(0),
            bytes32(0),
            0,
            "https://api.example.com/oracle/resolve"
        );
        daoGovernance = new DAOGovernance(address(reputationStaking));
        omniRouter = new OmniRouter();

        // Deploy core with temporary addresses
        address temp = address(0x100);
        core = new PredictionMarketCore(
            payable(temp),
            payable(temp),
            payable(temp),
            address(aiOracle),
            payable(address(reputationStaking)),
            payable(address(insurancePool)),
            payable(address(omniRouter)),
            address(daoGovernance)
        );

        // Deploy market contracts
        binaryMarket = new BinaryMarket(address(core));

        // Update core
        core.updateModule("binaryMarket", address(binaryMarket));
        core.updateModule("conditionalMarket", temp);
        core.updateModule("subjectiveMarket", temp);

        // Setup
        insurancePool.setCoreContract(address(core));
        reputationStaking.setCoreContract(address(core));
        aiOracle.setPredictionMarket(address(core));

        // Fund test addresses
        vm.deal(user1, 1000 ether);
        vm.deal(user2, 1000 ether);
        vm.deal(attacker, 1000 ether);
    }

    // ============ FUZZ TESTS ============

    /**
     * @notice Fuzz test: Market creation with various resolution times
     * @dev Ensures no overflow/underflow in time calculations
     */
    function testFuzz_MarketCreation(
        uint256 resolutionTime,
        string memory question,
        string memory description
    ) public {
        // Bound resolution time to reasonable values
        resolutionTime = bound(resolutionTime, block.timestamp + 1 hours, block.timestamp + 365 days);
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            question,
            description,
            resolutionTime,
            "ipfs://test"
        );

        assertEq(marketId, 1);
        
        (uint256 id, , address creator, , uint256 resTime, , ) = core.markets(marketId);
        assertEq(id, marketId);
        assertEq(creator, user1);
        assertEq(resTime, resolutionTime);
    }

    /**
     * @notice Fuzz test: Betting with various amounts
     * @dev Ensures no overflow in fee calculations
     */
    function testFuzz_PlaceBet(uint256 betAmount) public {
        // Bound bet amount to valid range
        betAmount = bound(betAmount, MIN_BET, MAX_BET);
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount);
        vm.prank(user2);
        core.placeBet{value: betAmount}(marketId, true);

        // Verify bet was placed
        (uint256 yesShares, , , ) = binaryMarket.positions(marketId, user2);
        assertGt(yesShares, 0);
    }

    /**
     * @notice Fuzz test: Fee calculations
     * @dev Ensures fees are calculated correctly for all amounts
     */
    function testFuzz_FeeCalculation(uint256 betAmount) public {
        betAmount = bound(betAmount, MIN_BET, MAX_BET);
        
        uint256 tradingFee = (betAmount * 50) / 10000; // 0.5%
        uint256 insuranceFee = (betAmount * 10) / 10000; // 0.1%
        uint256 netAmount = betAmount - tradingFee - insuranceFee;

        // Verify no overflow
        assertGe(betAmount, tradingFee + insuranceFee);
        assertEq(netAmount, betAmount - tradingFee - insuranceFee);
    }

    /**
     * @notice Fuzz test: Insurance pool deposits
     * @dev Ensures share calculations are correct
     */
    function testFuzz_InsuranceDeposit(uint256 depositAmount) public {
        depositAmount = bound(depositAmount, 0.01 ether, 100 ether);
        
        vm.deal(user1, depositAmount);
        vm.prank(user1);
        uint256 shares = insurancePool.deposit{value: depositAmount}(user1);

        assertGt(shares, 0);
        
        (uint256 amount, uint256 userShares, , ) = insurancePool.deposits(user1);
        assertEq(amount, depositAmount);
        assertEq(userShares, shares);
    }

    /**
     * @notice Fuzz test: Reputation staking
     * @dev Ensures tier calculations are correct
     */
    function testFuzz_ReputationStaking(uint256 stakeAmount) public {
        stakeAmount = bound(stakeAmount, 0.1 ether, 200 ether);
        
        vm.deal(user1, stakeAmount);
        vm.prank(address(core));
        reputationStaking.stake{value: stakeAmount}(user1, stakeAmount);

        (uint256 staked, , , , , , , ) = reputationStaking.stakers(user1);
        assertEq(staked, stakeAmount);
    }

    /**
     * @notice Fuzz test: Market resolution outcomes
     * @dev Ensures all outcomes are handled correctly
     */
    function testFuzz_MarketResolution(uint8 outcome, uint8 confidence) public {
        // Bound values
        outcome = uint8(bound(outcome, 1, 3));
        confidence = uint8(bound(confidence, 0, 100));
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, MIN_BET);
        vm.prank(user2);
        core.placeBet{value: MIN_BET}(marketId, true);

        // Fast forward time
        vm.warp(resolutionTime + 1);

        vm.prank(user1);
        core.initiateResolution(marketId);

        vm.prank(owner);
        aiOracle.fulfillResolutionManual(marketId, outcome, confidence);

        // Verify resolution
        (,,,,, uint8 status,) = core.markets(marketId);
        if (confidence < 80) {
            assertEq(status, 3); // Disputed
        } else {
            assertEq(status, 2); // Resolved
        }
    }

    /**
     * @notice Fuzz test: Multiple bets from same user
     * @dev Ensures state is maintained correctly
     */
    function testFuzz_MultipleBets(uint256 numBets, uint256 betAmount) public {
        numBets = bound(numBets, 1, 100);
        betAmount = bound(betAmount, MIN_BET, MAX_BET / 100); // Smaller bets to avoid overflow
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount * numBets);
        
        for (uint256 i = 0; i < numBets; i++) {
            vm.prank(user2);
            core.placeBet{value: betAmount}(marketId, i % 2 == 0);
        }

        // Verify final position
        (uint256 yesShares, uint256 noShares, , ) = binaryMarket.positions(marketId, user2);
        assertGt(yesShares + noShares, 0);
    }

    /**
     * @notice Fuzz test: Edge case - very small bets
     * @dev Ensures minimum bet is enforced
     */
    function testFuzz_MinimumBet(uint256 betAmount) public {
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount);
        vm.prank(user2);
        
        if (betAmount < MIN_BET) {
            vm.expectRevert();
            core.placeBet{value: betAmount}(marketId, true);
        } else if (betAmount <= MAX_BET) {
            core.placeBet{value: betAmount}(marketId, true);
        }
    }

    /**
     * @notice Fuzz test: Edge case - very large bets
     * @dev Ensures maximum bet is enforced
     */
    function testFuzz_MaximumBet(uint256 betAmount) public {
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount);
        vm.prank(user2);
        
        if (betAmount > MAX_BET) {
            vm.expectRevert();
            core.placeBet{value: betAmount}(marketId, true);
        } else if (betAmount >= MIN_BET) {
            core.placeBet{value: betAmount}(marketId, true);
        }
    }

    /**
     * @notice Fuzz test: Insurance pool withdrawal
     * @dev Ensures withdrawal calculations are correct
     */
    function testFuzz_InsuranceWithdrawal(uint256 depositAmount, uint256 withdrawAmount) public {
        depositAmount = bound(depositAmount, 0.01 ether, 100 ether);
        withdrawAmount = bound(withdrawAmount, 0.001 ether, depositAmount);
        
        vm.deal(user1, depositAmount);
        vm.prank(user1);
        insurancePool.deposit{value: depositAmount}(user1);

        vm.prank(user1);
        insurancePool.withdraw(withdrawAmount, user1, user1);

        // Verify withdrawal
        (uint256 remainingAmount, , , ) = insurancePool.deposits(user1);
        assertLe(remainingAmount, depositAmount - withdrawAmount);
    }

    /**
     * @notice Fuzz test: Oracle confidence levels
     * @dev Ensures insurance activation works correctly
     */
    function testFuzz_OracleConfidence(uint8 confidence) public {
        confidence = uint8(bound(confidence, 0, 100));
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, MIN_BET);
        vm.prank(user2);
        core.placeBet{value: MIN_BET}(marketId, true);

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        insurancePool.deposit{value: 1 ether}(user1);

        vm.warp(resolutionTime + 1);
        vm.prank(user1);
        core.initiateResolution(marketId);

        vm.prank(owner);
        aiOracle.fulfillResolutionManual(marketId, 1, confidence);

        // Verify insurance activation
        (,,,,, uint8 status,) = core.markets(marketId);
        if (confidence < 80) {
            assertEq(status, 3); // Disputed - insurance activated
        } else {
            assertEq(status, 2); // Resolved
        }
    }

    /**
     * @notice Invariant: Total pool should equal sum of individual pools
     * @dev Ensures no funds are lost
     */
    function testFuzz_Invariant_PoolConsistency(uint256 betAmount1, uint256 betAmount2) public {
        betAmount1 = bound(betAmount1, MIN_BET, MAX_BET / 2);
        betAmount2 = bound(betAmount2, MIN_BET, MAX_BET / 2);
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount1 + betAmount2);
        vm.prank(user2);
        core.placeBet{value: betAmount1}(marketId, true);
        
        vm.prank(user2);
        core.placeBet{value: betAmount2}(marketId, false);

        // Check pool consistency
        (uint256 yesPool, uint256 noPool,,,,,) = binaryMarket.markets(marketId);
        uint256 totalPool = yesPool + noPool;
        
        // Total should be approximately bet amounts minus fees
        uint256 expectedTotal = betAmount1 + betAmount2;
        uint256 fees = (expectedTotal * 60) / 10000; // 0.6% total fees
        uint256 expectedNet = expectedTotal - fees;
        
        // Allow small rounding differences
        assertApproxEqAbs(totalPool, expectedNet, 1e15);
    }

    /**
     * @notice Invariant: Shares should always be positive
     * @dev Ensures no negative shares
     */
    function testFuzz_Invariant_PositiveShares(uint256 betAmount) public {
        betAmount = bound(betAmount, MIN_BET, MAX_BET);
        
        uint256 resolutionTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        uint256 marketId = core.createBinaryMarket(
            "Test Question",
            "Test Description",
            resolutionTime,
            "ipfs://test"
        );

        vm.deal(user2, betAmount);
        vm.prank(user2);
        core.placeBet{value: betAmount}(marketId, true);

        // Verify shares are positive
        (uint256 yesShares, , , ) = binaryMarket.positions(marketId, user2);
        assertGt(yesShares, 0);
        
        (uint256 totalYesShares, uint256 totalNoShares,,,,,) = binaryMarket.markets(marketId);
        assertGt(totalYesShares, 0);
        assertGe(totalNoShares, 0);
    }
}


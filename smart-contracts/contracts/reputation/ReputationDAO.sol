// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@chainlink/contracts/src/v0.8/ccip/client/CCIPReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationDAO
 * @notice Cross-protocol reputation staking with economic penalties
 * @dev Slash amount = Base Stake × (Market Size / $1M) × (1 - Reputation Score)
 */
contract ReputationDAO is CCIPReceiver, Ownable {
    struct ReputationScore {
        uint256 stake;
        uint256 accuracy; // 0-100
        uint256 disputesWon;
        uint256 slashesIncurred;
        bool isMember;
        uint256 joinedAt;
    }

    struct DisputeParticipation {
        uint256 marketId;
        uint256 confidence; // 0-100
        bool wasCorrect;
        uint256 timestamp;
    }

    mapping(address => ReputationScore) public reputationScores;
    mapping(address => DisputeParticipation[]) public participationHistory;
    mapping(address => bool) public isSlashed;

    uint256 public minimumStake = 100e18; // 100 USDC
    uint256 public slashingPercentage = 20; // 20% base

    event MemberAdmitted(address indexed user, uint256 stake);
    event ReputationUpdated(address indexed user, uint256 accuracy);
    event StakesSlashed(
        address indexed user,
        uint256 amount,
        uint256 marketSize
    );
    event ReputationPortedCrossChain(
        address indexed user,
        uint256 score,
        uint256 chainId
    );

    constructor(address _router) CCIPReceiver(_router) Ownable(msg.sender) {}

    /**
     * @notice Join reputation DAO with stake
     */
    function joinDAO(uint256 _stakeAmount) external {
        require(_stakeAmount >= minimumStake, "Stake too low");
        require(
            !reputationScores[msg.sender].isMember,
            "Already member"
        );

        // In production: Transfer _stakeAmount USDC to contract
        // IERC20(usdcAddress).transferFrom(msg.sender, address(this), _stakeAmount);

        reputationScores[msg.sender] = ReputationScore({
            stake: _stakeAmount,
            accuracy: 50, // Start at 50%
            disputesWon: 0,
            slashesIncurred: 0,
            isMember: true,
            joinedAt: block.timestamp
        });

        emit MemberAdmitted(msg.sender, _stakeAmount);
    }

    /**
     * @notice Update reputation after dispute resolution
     */
    function updateReputation(
        address _user,
        bool _wasCorrect,
        uint256 _marketSize,
        uint256 _confidence
    ) external onlyOwner {
        require(reputationScores[_user].isMember, "Not member");

        ReputationScore storage score = reputationScores[_user];

        participationHistory[_user].push(
            DisputeParticipation({
                marketId: 0, // Would come from market ID
                confidence: _confidence,
                wasCorrect: _wasCorrect,
                timestamp: block.timestamp
            })
        );

        if (_wasCorrect) {
            score.accuracy = (score.accuracy * 3 + 100) / 4; // Bayesian update
            score.disputesWon++;
        } else {
            score.accuracy = (score.accuracy * 3 + 0) / 4; // Bayesian update down
            _slashStake(_user, _marketSize, _confidence);
        }

        emit ReputationUpdated(_user, score.accuracy);
    }

    /**
     * @notice Internal: Slash stake based on market size and reputation
     */
    function _slashStake(
        address _user,
        uint256 _marketSize,
        uint256 _confidence
    ) internal {
        ReputationScore storage score = reputationScores[_user];

        // Slash formula: Base × (Market/1M) × (1 - Reputation%) × Confidence%
        uint256 marketMultiplier = _marketSize / 1e6; // Market size in millions
        if (marketMultiplier == 0) marketMultiplier = 1; // Minimum 1x

        uint256 reputationMultiplier = (100 - score.accuracy);
        uint256 slashAmount = (score.stake *
            marketMultiplier *
            reputationMultiplier *
            _confidence) / 1000000; // 100 * 100 * 100

        if (slashAmount > score.stake) {
            slashAmount = score.stake; // Cap at stake amount
        }

        score.stake -= slashAmount;
        score.slashesIncurred++;

        if (score.stake < minimumStake) {
            score.isMember = false;
            isSlashed[_user] = true;
        }

        emit StakesSlashed(_user, slashAmount, _marketSize);
    }

    /**
     * @notice Get reputation score for user
     */
    function getReputation(
        address _user
    ) external view returns (ReputationScore memory) {
        return reputationScores[_user];
    }

    /**
     * @notice Port reputation cross-chain via CCIP
     */
    function portReputationCrossChain(
        uint256 _destinationChainId
    ) external {
        ReputationScore memory score = reputationScores[msg.sender];
        require(score.isMember, "Not member");

        // In production: Call Chainlink CCIP to sync reputation
        emit ReputationPortedCrossChain(
            msg.sender,
            score.accuracy,
            _destinationChainId
        );
    }

    /**
     * @notice Handle CCIP message from other chains
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        // Handle cross-chain reputation sync
        // Simplified for MVP
    }
}


// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SubjectiveMarket
 * @notice Subjective prediction markets with DAO voting
 * @dev Uses quadratic voting: influence = sqrt(stake)
 */
contract SubjectiveMarket is Ownable {
    struct SubjectiveMarketData {
        string description;
        uint256 deadline;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes; // 0-100 score
        mapping(address => uint256) stakes;
        uint256 medianOutcome;
        bool resolved;
    }

    mapping(uint256 => SubjectiveMarketData) public subjectiveMarkets;
    mapping(uint256 => address[]) public voters;
    mapping(uint256 => uint256[]) public voteValues;

    uint256 public marketCounter;

    event SubjectiveMarketCreated(
        uint256 indexed marketId,
        string description,
        uint256 deadline
    );
    event VoteSubmitted(
        uint256 indexed marketId,
        address indexed voter,
        uint256 score,
        uint256 stake
    );
    event SubjectiveResolved(
        uint256 indexed marketId,
        uint256 medianOutcome
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create subjective market
     */
    function createSubjectiveMarket(
        string memory _description,
        uint256 _deadline
    ) external returns (uint256) {
        uint256 marketId = marketCounter++;
        SubjectiveMarketData storage market = subjectiveMarkets[marketId];

        market.description = _description;
        market.deadline = _deadline;
        market.resolved = false;

        emit SubjectiveMarketCreated(marketId, _description, _deadline);
        return marketId;
    }

    /**
     * @notice Submit vote with stake (quadratic voting)
     */
    function submitVote(
        uint256 _marketId,
        uint256 _score, // 0-100
        uint256 _stake
    ) external {
        SubjectiveMarketData storage market = subjectiveMarkets[_marketId];
        require(block.timestamp < market.deadline, "Voting closed");
        require(!market.hasVoted[msg.sender], "Already voted");
        require(_score <= 100, "Invalid score");

        // Quadratic voting: influence = sqrt(stake)
        market.hasVoted[msg.sender] = true;
        market.votes[msg.sender] = _score;
        market.stakes[msg.sender] = _stake;

        voters[_marketId].push(msg.sender);
        voteValues[_marketId].push(_score);

        emit VoteSubmitted(_marketId, msg.sender, _score, _stake);
    }

    /**
     * @notice Resolve subjective market (calculate median)
     */
    function resolveSubjective(uint256 _marketId) external onlyOwner {
        SubjectiveMarketData storage market = subjectiveMarkets[_marketId];
        require(block.timestamp >= market.deadline, "Not expired");
        require(!market.resolved, "Already resolved");

        uint256[] memory votes = voteValues[_marketId];
        require(votes.length > 0, "No votes");

        // Calculate median
        uint256[] memory sortedVotes = _sortArray(votes);
        uint256 median;

        if (sortedVotes.length % 2 == 0) {
            median =
                (sortedVotes[sortedVotes.length / 2 - 1] +
                    sortedVotes[sortedVotes.length / 2]) /
                2;
        } else {
            median = sortedVotes[sortedVotes.length / 2];
        }

        market.medianOutcome = median;
        market.resolved = true;

        emit SubjectiveResolved(_marketId, median);
    }

    /**
     * @notice Internal: Sort array for median calculation
     */
    function _sortArray(
        uint256[] memory arr
    ) internal pure returns (uint256[] memory) {
        uint256[] memory sorted = new uint256[](arr.length);
        for (uint256 i = 0; i < arr.length; i++) {
            sorted[i] = arr[i];
        }

        // Bubble sort (simplified for MVP)
        for (uint256 i = 0; i < sorted.length; i++) {
            for (uint256 j = 0; j < sorted.length - i - 1; j++) {
                if (sorted[j] > sorted[j + 1]) {
                    (sorted[j], sorted[j + 1]) = (sorted[j + 1], sorted[j]);
                }
            }
        }

        return sorted;
    }
}


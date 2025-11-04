// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConditionalMarket
 * @notice Conditional prediction markets (IF-THEN logic)
 * @dev Child markets only resolve if parent market resolves to specific outcome
 */
contract ConditionalMarket is ERC1155, Ownable {
    struct ConditionalMarketData {
        uint256 parentMarketId;
        uint256 parentOutcome; // YES or NO
        string description;
        uint256 deadline;
        bool isResolved;
        uint256 resolution;
        mapping(uint256 => uint256) liquidityByOutcome;
        uint256 totalLiquidity;
    }

    mapping(uint256 => ConditionalMarketData) public conditionalMarkets;
    mapping(uint256 => bool) public parentMarketResolved;
    mapping(uint256 => uint256) public parentMarketOutcome;

    uint256 public marketCounter;

    event ConditionalMarketCreated(
        uint256 indexed marketId,
        uint256 parentMarketId,
        uint256 parentOutcome,
        string description
    );
    event PositionsMinted(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    event ConditionalResolved(uint256 indexed marketId, uint256 outcome);

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @notice Create conditional market (only if parent resolved)
     */
    function createConditionalMarket(
        uint256 _parentMarketId,
        uint256 _parentOutcome,
        string memory _description,
        uint256 _deadline
    ) external returns (uint256) {
        require(parentMarketResolved[_parentMarketId], "Parent not resolved");
        require(
            parentMarketOutcome[_parentMarketId] == _parentOutcome,
            "Wrong outcome"
        );

        uint256 marketId = marketCounter++;

        ConditionalMarketData storage market = conditionalMarkets[marketId];

        market.parentMarketId = _parentMarketId;
        market.parentOutcome = _parentOutcome;
        market.description = _description;
        market.deadline = _deadline;

        emit ConditionalMarketCreated(
            marketId,
            _parentMarketId,
            _parentOutcome,
            _description
        );

        return marketId;
    }

    /**
     * @notice Buy conditional position (YES/NO)
     */
    function buyConditionalPosition(
        uint256 _marketId,
        uint256 _outcome, // 0 = NO, 1 = YES
        uint256 _amount
    ) external {
        ConditionalMarketData storage market = conditionalMarkets[_marketId];
        require(!market.isResolved, "Market resolved");
        require(block.timestamp < market.deadline, "Market expired");
        require(_outcome == 0 || _outcome == 1, "Invalid outcome");

        // Mint conditional position tokens
        _mint(msg.sender, _marketId * 2 + _outcome, _amount, "");

        market.liquidityByOutcome[_outcome] += _amount;
        market.totalLiquidity += _amount;

        emit PositionsMinted(_marketId, msg.sender, _amount);
    }

    /**
     * @notice Resolve conditional market
     */
    function resolveConditional(
        uint256 _marketId,
        uint256 _outcome
    ) external onlyOwner {
        ConditionalMarketData storage market = conditionalMarkets[_marketId];
        require(!market.isResolved, "Already resolved");
        require(block.timestamp >= market.deadline, "Not expired");

        market.isResolved = true;
        market.resolution = _outcome;

        emit ConditionalResolved(_marketId, _outcome);
    }

    /**
     * @notice Set parent market resolution (called by oracle)
     */
    function setParentResolution(
        uint256 _parentMarketId,
        uint256 _outcome
    ) external onlyOwner {
        parentMarketResolved[_parentMarketId] = true;
        parentMarketOutcome[_parentMarketId] = _outcome;
    }
}


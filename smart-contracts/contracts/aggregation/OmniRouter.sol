// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@chainlink/contracts/src/v0.8/ccip/client/CCIPReceiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title OmniRouter
 * @notice Cross-chain liquidity aggregator for prediction markets
 * @dev Routes bets to best price across Polymarket, Kalshi, Azuro, etc.
 */
contract OmniRouter is CCIPReceiver, ERC721 {
    struct RouteOptimization {
        address platform;
        uint256 odds;
        uint256 gasCost;
        uint256 bridgeCost;
        uint256 slippage;
        uint256 totalCost;
    }

    struct AggregatedPrice {
        uint256 bestOdds;
        address bestPlatform;
        uint256 savings;
        uint256 routeCost;
    }

    struct Position {
        address platform;
        uint256 amount;
        uint256 odds;
        string marketDescription;
        uint256 executedAt;
    }

    mapping(address => Position[]) public userPortfolio;
    mapping(bytes32 => RouteOptimization[]) public routeCache;

    uint256 public nextPositionId;

    event RoutesCompared(string market, uint256 routeCount);
    event BetExecuted(
        address indexed user,
        address platform,
        uint256 amount,
        uint256 bestOdds
    );

    constructor(
        address _router
    ) CCIPReceiver(_router) ERC721("OmniMarket Position", "OMP") {}

    /**
     * @notice Get price comparison across platforms
     */
    function getPriceComparison(
        string memory _marketDescription
    ) external returns (AggregatedPrice memory) {
        RouteOptimization[] storage routes = routeCache[
            keccak256(abi.encode(_marketDescription))
        ];

        uint256 bestOdds = 0;
        address bestPlatform = address(0);
        uint256 minCost = type(uint256).max;

        for (uint256 i = 0; i < routes.length; i++) {
            uint256 totalCost = routes[i].gasCost +
                routes[i].bridgeCost +
                routes[i].slippage;

            if (routes[i].odds > bestOdds && totalCost < minCost) {
                bestOdds = routes[i].odds;
                bestPlatform = routes[i].platform;
                minCost = totalCost;
            }
        }

        emit RoutesCompared(_marketDescription, routes.length);

        return
            AggregatedPrice({
                bestOdds: bestOdds,
                bestPlatform: bestPlatform,
                savings: type(uint256).max - minCost,
                routeCost: minCost
            });
    }

    /**
     * @notice Execute best route
     */
    function executeBestRoute(
        string memory _marketDescription,
        uint256 _betAmount,
        bool _isYes
    ) external {
        AggregatedPrice memory price = this.getPriceComparison(_marketDescription);
        require(price.bestPlatform != address(0), "No route found");

        // Execute trade on best platform
        // If cross-chain: Use Chainlink CCIP

        userPortfolio[msg.sender].push(
            Position({
                platform: price.bestPlatform,
                amount: _betAmount,
                odds: price.bestOdds,
                marketDescription: _marketDescription,
                executedAt: block.timestamp
            })
        );

        // Mint position NFT for portfolio tracking
        _mint(msg.sender, nextPositionId++);

        emit BetExecuted(
            msg.sender,
            price.bestPlatform,
            _betAmount,
            price.bestOdds
        );
    }

    /**
     * @notice Get user portfolio
     */
    function getPortfolio(
        address _user
    ) external view returns (Position[] memory) {
        return userPortfolio[_user];
    }

    /**
     * @notice Handle CCIP message from other chains
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        // Handle cross-chain position sync
        // Simplified for MVP
    }
}


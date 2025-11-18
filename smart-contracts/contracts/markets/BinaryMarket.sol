// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BinaryMarket
 * @notice Mercado de predicción binario estándar (YES/NO)
 * @dev Usa BNB nativo en lugar de tokens ERC20
 */
contract BinaryMarket is Ownable, ReentrancyGuard {
    address public immutable coreContract;
    
    struct Market {
        string question;
        string description;
        uint256 resolutionTime;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        uint8 outcome; // 1=Yes, 2=No, 3=Invalid
    }
    
    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 avgYesPrice;
        uint256 avgNoPrice;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 shares
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        uint8 outcome
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    constructor(address _coreContract) 
        Ownable(msg.sender) 
    {
        coreContract = _coreContract;
    }
    
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core");
        _;
    }
    
    function createMarket(
        uint256 _marketId,
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata // _metadata unused here
    ) external onlyCore {
        markets[_marketId] = Market({
            question: _question,
            description: _description,
            resolutionTime: _resolutionTime,
            totalYesShares: 0,
            totalNoShares: 0,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcome: 0
        });
    }
    
    function placeBet(
        uint256 _marketId,
        address _user,
        bool _isYes,
        uint256 _amount
    ) external payable onlyCore nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(msg.value == _amount, "Amount mismatch");
        
        // Calculate shares (constant product AMM)
        uint256 shares = _calculateShares(market, _isYes, _amount);
        uint256 avgPrice = (_amount * 1e18) / shares;
        
        if (_isYes) {
            market.yesPool += _amount;
            market.totalYesShares += shares;
            positions[_marketId][_user].yesShares += shares;
            positions[_marketId][_user].avgYesPrice = _calculateAvgPrice(
                positions[_marketId][_user].avgYesPrice,
                positions[_marketId][_user].yesShares - shares,
                avgPrice,
                shares
            );
        } else {
            market.noPool += _amount;
            market.totalNoShares += shares;
            positions[_marketId][_user].noShares += shares;
            positions[_marketId][_user].avgNoPrice = _calculateAvgPrice(
                positions[_marketId][_user].avgNoPrice,
                positions[_marketId][_user].noShares - shares,
                avgPrice,
                shares
            );
        }
        
        emit BetPlaced(_marketId, _user, _isYes, _amount, shares);
    }
    
    function resolveMarket(uint256 _marketId, uint8 _outcome) 
        external 
        onlyCore 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        
        market.resolved = true;
        market.outcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }
    
    function claimWinnings(uint256 _marketId) 
        external 
        nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        require(
            position.yesShares > 0 || position.noShares > 0,
            "No position"
        );
        
        uint256 payout = 0;
        
        if (market.outcome == 1 && position.yesShares > 0) {
            payout = (position.yesShares * (market.yesPool + market.noPool)) / 
                     market.totalYesShares;
        } else if (market.outcome == 2 && position.noShares > 0) {
            payout = (position.noShares * (market.yesPool + market.noPool)) / 
                     market.totalNoShares;
        } else if (market.outcome == 3) {
            uint256 yesInvested = (position.yesShares * position.avgYesPrice) / 1e18;
            uint256 noInvested = (position.noShares * position.avgNoPrice) / 1e18;
            payout = yesInvested + noInvested;
        }
        
        require(payout > 0, "No winnings");
        
        position.claimed = true;
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, payout);
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
    
    function _calculateShares(
        Market storage market,
        bool _isYes,
        uint256 _amount
    ) internal view returns (uint256) {
        uint256 pool = _isYes ? market.yesPool : market.noPool;
        uint256 totalShares = _isYes ? market.totalYesShares : market.totalNoShares;
        
        if (totalShares == 0) {
            return _amount;
        }
        
        return (_amount * totalShares) / pool;
    }
    
    function _calculateAvgPrice(
        uint256 _oldAvg,
        uint256 _oldShares,
        uint256 _newPrice,
        uint256 _newShares
    ) internal pure returns (uint256) {
        if (_oldShares == 0) return _newPrice;
        
        return ((_oldAvg * _oldShares) + (_newPrice * _newShares)) / 
               (_oldShares + _newShares);
    }
    
    function getMarket(uint256 _marketId) 
        external 
        view 
        returns (Market memory) 
    {
        return markets[_marketId];
    }
    
    function getPosition(uint256 _marketId, address _user) 
        external 
        view 
        returns (Position memory) 
    {
        return positions[_marketId][_user];
    }
    
    function getCurrentOdds(uint256 _marketId) 
        external 
        view 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market storage market = markets[_marketId];
        
        uint256 totalPool = market.yesPool + market.noPool;
        if (totalPool == 0) return (5000, 5000);
        
        yesOdds = (market.yesPool * 10000) / totalPool;
        noOdds = (market.noPool * 10000) / totalPool;
    }
}


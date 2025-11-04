// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ConditionalMarket
 * @notice Mercados condicionales en árbol (if-then predictions)
 * @dev Parent market debe resolverse antes que child markets
 */
contract ConditionalMarket is Ownable, ReentrancyGuard {
    IERC20 public immutable bettingToken;
    address public immutable coreContract;
    
    struct Market {
        uint256 parentMarketId;
        string condition; // "if YES on parent", "if NO on parent"
        string question;
        uint256 resolutionTime;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 yesPool;
        uint256 noPool;
        bool parentResolved;
        bool conditionMet;
        bool resolved;
        uint8 outcome;
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
    mapping(uint256 => uint256[]) public childMarkets; // parent => children
    
    event ConditionalMarketCreated(
        uint256 indexed marketId,
        uint256 indexed parentMarketId,
        string condition
    );
    
    event ParentResolved(
        uint256 indexed marketId,
        bool conditionMet
    );
    
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
    
    constructor(address _bettingToken, address _coreContract) 
        Ownable(msg.sender) 
    {
        bettingToken = IERC20(_bettingToken);
        coreContract = _coreContract;
    }
    
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core");
        _;
    }
    
    function createMarket(
        uint256 _marketId,
        uint256 _parentMarketId,
        string calldata _condition,
        string calldata _question,
        uint256 _resolutionTime,
        string calldata // _metadata
    ) external onlyCore {
        markets[_marketId] = Market({
            parentMarketId: _parentMarketId,
            condition: _condition,
            question: _question,
            resolutionTime: _resolutionTime,
            totalYesShares: 0,
            totalNoShares: 0,
            yesPool: 0,
            noPool: 0,
            parentResolved: false,
            conditionMet: false,
            resolved: false,
            outcome: 0
        });
        
        childMarkets[_parentMarketId].push(_marketId);
        
        emit ConditionalMarketCreated(_marketId, _parentMarketId, _condition);
    }
    
    function placeBet(
        uint256 _marketId,
        address _user,
        bool _isYes,
        uint256 _amount
    ) external onlyCore nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(!market.parentResolved, "Awaiting parent");
        
        // Transfer from core
        require(
            bettingToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Calculate shares
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
    
    /**
     * @notice Notifica cuando parent market se resuelve
     */
    function notifyParentResolution(
        uint256 _parentMarketId,
        uint8 _parentOutcome
    ) external onlyCore {
        uint256[] memory children = childMarkets[_parentMarketId];
        
        for (uint256 i = 0; i < children.length; i++) {
            uint256 childId = children[i];
            Market storage child = markets[childId];
            
            child.parentResolved = true;
            
            // Check if condition met
            if (
                (keccak256(bytes(child.condition)) == keccak256("if YES") && _parentOutcome == 1) ||
                (keccak256(bytes(child.condition)) == keccak256("if NO") && _parentOutcome == 2)
            ) {
                child.conditionMet = true;
            } else {
                // Condition not met: refund all bets
                child.resolved = true;
                child.outcome = 3; // Invalid
            }
            
            emit ParentResolved(childId, child.conditionMet);
        }
    }
    
    function resolveMarket(uint256 _marketId, uint8 _outcome) 
        external 
        onlyCore 
    {
        Market storage market = markets[_marketId];
        require(market.conditionMet, "Condition not met");
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
        
        uint256 payout = 0;
        
        if (market.outcome == 1 && position.yesShares > 0) {
            payout = (position.yesShares * (market.yesPool + market.noPool)) / 
                     market.totalYesShares;
        } else if (market.outcome == 2 && position.noShares > 0) {
            payout = (position.noShares * (market.yesPool + market.noPool)) / 
                     market.totalNoShares;
        } else if (market.outcome == 3 || !market.conditionMet) {
            // Refund
            uint256 yesInvested = (position.yesShares * position.avgYesPrice) / 1e18;
            uint256 noInvested = (position.noShares * position.avgNoPrice) / 1e18;
            payout = yesInvested + noInvested;
        }
        
        require(payout > 0, "No winnings");
        
        position.claimed = true;
        
        require(
            bettingToken.transfer(msg.sender, payout),
            "Transfer failed"
        );
    }
    
    function _calculateShares(
        Market storage market,
        bool _isYes,
        uint256 _amount
    ) internal view returns (uint256) {
        uint256 pool = _isYes ? market.yesPool : market.noPool;
        uint256 totalShares = _isYes ? market.totalYesShares : market.totalNoShares;
        
        if (totalShares == 0) return _amount;
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
    
    function getChildMarkets(uint256 _parentMarketId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return childMarkets[_parentMarketId];
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
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SubjectiveMarket
 * @notice Mercados subjetivos resueltos por expertos via DAO voting
 * @dev Requiere expertise verification y quadratic voting
 */
contract SubjectiveMarket is Ownable, ReentrancyGuard {
    IERC20 public immutable bettingToken;
    address public immutable coreContract;
    address public immutable daoGovernance;
    
    struct Market {
        string question;
        string description;
        uint256 resolutionTime;
        string expertiseRequired; // "film critics", "economists", etc.
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 yesPool;
        uint256 noPool;
        bool votingStarted;
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
    
    event SubjectiveMarketCreated(
        uint256 indexed marketId,
        string expertiseRequired
    );
    
    event VotingStarted(
        uint256 indexed marketId,
        uint256 startTime
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
    
    constructor(
        address _bettingToken,
        address _coreContract,
        address _daoGovernance
    ) Ownable(msg.sender) {
        bettingToken = IERC20(_bettingToken);
        coreContract = _coreContract;
        daoGovernance = _daoGovernance;
    }
    
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core");
        _;
    }
    
    modifier onlyDAO() {
        require(msg.sender == daoGovernance, "Only DAO");
        _;
    }
    
    function createMarket(
        uint256 _marketId,
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata _expertiseRequired,
        string calldata // _metadata
    ) external onlyCore {
        markets[_marketId] = Market({
            question: _question,
            description: _description,
            resolutionTime: _resolutionTime,
            expertiseRequired: _expertiseRequired,
            totalYesShares: 0,
            totalNoShares: 0,
            yesPool: 0,
            noPool: 0,
            votingStarted: false,
            resolved: false,
            outcome: 0
        });
        
        emit SubjectiveMarketCreated(_marketId, _expertiseRequired);
    }
    
    function placeBet(
        uint256 _marketId,
        address _user,
        bool _isYes,
        uint256 _amount
    ) external onlyCore nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(!market.votingStarted, "Voting started");
        
        require(
            bettingToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
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
    
    function startVoting(uint256 _marketId) external onlyDAO {
        Market storage market = markets[_marketId];
        require(!market.votingStarted, "Already started");
        require(block.timestamp >= market.resolutionTime, "Not ready");
        
        market.votingStarted = true;
        
        emit VotingStarted(_marketId, block.timestamp);
    }
    
    function resolveMarket(uint256 _marketId, uint8 _outcome) 
        external 
        onlyDAO 
    {
        Market storage market = markets[_marketId];
        require(market.votingStarted, "Voting not started");
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
        } else if (market.outcome == 3) {
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

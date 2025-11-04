// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../oracle/AIOracle.sol";
import "../oracle/InsurancePool.sol";
import "../libraries/MarketMath.sol";
import "../libraries/Errors.sol";

/**
 * @title PredictionMarket
 * @notice Mercado de predicción con AI oracle y seguro contra manipulación
 * @dev Compatible con opBNB, optimizado para gas ultra-bajo
 */
contract PredictionMarket is Ownable, ReentrancyGuard, Pausable {
    // ============ State Variables ============
    
    IERC20 public immutable bettingToken; // USDC/USDT en opBNB
    AIOracle public immutable aiOracle;
    InsurancePool public immutable insurancePool;
    
    uint256 public marketCounter;
    uint256 public constant FEE_BASIS_POINTS = 50; // 0.5% fee
    uint256 public constant INSURANCE_FEE_BP = 10; // 0.1% insurance premium
    uint256 public constant MIN_BET = 1e6; // $1 minimum (6 decimals USDC)
    uint256 public constant MAX_BET = 10_000e6; // $10,000 max per bet
    
    // ============ Structs ============
    
    struct Market {
        uint256 id;
        string question;
        string description;
        address creator;
        uint256 createdAt;
        uint256 resolutionTime;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 yesPool;
        uint256 noPool;
        uint256 insuranceReserve;
        MarketStatus status;
        Outcome outcome;
        string metadata; // IPFS hash
        uint256 pythPriceId; // ✅ NEW: Pyth price ID para validación
    }
    
    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 avgYesPrice;
        uint256 avgNoPrice;
        bool claimed;
    }
    
    enum MarketStatus { Active, Resolving, Resolved, Disputed, Cancelled }
    enum Outcome { Pending, Yes, No, Invalid }
    
    // ============ Mappings ============
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => uint256[]) public userMarkets;
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        address indexed creator,
        uint256 resolutionTime,
        uint256 pythPriceId
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 shares,
        uint256 price
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        Outcome outcome,
        uint256 timestamp
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    event InsuranceClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    // ============ Constructor ============
    
    constructor(
        address _bettingToken,
        address _aiOracle,
        address _insurancePool
    ) Ownable(msg.sender) {
        if (_bettingToken == address(0)) revert Errors.InvalidAmount();
        if (_aiOracle == address(0)) revert Errors.InvalidAmount();
        if (_insurancePool == address(0)) revert Errors.InvalidAmount();
        
        bettingToken = IERC20(_bettingToken);
        aiOracle = AIOracle(payable(_aiOracle));
        insurancePool = InsurancePool(_insurancePool);
    }
    
    // ============ Market Creation ============
    
    /**
     * @notice Crea un nuevo mercado de predicción
     * @param _question Pregunta del mercado
     * @param _description Descripción detallada
     * @param _resolutionTime Timestamp cuando resuelve
     * @param _metadata IPFS hash con metadata adicional
     * @param _pythPriceId ID de precio Pyth para validación (0 = no validación)
     */
    function createMarket(
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata _metadata,
        uint256 _pythPriceId
    ) external whenNotPaused returns (uint256) {
        // ✅ FIX #4: Custom errors en lugar de require
        if (_resolutionTime <= block.timestamp + 1 hours) revert Errors.InvalidTime();
        if (_resolutionTime > block.timestamp + 365 days) revert Errors.InvalidTime();
        if (bytes(_question).length <= 10) revert Errors.QuestionTooShort();
        
        uint256 marketId = ++marketCounter;
        
        markets[marketId] = Market({
            id: marketId,
            question: _question,
            description: _description,
            creator: msg.sender,
            createdAt: block.timestamp,
            resolutionTime: _resolutionTime,
            totalYesShares: 0,
            totalNoShares: 0,
            yesPool: 0,
            noPool: 0,
            insuranceReserve: 0,
            status: MarketStatus.Active,
            outcome: Outcome.Pending,
            metadata: _metadata,
            pythPriceId: _pythPriceId // ✅ NEW
        });
        
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(marketId, _question, msg.sender, _resolutionTime, _pythPriceId);
        
        return marketId;
    }
    
    // ============ Betting Functions ============
    
    /**
     * @notice Coloca una apuesta en el mercado
     * @param _marketId ID del mercado
     * @param _isYes true para apostar YES, false para NO
     * @param _amount Cantidad en USDC (6 decimals)
     */
    function placeBet(
        uint256 _marketId,
        bool _isYes,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        Market storage market = markets[_marketId];
        
        // ✅ FIX #4: Custom errors
        if (market.status != MarketStatus.Active) revert Errors.MarketNotActive();
        if (block.timestamp >= market.resolutionTime) revert Errors.MarketExpired();
        if (_amount < MIN_BET || _amount > MAX_BET) revert Errors.InvalidBetAmount();
        
        // Transfer tokens from user
        bool success = bettingToken.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert Errors.TransferFailed();
        
        // ✅ FIX #4: Optimización de gas con unchecked
        uint256 tradingFee;
        uint256 insuranceFee;
        uint256 netAmount;
        
        unchecked {
            tradingFee = (_amount * FEE_BASIS_POINTS) / 10000;
            insuranceFee = (_amount * INSURANCE_FEE_BP) / 10000;
            netAmount = _amount - tradingFee - insuranceFee;
        }
        
        // Transfer insurance premium
        success = bettingToken.transfer(address(insurancePool), insuranceFee);
        if (!success) revert Errors.TransferFailed();
        
        market.insuranceReserve += insuranceFee;
        
        // Calculate shares using constant product formula
        uint256 shares = MarketMath.calculateShares(
            market.yesPool, 
            market.noPool, 
            market.totalYesShares, 
            market.totalNoShares, 
            _isYes, 
            netAmount
        );
        
        uint256 avgPrice;
        unchecked {
            avgPrice = (netAmount * 1e18) / shares;
        }
        
        // Update market state
        if (_isYes) {
            unchecked {
                market.yesPool += netAmount;
                market.totalYesShares += shares;
            }
            positions[_marketId][msg.sender].yesShares += shares;
            positions[_marketId][msg.sender].avgYesPrice = 
                MarketMath.calculateAvgPrice(
                    positions[_marketId][msg.sender].avgYesPrice,
                    positions[_marketId][msg.sender].yesShares - shares,
                    avgPrice,
                    shares
                );
        } else {
            unchecked {
                market.noPool += netAmount;
                market.totalNoShares += shares;
            }
            positions[_marketId][msg.sender].noShares += shares;
            positions[_marketId][msg.sender].avgNoPrice = 
                MarketMath.calculateAvgPrice(
                    positions[_marketId][msg.sender].avgNoPrice,
                    positions[_marketId][msg.sender].noShares - shares,
                    avgPrice,
                    shares
                );
        }
        
        // Track user markets
        if (positions[_marketId][msg.sender].yesShares + 
            positions[_marketId][msg.sender].noShares == shares) {
            userMarkets[msg.sender].push(_marketId);
        }
        
        emit BetPlaced(_marketId, msg.sender, _isYes, _amount, shares, avgPrice);
    }
    
    // ============ Resolution Functions ============
    
    /**
     * @notice Inicia proceso de resolución con AI oracle
     * @param _marketId ID del mercado
     */
    function initiateResolution(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        if (market.status != MarketStatus.Active) revert Errors.MarketNotActive();
        if (block.timestamp < market.resolutionTime) revert Errors.InvalidTime();
        
        market.status = MarketStatus.Resolving;
        
        // Trigger AI oracle (Chainlink Functions) con Pyth price ID
        aiOracle.requestResolution(_marketId, market.question, market.pythPriceId);
    }
    
    /**
     * @notice Callback desde AI Oracle con resultado
     * @param _marketId ID del mercado
     * @param _outcome Resultado (Yes/No/Invalid)
     * @param _confidence Confianza del consenso (0-100)
     */
    function resolveMarket(
        uint256 _marketId,
        Outcome _outcome,
        uint8 _confidence
    ) external {
        if (msg.sender != address(aiOracle)) revert Errors.UnauthorizedResolver();
        
        Market storage market = markets[_marketId];
        if (market.status != MarketStatus.Resolving) revert Errors.MarketNotActive();
        
        // Si confidence < 80%, activar insurance
        if (_confidence < 80) {
            market.status = MarketStatus.Disputed;
            insurancePool.activateInsurance(_marketId, market.insuranceReserve);
            return;
        }
        
        market.outcome = _outcome;
        market.status = MarketStatus.Resolved;
        
        emit MarketResolved(_marketId, _outcome, block.timestamp);
    }
    
    // ============ Claim Functions ============
    
    /**
     * @notice Reclama ganancias después de resolución
     * @param _marketId ID del mercado
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (market.status != MarketStatus.Resolved) revert Errors.MarketNotActive();
        
        Position storage position = positions[_marketId][msg.sender];
        if (position.claimed) revert Errors.AlreadyClaimed();
        if (position.yesShares == 0 && position.noShares == 0) revert Errors.InsufficientBalance();
        
        uint256 payout = 0;
        
        if (market.outcome == Outcome.Yes && position.yesShares > 0) {
            // Ganadores YES: proporción del pool total
            unchecked {
                payout = (position.yesShares * (market.yesPool + market.noPool)) / 
                         market.totalYesShares;
            }
        } else if (market.outcome == Outcome.No && position.noShares > 0) {
            // Ganadores NO
            unchecked {
                payout = (position.noShares * (market.yesPool + market.noPool)) / 
                         market.totalNoShares;
            }
        } else if (market.outcome == Outcome.Invalid) {
            // Refund en caso invalid
            uint256 yesInvested;
            uint256 noInvested;
            unchecked {
                yesInvested = (position.yesShares * position.avgYesPrice) / 1e18;
                noInvested = (position.noShares * position.avgNoPrice) / 1e18;
                payout = yesInvested + noInvested;
            }
        }
        
        if (payout == 0) revert Errors.InsufficientBalance();
        
        position.claimed = true;
        
        bool success = bettingToken.transfer(msg.sender, payout);
        if (!success) revert Errors.TransferFailed();
        
        emit WinningsClaimed(_marketId, msg.sender, payout);
    }
    
    /**
     * @notice Reclama seguro si oracle falló
     * @param _marketId ID del mercado
     */
    function claimInsurance(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (market.status != MarketStatus.Disputed) revert Errors.MarketNotActive();
        
        Position storage position = positions[_marketId][msg.sender];
        if (position.claimed) revert Errors.AlreadyClaimed();
        
        uint256 invested = _calculateInvested(position);
        if (invested == 0) revert Errors.InsufficientBalance();
        
        position.claimed = true;
        
        // Insurance pool reembolsa inversión completa
        uint256 insurancePayout = insurancePool.processClaim(
            _marketId,
            msg.sender,
            invested
        );
        
        emit InsuranceClaimed(_marketId, msg.sender, insurancePayout);
    }
    
    // ============ View Functions ============
    
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
    
    function getUserMarkets(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userMarkets[_user];
    }
    
    function getCurrentOdds(uint256 _marketId) 
        external 
        view 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market storage market = markets[_marketId];
        
        uint256 totalPool = market.yesPool + market.noPool;
        if (totalPool == 0) return (5000, 5000); // 50/50
        
        unchecked {
            yesOdds = (market.yesPool * 10000) / totalPool;
            noOdds = (market.noPool * 10000) / totalPool;
        }
    }
    
    // ============ Internal Functions ============
    
    function _calculateInvested(Position storage position) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 yesInvested;
        uint256 noInvested;
        unchecked {
            yesInvested = (position.yesShares * position.avgYesPrice) / 1e18;
            noInvested = (position.noShares * position.avgNoPrice) / 1e18;
        }
        return yesInvested + noInvested;
    }
    
    // ============ Admin Functions ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) 
        external 
        onlyOwner 
    {
        IERC20(_token).transfer(owner(), _amount);
    }
}

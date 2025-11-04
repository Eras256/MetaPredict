// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../markets/BinaryMarket.sol";
import "../markets/ConditionalMarket.sol";
import "../markets/SubjectiveMarket.sol";
import "../oracle/AIOracle.sol";
import "../reputation/ReputationStaking.sol";
import "../oracle/InsurancePool.sol";
import "../aggregation/OmniRouter.sol";
import "../reputation/ReputationDAO.sol";

/**
 * @title PredictionMarketCore
 * @notice Contrato principal que orquesta todos los módulos de MetaPredict.ai
 * @dev Integra 5 tracks: AI Oracle, Reputation, Gasless UX, Conditional/Subjective, Aggregator
 */
contract PredictionMarketCore is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    
    uint256 public constant VERSION = 1;
    uint256 public constant FEE_BASIS_POINTS = 50; // 0.5%
    uint256 public constant INSURANCE_FEE_BP = 10; // 0.1%
    uint256 public constant MIN_BET = 1e6; // $1 USDC
    uint256 public constant MAX_BET = 100_000e6; // $100k USDC
    
    // ============ State Variables ============
    
    IERC20 public immutable bettingToken;
    
    // Module addresses
    BinaryMarket public binaryMarket;
    ConditionalMarket public conditionalMarket;
    SubjectiveMarket public subjectiveMarket;
    AIOracle public aiOracle;
    ReputationStaking public reputationStaking;
    InsurancePool public insurancePool;
    OmniRouter public crossChainRouter;
    ReputationDAO public daoGovernance;
    
    // Market registry
    uint256 public marketCounter;
    mapping(uint256 => MarketInfo) public markets;
    mapping(uint256 => address) public marketTypeContract;
    mapping(address => uint256[]) public userMarkets;
    
    // ============ Structs ============
    
    struct MarketInfo {
        uint256 id;
        MarketType marketType;
        address creator;
        uint256 createdAt;
        uint256 resolutionTime;
        MarketStatus status;
        string metadata; // IPFS hash
    }
    
    enum MarketType { Binary, Conditional, Subjective }
    enum MarketStatus { Active, Resolving, Resolved, Disputed, Cancelled }
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        MarketType marketType,
        address indexed creator,
        uint256 resolutionTime
    );
    
    event ModuleUpdated(
        string moduleName,
        address indexed oldAddress,
        address indexed newAddress
    );
    
    event FeeCollected(
        uint256 indexed marketId,
        address indexed user,
        uint256 tradingFee,
        uint256 insuranceFee
    );
    
    // ============ Constructor ============
    
    constructor(
        address _bettingToken,
        address _binaryMarket,
        address _conditionalMarket,
        address _subjectiveMarket,
        address _aiOracle,
        address _reputationStaking,
        address _insurancePool,
        address _crossChainRouter,
        address _daoGovernance
    ) Ownable(msg.sender) {
        require(_bettingToken != address(0), "Invalid token");
        
        bettingToken = IERC20(_bettingToken);
        binaryMarket = BinaryMarket(_binaryMarket);
        conditionalMarket = ConditionalMarket(_conditionalMarket);
        subjectiveMarket = SubjectiveMarket(_subjectiveMarket);
        aiOracle = AIOracle(_aiOracle);
        reputationStaking = ReputationStaking(_reputationStaking);
        insurancePool = InsurancePool(_insurancePool);
        crossChainRouter = OmniRouter(_crossChainRouter);
        daoGovernance = ReputationDAO(_daoGovernance);
    }
    
    // ============ Market Creation ============
    
    /**
     * @notice Crea un mercado binario estándar
     */
    function createBinaryMarket(
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata _metadata
    ) external whenNotPaused returns (uint256) {
        require(_resolutionTime > block.timestamp + 1 hours, "Invalid time");
        
        uint256 marketId = ++marketCounter;
        
        markets[marketId] = MarketInfo({
            id: marketId,
            marketType: MarketType.Binary,
            creator: msg.sender,
            createdAt: block.timestamp,
            resolutionTime: _resolutionTime,
            status: MarketStatus.Active,
            metadata: _metadata
        });
        
        // Create binary market in dedicated contract
        binaryMarket.createMarket(
            marketId,
            _question,
            _description,
            _resolutionTime,
            _metadata
        );
        
        marketTypeContract[marketId] = address(binaryMarket);
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(
            marketId,
            MarketType.Binary,
            msg.sender,
            _resolutionTime
        );
        
        return marketId;
    }
    
    /**
     * @notice Crea un mercado condicional (if-then)
     */
    function createConditionalMarket(
        uint256 _parentMarketId,
        string calldata _condition,
        string calldata _question,
        uint256 _resolutionTime,
        string calldata _metadata
    ) external whenNotPaused returns (uint256) {
        require(markets[_parentMarketId].id != 0, "Invalid parent");
        require(_resolutionTime > markets[_parentMarketId].resolutionTime, "Invalid time");
        
        uint256 marketId = ++marketCounter;
        
        markets[marketId] = MarketInfo({
            id: marketId,
            marketType: MarketType.Conditional,
            creator: msg.sender,
            createdAt: block.timestamp,
            resolutionTime: _resolutionTime,
            status: MarketStatus.Active,
            metadata: _metadata
        });
        
        conditionalMarket.createMarket(
            marketId,
            _parentMarketId,
            _condition,
            _question,
            _resolutionTime,
            _metadata
        );
        
        marketTypeContract[marketId] = address(conditionalMarket);
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(
            marketId,
            MarketType.Conditional,
            msg.sender,
            _resolutionTime
        );
        
        return marketId;
    }
    
    /**
     * @notice Crea un mercado subjetivo (requiere DAO voting)
     */
    function createSubjectiveMarket(
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata _expertiseRequired,
        string calldata _metadata
    ) external whenNotPaused returns (uint256) {
        require(_resolutionTime > block.timestamp + 1 days, "Min 1 day");
        
        uint256 marketId = ++marketCounter;
        
        markets[marketId] = MarketInfo({
            id: marketId,
            marketType: MarketType.Subjective,
            creator: msg.sender,
            createdAt: block.timestamp,
            resolutionTime: _resolutionTime,
            status: MarketStatus.Active,
            metadata: _metadata
        });
        
        subjectiveMarket.createMarket(
            marketId,
            _question,
            _description,
            _resolutionTime,
            _expertiseRequired,
            _metadata
        );
        
        marketTypeContract[marketId] = address(subjectiveMarket);
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(
            marketId,
            MarketType.Subjective,
            msg.sender,
            _resolutionTime
        );
        
        return marketId;
    }
    
    // ============ Betting Functions ============
    
    /**
     * @notice Coloca apuesta (gasless via Thirdweb)
     */
    function placeBet(
        uint256 _marketId,
        bool _isYes,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        MarketInfo storage market = markets[_marketId];
        require(market.status == MarketStatus.Active, "Not active");
        require(_amount >= MIN_BET && _amount <= MAX_BET, "Invalid amount");
        
        // Transfer tokens
        require(
            bettingToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Calculate fees
        uint256 tradingFee = (_amount * FEE_BASIS_POINTS) / 10000;
        uint256 insuranceFee = (_amount * INSURANCE_FEE_BP) / 10000;
        uint256 netAmount = _amount - tradingFee - insuranceFee;
        
        // Transfer to insurance pool
        bettingToken.approve(address(insurancePool), insuranceFee);
        insurancePool.receiveInsurancePremium(_marketId, insuranceFee);
        
        // Route to appropriate market contract
        address marketContract = marketTypeContract[_marketId];
        bettingToken.approve(marketContract, netAmount);
        
        if (market.marketType == MarketType.Binary) {
            binaryMarket.placeBet(_marketId, msg.sender, _isYes, netAmount);
        } else if (market.marketType == MarketType.Conditional) {
            conditionalMarket.placeBet(_marketId, msg.sender, _isYes, netAmount);
        } else {
            subjectiveMarket.placeBet(_marketId, msg.sender, _isYes, netAmount);
        }
        
        emit FeeCollected(_marketId, msg.sender, tradingFee, insuranceFee);
    }
    
    // ============ Resolution Functions ============
    
    /**
     * @notice Inicia resolución (AI oracle o DAO)
     */
    function initiateResolution(uint256 _marketId) external {
        MarketInfo storage market = markets[_marketId];
        require(market.status == MarketStatus.Active, "Not active");
        require(block.timestamp >= market.resolutionTime, "Not ready");
        
        market.status = MarketStatus.Resolving;
        
        if (market.marketType == MarketType.Subjective) {
            // DAO voting para markets subjetivos
            daoGovernance.initiateVoting(_marketId);
        } else {
            // AI oracle para binary y conditional
            aiOracle.requestResolution(
                _marketId,
                marketTypeContract[_marketId]
            );
        }
    }
    
    /**
     * @notice Callback de resolución
     */
    function resolveMarket(
        uint256 _marketId,
        uint8 _outcome,
        uint8 _confidence
    ) external {
        require(
            msg.sender == address(aiOracle) || 
            msg.sender == address(daoGovernance),
            "Only oracle/DAO"
        );
        
        MarketInfo storage market = markets[_marketId];
        require(market.status == MarketStatus.Resolving, "Not resolving");
        
        // Si confidence < 80%, activar insurance
        if (_confidence < 80) {
            market.status = MarketStatus.Disputed;
            insurancePool.activateInsurance(_marketId);
            return;
        }
        
        market.status = MarketStatus.Resolved;
        
        // Route resolution to market contract
        address marketContract = marketTypeContract[_marketId];
        if (market.marketType == MarketType.Binary) {
            binaryMarket.resolveMarket(_marketId, _outcome);
        } else if (market.marketType == MarketType.Conditional) {
            conditionalMarket.resolveMarket(_marketId, _outcome);
        } else {
            subjectiveMarket.resolveMarket(_marketId, _outcome);
        }
    }
    
    // ============ Cross-Chain Functions ============
    
    /**
     * @notice Rutea apuesta a mejor chain (aggregator)
     */
    function placeBetCrossChain(
        uint256 _marketId,
        bool _isYes,
        uint256 _amount,
        uint256 _targetChainId
    ) external payable nonReentrant whenNotPaused {
        // Route via CrossChainRouter
        crossChainRouter.routeBet{value: msg.value}(
            _marketId,
            msg.sender,
            _isYes,
            _amount,
            _targetChainId
        );
    }
    
    // ============ Reputation Functions ============
    
    /**
     * @notice Stake para participar en disputes
     */
    function stakeReputation(uint256 _amount) external {
        bettingToken.transferFrom(msg.sender, address(this), _amount);
        bettingToken.approve(address(reputationStaking), _amount);
        reputationStaking.stake(msg.sender, _amount);
    }
    
    /**
     * @notice Vota en dispute
     */
    function voteOnDispute(
        uint256 _marketId,
        uint8 _vote
    ) external {
        reputationStaking.recordVote(msg.sender, _marketId, _vote);
    }
    
    // ============ Admin Functions ============
    
    function updateModule(
        string calldata _moduleName,
        address _newAddress
    ) external onlyOwner {
        address oldAddress;
        
        if (keccak256(bytes(_moduleName)) == keccak256("binaryMarket")) {
            oldAddress = address(binaryMarket);
            binaryMarket = BinaryMarket(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("aiOracle")) {
            oldAddress = address(aiOracle);
            aiOracle = AIOracle(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("reputationStaking")) {
            oldAddress = address(reputationStaking);
            reputationStaking = ReputationStaking(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("insurancePool")) {
            oldAddress = address(insurancePool);
            insurancePool = InsurancePool(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("crossChainRouter")) {
            oldAddress = address(crossChainRouter);
            crossChainRouter = OmniRouter(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("daoGovernance")) {
            oldAddress = address(daoGovernance);
            daoGovernance = ReputationDAO(_newAddress);
        } else {
            revert("Invalid module");
        }
        
        emit ModuleUpdated(_moduleName, oldAddress, _newAddress);
    }
    
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
    
    // ============ View Functions ============
    
    function getMarket(uint256 _marketId) 
        external 
        view 
        returns (MarketInfo memory) 
    {
        return markets[_marketId];
    }
    
    function getUserMarkets(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userMarkets[_user];
    }
    
    function getMarketContract(uint256 _marketId) 
        external 
        view 
        returns (address) 
    {
        return marketTypeContract[_marketId];
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../markets/BinaryMarket.sol";
import "../markets/ConditionalMarket.sol";
import "../markets/SubjectiveMarket.sol";
import "../oracle/AIOracle.sol";
import "../reputation/ReputationStaking.sol";
import "../oracle/InsurancePool.sol";
import "../aggregation/OmniRouter.sol";
import "../reputation/ReputationDAO.sol";
import "../governance/DAOGovernance.sol";

/**
 * @title PredictionMarketCore
 * @notice Contrato principal que orquesta todos los módulos de MetaPredict.ai
 * @dev Integra 5 tracks: AI Oracle, Reputation, Gasless UX, Conditional/Subjective, Aggregator
 * @dev Usa BNB nativo en lugar de tokens ERC20
 */
contract PredictionMarketCore is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    
    uint256 public constant VERSION = 1;
    uint256 public constant FEE_BASIS_POINTS = 50; // 0.5%
    uint256 public constant INSURANCE_FEE_BP = 10; // 0.1%
    uint256 public constant MIN_BET = 0.001 ether; // 0.001 BNB
    uint256 public constant MAX_BET = 100 ether; // 100 BNB
    
    // Module addresses
    BinaryMarket public binaryMarket;
    ConditionalMarket public conditionalMarket;
    SubjectiveMarket public subjectiveMarket;
    AIOracle public aiOracle;
    ReputationStaking public reputationStaking;
    InsurancePool public insurancePool;
    OmniRouter public crossChainRouter;
    DAOGovernance public daoGovernance;
    
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
        address payable _binaryMarket,
        address payable _conditionalMarket,
        address payable _subjectiveMarket,
        address _aiOracle,
        address payable _reputationStaking,
        address payable _insurancePool,
        address payable _crossChainRouter,
        address _daoGovernance
    ) Ownable(msg.sender) {
        binaryMarket = BinaryMarket(_binaryMarket);
        conditionalMarket = ConditionalMarket(_conditionalMarket);
        subjectiveMarket = SubjectiveMarket(_subjectiveMarket);
        aiOracle = AIOracle(_aiOracle);
        reputationStaking = ReputationStaking(_reputationStaking);
        insurancePool = InsurancePool(_insurancePool);
        crossChainRouter = OmniRouter(_crossChainRouter);
        daoGovernance = DAOGovernance(_daoGovernance);
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
     * @notice Coloca apuesta con BNB nativo
     */
    function placeBet(
        uint256 _marketId,
        bool _isYes
    ) external payable nonReentrant whenNotPaused {
        MarketInfo storage market = markets[_marketId];
        require(market.status == MarketStatus.Active, "Not active");
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid amount");
        
        uint256 _amount = msg.value;
        
        // Calculate fees
        uint256 tradingFee = (_amount * FEE_BASIS_POINTS) / 10000;
        uint256 insuranceFee = (_amount * INSURANCE_FEE_BP) / 10000;
        uint256 netAmount = _amount - tradingFee - insuranceFee;
        
        // Transfer to insurance pool
        insurancePool.receiveInsurancePremium{value: insuranceFee}(_marketId, insuranceFee);
        
        // Route to appropriate market contract
        address marketContract = marketTypeContract[_marketId];
        
        if (market.marketType == MarketType.Binary) {
            binaryMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
        } else if (market.marketType == MarketType.Conditional) {
            conditionalMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
        } else {
            subjectiveMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
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
            // TODO: Store question and pythPriceId in MarketInfo struct
            aiOracle.requestResolution(
                _marketId,
                "", // question - TODO: retrieve from market contract
                0   // pythPriceId - TODO: retrieve from market contract
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
        uint256 _targetChainId
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid amount");
        // Route via CrossChainRouter
        crossChainRouter.routeBet{value: msg.value}(
            _marketId,
            msg.sender,
            _isYes,
            msg.value,
            _targetChainId
        );
    }
    
    // ============ Reputation Functions ============
    
    /**
     * @notice Stake para participar en disputes
     */
    function stakeReputation() external payable {
        require(msg.value > 0, "Amount must be > 0");
        reputationStaking.stake{value: msg.value}(msg.sender, msg.value);
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
        address payable _newAddress
    ) external onlyOwner {
        address oldAddress;
        
        if (keccak256(bytes(_moduleName)) == keccak256("binaryMarket")) {
            oldAddress = address(binaryMarket);
            binaryMarket = BinaryMarket(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("conditionalMarket")) {
            oldAddress = address(conditionalMarket);
            conditionalMarket = ConditionalMarket(_newAddress);
        } else if (keccak256(bytes(_moduleName)) == keccak256("subjectiveMarket")) {
            oldAddress = address(subjectiveMarket);
            subjectiveMarket = SubjectiveMarket(_newAddress);
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
            daoGovernance = DAOGovernance(_newAddress);
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
    
    function emergencyWithdraw(uint256 _amount) 
        external 
        onlyOwner 
    {
        require(address(this).balance >= _amount, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
    
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


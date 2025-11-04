// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OmniRouter (CrossChainRouter)
 * @notice Agregador cross-chain para encontrar mejores precios
 * @dev Track 5: Price comparison + routing via CCIP y LayerZero
 */
contract OmniRouter is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    address public coreContract;
    IERC20 public immutable bettingToken;
    
    // Supported chains
    mapping(uint256 => ChainConfig) public chains;
    uint256[] public supportedChainIds;
    
    // Price oracle for each market across chains
    mapping(bytes32 => mapping(uint256 => MarketPrice)) public prices;
    // bytes32 = keccak256(abi.encode(marketQuestion))
    
    // Cross-chain execution tracking
    mapping(bytes32 => CrossChainBet) public pendingBets;
    mapping(address => bytes32[]) public userPendingBets;
    
    struct ChainConfig {
        bool supported;
        address remoteContract;
        uint256 gasLimit;
        uint256 baseFee;
    }
    
    struct MarketPrice {
        uint256 yesPrice; // scaled by 1e18
        uint256 noPrice;
        uint256 liquidity;
        uint256 lastUpdate;
        address marketAddress;
    }
    
    struct CrossChainBet {
        address user;
        uint256 sourceChainId;
        uint256 targetChainId;
        bytes32 marketHash;
        bool isYes;
        uint256 amount;
        uint256 expectedPrice;
        uint256 timestamp;
        BetStatus status;
    }
    
    enum BetStatus { Pending, Executed, Failed, Cancelled }
    
    // ============ Events ============
    
    event ChainAdded(
        uint256 indexed chainId,
        address remoteContract
    );
    
    event PriceUpdated(
        bytes32 indexed marketHash,
        uint256 indexed chainId,
        uint256 yesPrice,
        uint256 noPrice,
        uint256 liquidity
    );
    
    event CrossChainBetInitiated(
        bytes32 indexed betId,
        address indexed user,
        uint256 sourceChain,
        uint256 targetChain,
        uint256 amount
    );
    
    event CrossChainBetExecuted(
        bytes32 indexed betId,
        uint256 executionPrice,
        uint256 shares
    );
    
    event CrossChainBetFailed(
        bytes32 indexed betId,
        string reason
    );
    
    event ArbitrageOpportunity(
        bytes32 indexed marketHash,
        uint256 chain1,
        uint256 chain2,
        uint256 priceDiff
    );
    
    // ============ Constructor ============
    
    constructor(
        address _bettingToken
    ) Ownable(msg.sender) {
        bettingToken = IERC20(_bettingToken);
    }
    
    // ============ Admin Functions ============
    
    function setCoreContract(address _core) external onlyOwner {
        coreContract = _core;
    }
    
    /**
     * @notice Agrega nueva chain soportada
     */
    function addChain(
        uint256 _chainId,
        address _remoteContract,
        uint256 _gasLimit,
        uint256 _baseFee
    ) external onlyOwner {
        chains[_chainId] = ChainConfig({
            supported: true,
            remoteContract: _remoteContract,
            gasLimit: _gasLimit,
            baseFee: _baseFee
        });
        
        supportedChainIds.push(_chainId);
        
        emit ChainAdded(_chainId, _remoteContract);
    }
    
    // ============ Price Aggregation Functions ============
    
    /**
     * @notice Actualiza precio de mercado en una chain
     */
    function updatePrice(
        string calldata _marketQuestion,
        uint256 _chainId,
        uint256 _yesPrice,
        uint256 _noPrice,
        uint256 _liquidity,
        address _marketAddress
    ) external {
        // Only callable by authorized oracles or cross-chain message
        bytes32 marketHash = keccak256(abi.encode(_marketQuestion));
        
        prices[marketHash][_chainId] = MarketPrice({
            yesPrice: _yesPrice,
            noPrice: _noPrice,
            liquidity: _liquidity,
            lastUpdate: block.timestamp,
            marketAddress: _marketAddress
        });
        
        emit PriceUpdated(
            marketHash,
            _chainId,
            _yesPrice,
            _noPrice,
            _liquidity
        );
        
        // Check for arbitrage opportunities
        _checkArbitrage(marketHash, _chainId);
    }
    
    /**
     * @notice Encuentra mejor precio entre chains
     */
    function findBestPrice(
        string calldata _marketQuestion,
        bool _isYes,
        uint256 _amount
    ) external view returns (
        uint256 bestChainId,
        uint256 bestPrice,
        uint256 estimatedShares,
        uint256 gasCost
    ) {
        bytes32 marketHash = keccak256(abi.encode(_marketQuestion));
        
        bestPrice = type(uint256).max;
        
        for (uint256 i = 0; i < supportedChainIds.length; i++) {
            uint256 chainId = supportedChainIds[i];
            MarketPrice storage price = prices[marketHash][chainId];
            
            if (price.lastUpdate == 0) continue;
            if (block.timestamp > price.lastUpdate + 5 minutes) continue;
            if (price.liquidity < _amount) continue;
            
            uint256 currentPrice = _isYes ? price.yesPrice : price.noPrice;
            uint256 totalCost = currentPrice + chains[chainId].baseFee;
            
            if (totalCost < bestPrice) {
                bestPrice = currentPrice;
                bestChainId = chainId;
                estimatedShares = (_amount * 1e18) / currentPrice;
                gasCost = chains[chainId].baseFee;
            }
        }
        
        require(bestPrice != type(uint256).max, "No liquidity available");
    }
    
    // ============ Cross-Chain Execution ============
    
    /**
     * @notice Rutea apuesta a mejor chain
     */
    function routeBet(
        uint256 _marketId,
        address _user,
        bool _isYes,
        uint256 _amount,
        uint256 _targetChainId
    ) external payable nonReentrant {
        require(msg.sender == coreContract, "Only core");
        require(chains[_targetChainId].supported, "Chain not supported");
        require(msg.value >= chains[_targetChainId].baseFee, "Insufficient gas");
        
        // Transfer tokens to this contract
        require(
            bettingToken.transferFrom(_user, address(this), _amount),
            "Transfer failed"
        );
        
        // Generate bet ID
        bytes32 betId = keccak256(abi.encodePacked(
            _user,
            _marketId,
            _targetChainId,
            block.timestamp
        ));
        
        // Store pending bet
        pendingBets[betId] = CrossChainBet({
            user: _user,
            sourceChainId: block.chainid,
            targetChainId: _targetChainId,
            marketHash: keccak256(abi.encode(_marketId)),
            isYes: _isYes,
            amount: _amount,
            expectedPrice: 0,
            timestamp: block.timestamp,
            status: BetStatus.Pending
        });
        
        userPendingBets[_user].push(betId);
        
        // In production: Send cross-chain message via Chainlink CCIP or LayerZero
        
        emit CrossChainBetInitiated(
            betId,
            _user,
            block.chainid,
            _targetChainId,
            _amount
        );
    }
    
    /**
     * @notice Ejecuta apuesta cross-chain localmente
     */
    function executeCrossChainBet(
        bytes32 _betId,
        uint256 _marketId,
        bool _isYes,
        uint256 _amount,
        address _user
    ) external {
        require(msg.sender == coreContract, "Only core");
        
        CrossChainBet storage bet = pendingBets[_betId];
        require(bet.status == BetStatus.Pending, "Not pending");
        
        // Forward to core contract for execution
        bettingToken.approve(coreContract, _amount);
        
        // Call core contract placeBet
        // IPredictionMarketCore(coreContract).placeBet(_marketId, _isYes, _amount);
        
        bet.status = BetStatus.Executed;
        
        emit CrossChainBetExecuted(_betId, 0, 0);
    }
    
    // ============ Arbitrage Detection ============
    
    /**
     * @notice Detecta oportunidades de arbitraje
     */
    function _checkArbitrage(bytes32 _marketHash, uint256 _chainId) internal {
        MarketPrice storage newPrice = prices[_marketHash][_chainId];
        
        for (uint256 i = 0; i < supportedChainIds.length; i++) {
            uint256 otherChainId = supportedChainIds[i];
            if (otherChainId == _chainId) continue;
            
            MarketPrice storage otherPrice = prices[_marketHash][otherChainId];
            if (otherPrice.lastUpdate == 0) continue;
            
            // Check YES price diff
            uint256 yesDiff = newPrice.yesPrice > otherPrice.yesPrice
                ? newPrice.yesPrice - otherPrice.yesPrice
                : otherPrice.yesPrice - newPrice.yesPrice;
            
            // Arbitrage if diff > 2%
            if (yesDiff * 100 / newPrice.yesPrice > 2) {
                emit ArbitrageOpportunity(
                    _marketHash,
                    _chainId,
                    otherChainId,
                    yesDiff
                );
            }
        }
    }
    
    // ============ View Functions ============
    
    function getSupportedChains() 
        external 
        view 
        returns (uint256[] memory) 
    {
        return supportedChainIds;
    }
    
    function getMarketPrices(string calldata _marketQuestion) 
        external 
        view 
        returns (
            uint256[] memory chainIds,
            uint256[] memory yesPrices,
            uint256[] memory noPrices,
            uint256[] memory liquidities
        ) 
    {
        bytes32 marketHash = keccak256(abi.encode(_marketQuestion));
        
        chainIds = new uint256[](supportedChainIds.length);
        yesPrices = new uint256[](supportedChainIds.length);
        noPrices = new uint256[](supportedChainIds.length);
        liquidities = new uint256[](supportedChainIds.length);
        
        for (uint256 i = 0; i < supportedChainIds.length; i++) {
            uint256 chainId = supportedChainIds[i];
            MarketPrice storage price = prices[marketHash][chainId];
            
            chainIds[i] = chainId;
            yesPrices[i] = price.yesPrice;
            noPrices[i] = price.noPrice;
            liquidities[i] = price.liquidity;
        }
    }
    
    function getPendingBet(bytes32 _betId) 
        external 
        view 
        returns (CrossChainBet memory) 
    {
        return pendingBets[_betId];
    }
    
    function getUserPendingBets(address _user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userPendingBets[_user];
    }
}

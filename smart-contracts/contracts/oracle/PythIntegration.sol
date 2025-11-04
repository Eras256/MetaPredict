// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPyth.sol";
import "../libraries/Errors.sol";

/**
 * @title PythIntegration
 * @notice Integración con Pyth Network para validación de precios en tiempo real
 * @dev Valida predicciones de mercado contra precios Pyth
 */
contract PythIntegration is Ownable {
    // ============ State Variables ============
    
    IPyth public immutable pythOracle;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 300; // 5 minutos
    uint256 public constant CONFIDENCE_THRESHOLD = 1000; // 0.1% en basis points
    
    mapping(uint256 => bytes32) public marketPriceId; // marketId => Pyth price ID
    mapping(bytes32 => uint256) public lastPriceUpdate; // priceId => timestamp
    
    // ============ Events ============
    
    event PriceValidated(
        uint256 indexed marketId,
        bytes32 indexed priceId,
        int64 price,
        uint64 confidence,
        bool isValid
    );
    
    // ============ Constructor ============
    
    constructor(address _pythOracle) Ownable(msg.sender) {
        if (_pythOracle == address(0)) revert Errors.InvalidAmount();
        pythOracle = IPyth(_pythOracle);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Asocia un mercado con un precio Pyth
     * @param _marketId ID del mercado
     * @param _priceId ID del precio Pyth (ej: BTC/USD)
     */
    function setMarketPriceId(uint256 _marketId, bytes32 _priceId) external onlyOwner {
        marketPriceId[_marketId] = _priceId;
    }
    
    /**
     * @notice Valida precio de mercado contra Pyth
     * @param _marketId ID del mercado
     * @param _predictedPrice Precio predicho (en formato Pyth)
     * @return isValid true si el precio es válido
     * @return confidenceInterval Intervalo de confianza de Pyth
     */
    function validateMarketPrice(
        uint256 _marketId,
        int256 _predictedPrice
    ) external returns (bool isValid, uint256 confidenceInterval) {
        bytes32 priceId = marketPriceId[_marketId];
        if (priceId == bytes32(0)) revert Errors.InvalidPriceId();
        
        (int64 price, uint64 conf, , uint256 publishTime) = pythOracle.getPrice(priceId);
        
        // Verificar que el precio no esté obsoleto
        if (block.timestamp - publishTime > PRICE_STALENESS_THRESHOLD) {
            revert Errors.PythPriceStale();
        }
        
        lastPriceUpdate[priceId] = block.timestamp;
        
        // Calcular diferencia porcentual
        int256 difference = _predictedPrice > price 
            ? _predictedPrice - price 
            : price - _predictedPrice;
        
        // Convertir confidence de Pyth (normalmente en exponente -8)
        uint256 confidence = uint256(conf);
        
        // Validar si la predicción está dentro del intervalo de confianza
        isValid = uint256(difference) <= confidence * 2; // 2x el intervalo de confianza
        
        confidenceInterval = confidence;
        
        emit PriceValidated(_marketId, priceId, price, conf, isValid);
        
        return (isValid, confidenceInterval);
    }
    
    /**
     * @notice Obtiene precio actual de Pyth
     * @param _priceId ID del precio Pyth
     * @return price Precio actual
     * @return confidence Intervalo de confianza
     * @return isStale true si el precio está obsoleto
     */
    function getCurrentPrice(bytes32 _priceId) 
        external 
        view 
        returns (
            int64 price,
            uint64 confidence,
            bool isStale
        ) 
    {
        (price, confidence, , uint256 publishTime) = pythOracle.getPrice(_priceId);
        
        isStale = block.timestamp - publishTime > PRICE_STALENESS_THRESHOLD;
        
        return (price, confidence, isStale);
    }
    
    /**
     * @notice Actualiza precio feed de Pyth (requiere actualizar desde frontend)
     * @param _updateData Datos de actualización de Pyth
     */
    function updatePriceFeeds(bytes[] calldata _updateData) external payable {
        uint256 fee = pythOracle.updatePriceFeeds.selector;
        pythOracle.updatePriceFeeds{value: msg.value}(_updateData);
    }
}


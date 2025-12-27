// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IChainlinkDataStreams.sol";
import "../libraries/Errors.sol";

/**
 * @title ChainlinkDataStreamsIntegration
 * @notice Integración con Chainlink Data Streams para precios en tiempo real
 * @dev Valida predicciones de mercado contra precios de Data Streams
 * 
 * Data Streams funciona de manera pull-based:
 * 1. Obtienes datos off-chain via API/WebSocket
 * 2. Verificas los datos on-chain usando el Verifier Proxy
 * 3. Usas los precios verificados para resolver mercados
 */
contract ChainlinkDataStreamsIntegration is Ownable {
    // ============ State Variables ============
    
    IChainlinkDataStreams public immutable verifierProxy;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 60; // 1 minuto (Data Streams es más rápido)
    
    // Mapping: marketId => streamId (identificador del stream de Chainlink)
    mapping(uint256 => bytes32) public marketStreamId;
    
    // Mapping: marketId => targetPrice (precio objetivo para resolución automática)
    mapping(uint256 => int256) public marketTargetPrice;
    
    // Mapping: marketId => lastVerifiedPrice
    mapping(uint256 => int256) public lastVerifiedPrice;
    mapping(uint256 => uint256) public lastPriceTimestamp;
    
    // ============ Events ============
    
    event StreamConfigured(
        uint256 indexed marketId,
        bytes32 indexed streamId,
        int256 targetPrice
    );
    
    event PriceVerified(
        uint256 indexed marketId,
        bytes32 indexed streamId,
        int256 price,
        uint256 timestamp,
        bool isValid
    );
    
    event PriceTargetReached(
        uint256 indexed marketId,
        int256 currentPrice,
        int256 targetPrice
    );
    
    // ============ Constructor ============
    
    constructor(address _verifierProxy) Ownable(msg.sender) {
        if (_verifierProxy == address(0)) revert Errors.InvalidAmount();
        verifierProxy = IChainlinkDataStreams(_verifierProxy);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Configura un mercado para usar Data Streams
     * @param _marketId ID del mercado
     * @param _streamId ID del stream de Chainlink Data Streams
     * @param _targetPrice Precio objetivo (opcional, para resolución automática)
     * @dev Permite que cualquier usuario configure el Stream ID para cualquier mercado
     */
    function configureMarketStream(
        uint256 _marketId,
        bytes32 _streamId,
        int256 _targetPrice
    ) external {
        marketStreamId[_marketId] = _streamId;
        marketTargetPrice[_marketId] = _targetPrice;
        
        emit StreamConfigured(_marketId, _streamId, _targetPrice);
    }
    
    /**
     * @notice Verifica un reporte de Data Streams y actualiza el precio
     * @dev Este método debe ser llamado con datos obtenidos off-chain
     * @param _marketId ID del mercado
     * @param _report Reporte codificado de Data Streams (obtenido off-chain)
     * @return price Precio verificado
     * @return timestamp Timestamp del precio
     * @return isValid true si el reporte es válido
     */
    function verifyPriceReport(
        uint256 _marketId,
        bytes calldata _report
    ) external returns (
        int256 price,
        uint256 timestamp,
        bool isValid
    ) {
        bytes32 streamId = marketStreamId[_marketId];
        if (streamId == bytes32(0)) revert Errors.InvalidPriceId();
        
        // Verificar el reporte usando el Verifier Proxy
        (price, timestamp, isValid) = verifierProxy.verifyAndDecode(_report);
        
        if (!isValid) {
            revert Errors.InvalidPriceReport();
        }
        
        // Verificar que el precio no esté obsoleto
        if (block.timestamp - timestamp > PRICE_STALENESS_THRESHOLD) {
            revert Errors.PythPriceStale(); // Reutilizamos el error de Pyth
        }
        
        // Actualizar estado
        lastVerifiedPrice[_marketId] = price;
        lastPriceTimestamp[_marketId] = timestamp;
        
        emit PriceVerified(_marketId, streamId, price, timestamp, true);
        
        // Verificar si se alcanzó el precio objetivo
        int256 targetPrice = marketTargetPrice[_marketId];
        if (targetPrice != 0) {
            if (price >= targetPrice) {
                emit PriceTargetReached(_marketId, price, targetPrice);
            }
        }
        
        return (price, timestamp, true);
    }
    
    /**
     * @notice Obtiene el último precio verificado para un mercado
     * @param _marketId ID del mercado
     * @return price Último precio verificado
     * @return timestamp Timestamp del precio
     * @return isStale true si el precio está obsoleto
     */
    function getLastVerifiedPrice(uint256 _marketId)
        external
        view
        returns (
            int256 price,
            uint256 timestamp,
            bool isStale
        )
    {
        price = lastVerifiedPrice[_marketId];
        timestamp = lastPriceTimestamp[_marketId];
        
        if (timestamp == 0) {
            return (0, 0, true);
        }
        
        isStale = block.timestamp - timestamp > PRICE_STALENESS_THRESHOLD;
        
        return (price, timestamp, isStale);
    }
    
    /**
     * @notice Verifica si un mercado ha alcanzado su precio objetivo
     * @param _marketId ID del mercado
     * @return conditionMet true si el precio objetivo fue alcanzado
     * @return currentPrice Precio actual verificado
     * @return targetPrice Precio objetivo
     */
    function checkPriceCondition(uint256 _marketId)
        external
        view
        returns (
            bool conditionMet,
            int256 currentPrice,
            int256 targetPrice
        )
    {
        targetPrice = marketTargetPrice[_marketId];
        if (targetPrice == 0) {
            return (false, 0, 0);
        }
        
        currentPrice = lastVerifiedPrice[_marketId];
        uint256 timestamp = lastPriceTimestamp[_marketId];
        
        if (timestamp == 0) {
            return (false, 0, targetPrice);
        }
        
        // Verificar que el precio no esté obsoleto
        if (block.timestamp - timestamp > PRICE_STALENESS_THRESHOLD) {
            return (false, currentPrice, targetPrice);
        }
        
        conditionMet = currentPrice >= targetPrice;
        
        return (conditionMet, currentPrice, targetPrice);
    }
    
    /**
     * @notice Valida un precio predicho contra el último precio verificado
     * @param _marketId ID del mercado
     * @param _predictedPrice Precio predicho
     * @return isValid true si el precio predicho está dentro del rango válido
     * @return actualPrice Precio actual verificado
     * @return difference Diferencia entre precio predicho y actual
     */
    function validateMarketPrice(
        uint256 _marketId,
        int256 _predictedPrice
    ) external view returns (
        bool isValid,
        int256 actualPrice,
        int256 difference
    ) {
        actualPrice = lastVerifiedPrice[_marketId];
        uint256 timestamp = lastPriceTimestamp[_marketId];
        
        if (timestamp == 0) {
            return (false, 0, 0);
        }
        
        // Verificar que el precio no esté obsoleto
        if (block.timestamp - timestamp > PRICE_STALENESS_THRESHOLD) {
            return (false, actualPrice, 0);
        }
        
        // Calcular diferencia
        difference = _predictedPrice > actualPrice
            ? _predictedPrice - actualPrice
            : actualPrice - _predictedPrice;
        
        // Validar si está dentro del 1% de diferencia (ajustable)
        // Convertir a porcentaje: difference * 10000 / actualPrice < 100 (1%)
        int256 divisor = actualPrice > 0 ? actualPrice : int256(1);
        int256 percentDifference = (difference * 10000) / divisor;
        isValid = percentDifference <= 100; // 1% de tolerancia
        
        return (isValid, actualPrice, difference);
    }
}


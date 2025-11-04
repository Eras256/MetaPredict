// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MarketMath
 * @notice Librería de matemáticas para mercados de predicción
 */
library MarketMath {
    /**
     * @notice Calcula shares usando constant product AMM
     * @param yesPool Pool de YES
     * @param noPool Pool de NO
     * @param totalYesShares Total de shares YES
     * @param totalNoShares Total de shares NO
     * @param isYes true para YES, false para NO
     * @param amount Cantidad a invertir
     * @return shares Cantidad de shares obtenidas
     */
    function calculateShares(
        uint256 yesPool,
        uint256 noPool,
        uint256 totalYesShares,
        uint256 totalNoShares,
        bool isYes,
        uint256 amount
    ) internal pure returns (uint256) {
        uint256 pool = isYes ? yesPool : noPool;
        uint256 totalShares = isYes ? totalYesShares : totalNoShares;
        
        if (totalShares == 0) {
            return amount; // 1:1 initial
        }
        
        // shares = (amount * totalShares) / pool
        return (amount * totalShares) / pool;
    }
    
    /**
     * @notice Calcula precio promedio ponderado
     * @param oldAvg Precio promedio anterior
     * @param oldShares Shares anteriores
     * @param newPrice Nuevo precio
     * @param newShares Nuevas shares
     * @return avgPrice Nuevo precio promedio
     */
    function calculateAvgPrice(
        uint256 oldAvg,
        uint256 oldShares,
        uint256 newPrice,
        uint256 newShares
    ) internal pure returns (uint256) {
        if (oldShares == 0) return newPrice;
        
        return ((oldAvg * oldShares) + (newPrice * newShares)) / 
               (oldShares + newShares);
    }
}


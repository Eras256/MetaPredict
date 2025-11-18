// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IChainlinkDataStreams
 * @notice Interface para Chainlink Data Streams Verifier Proxy
 * @dev Usado para verificar datos de precios obtenidos off-chain
 */
interface IChainlinkDataStreams {
    /**
     * @notice Verifica un reporte de Data Streams
     * @param report Reporte codificado de Data Streams
     * @return verified true si el reporte es válido
     */
    function verify(bytes calldata report) external view returns (bool verified);
    
    /**
     * @notice Verifica y decodifica un reporte de Data Streams
     * @param report Reporte codificado de Data Streams
     * @return price Precio verificado
     * @return timestamp Timestamp del precio
     * @return isValid true si el reporte es válido
     */
    function verifyAndDecode(bytes calldata report) 
        external 
        view 
        returns (
            int256 price,
            uint256 timestamp,
            bool isValid
        );
}


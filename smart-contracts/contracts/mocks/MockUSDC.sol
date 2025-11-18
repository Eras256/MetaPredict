// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mock ERC20 token para testing en testnet
 * @dev Simula USDC con 6 decimales (como el USDC real)
 */
contract MockUSDC is ERC20 {
    uint8 private constant _decimals = 6;
    
    constructor() ERC20("USD Coin", "USDC") {
        // Mint 1,000,000 USDC (1M) al deployer para testing
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }
    
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Mint tokens para testing (solo para testnet)
     * @param _to Dirección que recibirá los tokens
     * @param _amount Cantidad de tokens a mintear (en unidades base, sin decimales)
     */
    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount * 10**decimals());
    }
}


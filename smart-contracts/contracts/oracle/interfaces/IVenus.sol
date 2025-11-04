// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVenus {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOfUnderlying(address owner) external view returns (uint256);
}


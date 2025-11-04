// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPyth {
    function getPrice(bytes32 id) external view returns (
        int64 price,
        uint64 conf,
        uint32 expo,
        uint256 publishTime
    );
    
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
}


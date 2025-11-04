// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChainlinkFunctions {
    function sendRequest(
        bytes32 requestId,
        bytes calldata data,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donId
    ) external returns (bytes32);
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/oracle/AIOracle.sol";
import "../contracts/markets/PredictionMarket.sol";
import "../contracts/libraries/Errors.sol";

contract MockFunctionsRouter {
    function sendRequest(
        uint64 subscriptionId,
        bytes calldata data,
        uint16 dataVersion,
        uint32 callbackGasLimit,
        bytes32 donId
    ) external returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp, msg.sender));
    }
}

contract AIOracleTest is Test {
    AIOracle oracle;
    MockFunctionsRouter router;
    address owner = address(0x1);
    
    bytes32 donId = keccak256("test-don");
    uint64 subscriptionId = 1;
    string backendUrl = "https://api.example.com/oracle/resolve";
    
    function setUp() public {
        vm.startPrank(owner);
        router = new MockFunctionsRouter();
        oracle = new AIOracle(
            address(router),
            donId,
            subscriptionId,
            backendUrl
        );
        vm.stopPrank();
    }
    
    function test_RequestResolution() public {
        address mockMarket = address(0x2);
        oracle.setPredictionMarket(mockMarket);
        
        vm.prank(mockMarket);
        bytes32 requestId = oracle.requestResolution(
            1,
            "Will BTC exceed $100K?",
            0 // No Pyth price ID
        );
        
        assertNotEq(requestId, bytes32(0));
        assertEq(oracle.requestToMarketId(requestId), 1);
    }
    
    function test_RequestResolution_Unauthorized() public {
        vm.expectRevert(Errors.UnauthorizedResolver.selector);
        oracle.requestResolution(1, "Test", 0);
    }
    
    function test_SetPredictionMarket() public {
        address newMarket = address(0x3);
        oracle.setPredictionMarket(newMarket);
        assertEq(oracle.predictionMarket(), newMarket);
    }
    
    function test_SetPredictionMarket_InvalidAddress() public {
        vm.expectRevert(Errors.InvalidAmount.selector);
        oracle.setPredictionMarket(address(0));
    }
}


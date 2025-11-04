// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../markets/PredictionMarket.sol";
import "../libraries/Errors.sol";

/**
 * @title AIOracle
 * @notice Resuelve mercados consultando backend vía Chainlink Functions
 * @dev Backend ejecuta LLM consensus, Functions solo llama backend
 */
contract AIOracle is FunctionsClient, OwnerIsCreator {
    using FunctionsRequest for FunctionsRequest.Request;
    
    // ============ State Variables ============
    
    address public predictionMarket;
    bytes32 public donId; // Chainlink DON ID
    uint64 public subscriptionId;
    uint32 public gasLimit = 300_000;
    
    // Backend URL (Vercel/Next.js API endpoint)
    string public backendUrl;
    
    mapping(bytes32 => uint256) public requestToMarketId;
    mapping(uint256 => OracleResult) public results;
    
    struct OracleResult {
        bool resolved;
        uint8 yesVotes;
        uint8 noVotes;
        uint8 invalidVotes;
        uint8 confidence;
        uint256 timestamp;
    }
    
    // ============ Events ============
    
    event ResolutionRequested(
        bytes32 indexed requestId,
        uint256 indexed marketId,
        string question
    );
    
    event ResolutionFulfilled(
        bytes32 indexed requestId,
        uint256 indexed marketId,
        uint8 outcome,
        uint8 confidence
    );
    
    // ============ Constructor ============
    
    constructor(
        address _router,
        bytes32 _donId,
        uint64 _subscriptionId,
        string memory _backendUrl
    ) FunctionsClient(_router) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        backendUrl = _backendUrl;
    }
    
    // ============ Core Functions ============
    
    function setPredictionMarket(address _market) external onlyOwner {
        if (_market == address(0)) revert Errors.InvalidAmount();
        predictionMarket = _market;
    }
    
    function setBackendUrl(string memory _backendUrl) external onlyOwner {
        backendUrl = _backendUrl;
    }
    
    /**
     * @notice Solicita resolución multi-AI vía backend
     * @param _marketId ID del mercado
     * @param _question Pregunta a resolver
     * @param _pythPriceId ID de precio Pyth para validación (opcional)
     */
    function requestResolution(
        uint256 _marketId,
        string calldata _question,
        uint256 _pythPriceId
    ) external returns (bytes32) {
        if (msg.sender != predictionMarket) revert Errors.UnauthorizedResolver();
        
        // ✅ FIX #1: JavaScript source que llama AL BACKEND, no APIs directamente
        string memory source = string(abi.encodePacked(
            "const backendUrl = '", backendUrl, "';",
            "const question = args[0];",
            "const priceId = args[1];",
            "",
            "// Call backend API que ejecuta LLM consensus",
            "const response = await Functions.makeHttpRequest({",
            "  url: backendUrl,",
            "  method: 'POST',",
            "  headers: {",
            "    'Content-Type': 'application/json',",
            "    'x-chainlink-signature': Functions.env('CHAINLINK_SIGNATURE')",
            "  },",
            "  data: JSON.stringify({",
            "    marketDescription: question,",
            "    priceId: priceId",
            "  })",
            "});",
            "",
            "if (response.error) {",
            "  throw new Error('Backend request failed');",
            "}",
            "",
            "const data = response.data;",
            "",
            "// Backend retorna: { outcome, confidence, consensusCount }",
            "// outcome: 1=Yes, 2=No, 3=Invalid",
            "const outcome = data.outcome;",
            "const confidence = data.confidence;",
            "",
            "return Functions.encodeUint256(outcome * 1000 + confidence);"
        ));
        
        FunctionsRequest.Request memory req;
        req.initializeRequest(
            FunctionsRequest.Location.Inline,
            FunctionsRequest.CodeLanguage.JavaScript,
            source
        );
        
        string[] memory args = new string[](2);
        args[0] = _question;
        args[1] = Strings.toString(_pythPriceId);
        req.setArgs(args);
        
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );
        
        requestToMarketId[requestId] = _marketId;
        
        emit ResolutionRequested(requestId, _marketId, _question);
        
        return requestId;
    }
    
    /**
     * @notice Callback de Chainlink Functions con respuesta del backend
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 marketId = requestToMarketId[requestId];
        if (marketId == 0) revert Errors.InvalidRequestId();
        
        if (err.length > 0) {
            // Error: marcar como invalid
            results[marketId] = OracleResult({
                resolved: true,
                yesVotes: 0,
                noVotes: 0,
                invalidVotes: 5,
                confidence: 0,
                timestamp: block.timestamp
            });
            
            PredictionMarket(payable(predictionMarket)).resolveMarket(
                marketId,
                PredictionMarket.Outcome.Invalid,
                0
            );
            return;
        }
        
        uint256 result = abi.decode(response, (uint256));
        uint8 outcome = uint8(result / 1000);
        uint8 confidence = uint8(result % 1000);
        
        // outcome: 1=Yes, 2=No, 3=Invalid
        uint8 yesVotes = outcome == 1 ? 5 : 0;
        uint8 noVotes = outcome == 2 ? 5 : 0;
        uint8 invalidVotes = outcome == 3 ? 5 : 0;
        
        results[marketId] = OracleResult({
            resolved: true,
            yesVotes: yesVotes,
            noVotes: noVotes,
            invalidVotes: invalidVotes,
            confidence: confidence,
            timestamp: block.timestamp
        });
        
        PredictionMarket.Outcome finalOutcome;
        if (outcome == 1) finalOutcome = PredictionMarket.Outcome.Yes;
        else if (outcome == 2) finalOutcome = PredictionMarket.Outcome.No;
        else finalOutcome = PredictionMarket.Outcome.Invalid;
        
        PredictionMarket(payable(predictionMarket)).resolveMarket(
            marketId,
            finalOutcome,
            confidence
        );
        
        emit ResolutionFulfilled(requestId, marketId, outcome, confidence);
    }
    
    // ============ View Functions ============
    
    function getResult(uint256 _marketId) 
        external 
        view 
        returns (OracleResult memory) 
    {
        return results[_marketId];
    }
}

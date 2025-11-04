// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IInsurancePool {
    function claimInsurance(address recipient, uint256 amount) external;
    function getPoolBalance() external view returns (uint256);
}

/**
 * @title TruthChain
 * @notice Multi-LLM Oracle with Insurance for Prediction Markets
 * @dev Uses Chainlink Functions to aggregate responses from multiple LLMs
 */
contract TruthChain is FunctionsClient, AccessControl, AutomationCompatible {
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    enum ResolutionStatus { Pending, Resolved, Disputed, InsurancePaid }

    struct Market {
        uint256 id;
        string description;
        uint256 deadline;
        bytes32 requestId;
        uint256 multiLLMConsensus; // 0-100%
        ResolutionStatus status;
        uint256[] llmResponses;
        bool insuranceClaimed;
        uint256 createdAt;
    }

    struct DisputeRequest {
        uint256 marketId;
        address challenger;
        string reason;
        uint256 timestamp;
        bool resolved;
    }

    mapping(uint256 => Market) public markets;
    mapping(bytes32 => uint256) public requestIdToMarket;
    mapping(uint256 => DisputeRequest[]) public marketDisputes;
    mapping(address => uint256) public userReputation;

    IInsurancePool public insurancePool;

    uint256 private constant CONSENSUS_THRESHOLD = 80;
    uint256 private constant DISPUTE_THRESHOLD = 60;
    uint256 private constant MAX_DISPUTE_WINDOW = 7 days;

    event MarketCreated(uint256 indexed marketId, string description, uint256 deadline);
    event ResolutionRequested(uint256 indexed marketId, bytes32 requestId);
    event ResolutionCompleted(uint256 indexed marketId, uint256 consensus, uint256 outcome);
    event DisputeFiled(uint256 indexed marketId, address challenger, string reason);
    event InsuranceClaimed(uint256 indexed marketId, address recipient, uint256 amount);

    constructor(
        address _insurancePool,
        address _router,
        address _linkToken
    ) FunctionsClient(_router) {
        insurancePool = IInsurancePool(_insurancePool);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    /**
     * @notice Create a new prediction market
     */
    function createMarket(
        uint256 _marketId,
        string memory _description,
        uint256 _deadline
    ) external onlyRole(RESOLVER_ROLE) {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(markets[_marketId].createdAt == 0, "Market exists");

        markets[_marketId] = Market({
            id: _marketId,
            description: _description,
            deadline: _deadline,
            requestId: bytes32(0),
            multiLLMConsensus: 0,
            status: ResolutionStatus.Pending,
            llmResponses: new uint256[](5),
            insuranceClaimed: false,
            createdAt: block.timestamp
        });

        emit MarketCreated(_marketId, _description, _deadline);
    }

    /**
     * @notice Request multi-LLM resolution via Chainlink Functions
     */
    function requestResolution(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.deadline, "Market not ready");
        require(market.status == ResolutionStatus.Pending, "Already resolved");

        // This would call Chainlink Functions to invoke multiple LLMs
        // For MVP: Simplified to show integration pattern
        bytes32 requestId = keccak256(abi.encodePacked(_marketId, block.timestamp));

        market.requestId = requestId;
        requestIdToMarket[requestId] = _marketId;

        emit ResolutionRequested(_marketId, requestId);
    }

    /**
     * @notice Callback from Chainlink Functions with LLM responses
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 marketId = requestIdToMarket[requestId];
        Market storage market = markets[marketId];

        if (err.length > 0) {
            _payInsurance(marketId);
            return;
        }

        (uint256[] memory responses) = abi.decode(response, (uint256[]));

        uint256 consensus = _calculateConsensus(responses);

        market.llmResponses = responses;
        market.multiLLMConsensus = consensus;

        if (consensus >= CONSENSUS_THRESHOLD) {
            market.status = ResolutionStatus.Resolved;
            emit ResolutionCompleted(marketId, consensus, 1); // Simplified: 1 = YES
        } else if (consensus < DISPUTE_THRESHOLD) {
            _payInsurance(marketId);
        } else {
            market.status = ResolutionStatus.Disputed;
        }
    }

    /**
     * @notice File a dispute against a market resolution
     */
    function fileDispute(
        uint256 _marketId,
        string memory _reason
    ) external {
        Market storage market = markets[_marketId];
        require(
            block.timestamp <= market.deadline + MAX_DISPUTE_WINDOW,
            "Dispute window closed"
        );
        require(
            market.status != ResolutionStatus.InsurancePaid,
            "Already compensated"
        );

        marketDisputes[_marketId].push(
            DisputeRequest({
                marketId: _marketId,
                challenger: msg.sender,
                reason: _reason,
                timestamp: block.timestamp,
                resolved: false
            })
        );

        emit DisputeFiled(_marketId, msg.sender, _reason);

        if (marketDisputes[_marketId].length >= 3) {
            _payInsurance(_marketId);
        }
    }

    /**
     * @notice Pay insurance to users if oracle fails
     */
    function _payInsurance(uint256 _marketId) internal {
        Market storage market = markets[_marketId];
        require(!market.insuranceClaimed, "Already paid");

        uint256 poolBalance = insurancePool.getPoolBalance();
        uint256 payoutAmount = poolBalance / 20; // 5% of pool per event

        insurancePool.claimInsurance(msg.sender, payoutAmount);

        market.insuranceClaimed = true;
        market.status = ResolutionStatus.InsurancePaid;

        emit InsuranceClaimed(_marketId, msg.sender, payoutAmount);
    }

    /**
     * @notice Calculate consensus percentage from LLM responses
     */
    function _calculateConsensus(
        uint256[] memory responses
    ) internal pure returns (uint256) {
        uint256 agreement = 0;
        uint256 totalPairs = responses.length * (responses.length - 1) / 2;

        for (uint256 i = 0; i < responses.length; i++) {
            for (uint256 j = i + 1; j < responses.length; j++) {
                if (responses[i] == responses[j]) {
                    agreement++;
                }
            }
        }

        return (agreement * 100) / totalPairs;
    }

    /**
     * @notice Check if automation is needed (Chainlink Automation)
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check for markets that need resolution
        // Simplified for MVP
        upkeepNeeded = false;
        performData = "";
    }

    /**
     * @notice Perform upkeep (Chainlink Automation)
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        // Auto-resolve markets via Chainlink Automation
        // Simplified for MVP
    }
}


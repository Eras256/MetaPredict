// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DAOGovernance
 * @notice Governanza descentralizada con quadratic voting y expertise validation
 * @dev Resuelve mercados subjetivos + propuestas de protocolo
 */
contract DAOGovernance is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    address public coreContract;
    address public reputationContract;
    IERC20 public governanceToken;
    
    uint256 public proposalCounter;
    uint256 public votingPeriod = 3 days;
    uint256 public minQuorum = 1000e18; // 1000 tokens
    uint256 public expertiseWeight = 2; // 2x multiplier
    
    // Proposal types
    enum ProposalType { 
        MarketResolution,  // Resolve subjective market
        ParameterChange,   // Change protocol parameters
        TreasurySpend,     // Spend treasury funds
        EmergencyAction    // Emergency pause/unpause
    }
    
    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }
    
    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        address proposer;
        string title;
        string description;
        uint256 marketId; // For market resolution proposals
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        bool executed;
        mapping(address => Vote) votes;
    }
    
    struct Vote {
        bool hasVoted;
        uint8 support; // 0=Against, 1=For, 2=Abstain
        uint256 votes;
        uint256 quadraticVotes;
        bool isExpert;
    }
    
    struct Expertise {
        string domain; // "film", "sports", "economics", etc.
        uint256 score;
        bool verified;
        uint256 verifiedAt;
        address[] attestations;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(string => Expertise)) public expertises;
    mapping(address => uint256[]) public userProposals;
    mapping(address => uint256[]) public userVotes;
    
    // ============ Events ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string title
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 votes,
        uint256 quadraticVotes,
        bool isExpert
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        ProposalStatus status
    );
    
    event ExpertiseVerified(
        address indexed expert,
        string domain,
        uint256 score
    );
    
    event ExpertiseAttested(
        address indexed expert,
        address indexed attester,
        string domain
    );
    
    // ============ Constructor ============
    
    constructor(
        address _governanceToken,
        address _reputationContract
    ) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
        reputationContract = _reputationContract;
    }
    
    // ============ Modifiers ============
    
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core");
        _;
    }
    
    // ============ Admin Functions ============
    
    function setCoreContract(address _core) external onlyOwner {
        coreContract = _core;
    }
    
    function setVotingPeriod(uint256 _period) external onlyOwner {
        votingPeriod = _period;
    }
    
    function setMinQuorum(uint256 _quorum) external onlyOwner {
        minQuorum = _quorum;
    }
    
    // ============ Proposal Creation ============
    
    /**
     * @notice Crea propuesta de resolución de mercado subjetivo
     */
    function initiateVoting(uint256 _marketId) external onlyCore returns (uint256) {
        uint256 proposalId = ++proposalCounter;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposalType = ProposalType.MarketResolution;
        proposal.proposer = msg.sender;
        proposal.marketId = _marketId;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + (votingPeriod / 12); // ~12s blocks
        proposal.status = ProposalStatus.Active;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.MarketResolution,
            "Market Resolution"
        );
        
        return proposalId;
    }
    
    /**
     * @notice Crea propuesta de cambio de parámetros
     */
    function createParameterProposal(
        string calldata _title,
        string calldata _description
    ) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= 100e18,
            "Insufficient tokens"
        );
        
        uint256 proposalId = ++proposalCounter;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposalType = ProposalType.ParameterChange;
        proposal.proposer = msg.sender;
        proposal.title = _title;
        proposal.description = _description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + (votingPeriod / 12);
        proposal.status = ProposalStatus.Active;
        
        userProposals[msg.sender].push(proposalId);
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.ParameterChange,
            _title
        );
        
        return proposalId;
    }
    
    // ============ Voting Functions ============
    
    /**
     * @notice Vota con quadratic voting + expertise boost
     */
    function castVote(
        uint256 _proposalId,
        uint8 _support,
        string calldata _expertiseDomain
    ) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Not active");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.votes[msg.sender].hasVoted, "Already voted");
        require(_support <= 2, "Invalid support value");
        
        uint256 votes = governanceToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        // Quadratic voting: sqrt of token balance
        uint256 quadraticVotes = _sqrt(votes);
        
        // Check expertise
        bool isExpert = false;
        if (bytes(_expertiseDomain).length > 0) {
            Expertise storage expertise = expertises[msg.sender][_expertiseDomain];
            if (expertise.verified && expertise.score >= 70) {
                isExpert = true;
                quadraticVotes = quadraticVotes * expertiseWeight;
            }
        }
        
        // Record vote
        proposal.votes[msg.sender] = Vote({
            hasVoted: true,
            support: _support,
            votes: votes,
            quadraticVotes: quadraticVotes,
            isExpert: isExpert
        });
        
        // Update tallies
        if (_support == 0) {
            proposal.againstVotes += quadraticVotes;
        } else if (_support == 1) {
            proposal.forVotes += quadraticVotes;
        } else {
            proposal.abstainVotes += quadraticVotes;
        }
        
        userVotes[msg.sender].push(_proposalId);
        
        emit VoteCast(
            msg.sender,
            _proposalId,
            _support,
            votes,
            quadraticVotes,
            isExpert
        );
    }
    
    // ============ Proposal Execution ============
    
    /**
     * @notice Ejecuta propuesta aprobada
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Not active");
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= minQuorum, "Quorum not reached");
        
        // Determine outcome
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Succeeded;
            
            // Execute based on type
            if (proposal.proposalType == ProposalType.MarketResolution) {
                _executeMarketResolution(proposal);
            }
            
            proposal.executed = true;
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
        
        emit ProposalExecuted(_proposalId, proposal.status);
    }
    
    function _executeMarketResolution(Proposal storage proposal) internal {
        // Determine outcome: 1=Yes if forVotes > 2/3, 2=No if againstVotes > 2/3, else 3=Invalid
        uint256 total = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint8 outcome;
        
        if (proposal.forVotes * 3 > total * 2) {
            outcome = 1; // Yes
        } else if (proposal.againstVotes * 3 > total * 2) {
            outcome = 2; // No
        } else {
            outcome = 3; // Invalid
        }
        
        // Notify core contract
        IPredictionMarketCore(coreContract).resolveMarket(
            proposal.marketId,
            outcome,
            95 // High confidence from DAO
        );
    }
    
    // ============ Expertise Management ============
    
    /**
     * @notice Registra expertise en un dominio
     */
    function registerExpertise(
        string calldata _domain,
        string calldata _evidence
    ) external {
        Expertise storage expertise = expertises[msg.sender][_domain];
        require(!expertise.verified, "Already verified");
        
        expertise.domain = _domain;
        expertise.score = 50; // Base score
        expertise.verified = false;
    }
    
    /**
     * @notice Atesta expertise de otro usuario
     */
    function attestExpertise(
        address _expert,
        string calldata _domain
    ) external {
        Expertise storage myExpertise = expertises[msg.sender][_domain];
        require(myExpertise.verified, "Not verified yourself");
        require(myExpertise.score >= 70, "Insufficient score");
        
        Expertise storage expertExpertise = expertises[_expert][_domain];
        require(bytes(expertExpertise.domain).length > 0, "Not registered");
        
        expertExpertise.attestations.push(msg.sender);
        expertExpertise.score += 5;
        
        // Auto-verify if 3+ attestations
        if (expertExpertise.attestations.length >= 3 && !expertExpertise.verified) {
            expertExpertise.verified = true;
            expertExpertise.verifiedAt = block.timestamp;
            
            emit ExpertiseVerified(_expert, _domain, expertExpertise.score);
        }
        
        emit ExpertiseAttested(_expert, msg.sender, _domain);
    }
    
    /**
     * @notice Verifica expertise manualmente (owner only)
     */
    function verifyExpertise(
        address _expert,
        string calldata _domain,
        uint256 _score
    ) external onlyOwner {
        Expertise storage expertise = expertises[_expert][_domain];
        expertise.verified = true;
        expertise.verifiedAt = block.timestamp;
        expertise.score = _score;
        
        emit ExpertiseVerified(_expert, _domain, _score);
    }
    
    // ============ View Functions ============
    
    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (
            uint256 id,
            ProposalType proposalType,
            address proposer,
            string memory title,
            string memory description,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            ProposalStatus status,
            bool executed
        ) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposalType,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.status,
            proposal.executed
        );
    }
    
    function getVote(uint256 _proposalId, address _voter) 
        external 
        view 
        returns (Vote memory) 
    {
        return proposals[_proposalId].votes[_voter];
    }
    
    function getUserProposals(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userProposals[_user];
    }
    
    function getUserVotes(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userVotes[_user];
    }
    
    function getExpertise(address _user, string calldata _domain) 
        external 
        view 
        returns (Expertise memory) 
    {
        return expertises[_user][_domain];
    }
    
    // ============ Internal Functions ============
    
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}

interface IPredictionMarketCore {
    function resolveMarket(uint256 _marketId, uint8 _outcome, uint8 _confidence) external;
}


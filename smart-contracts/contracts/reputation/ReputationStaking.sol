// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReputationStaking
 * @notice Sistema de reputación con staking, slashing y NFT badges
 * @dev Track 2: Reputation cross-chain con incentivos económicos
 * @dev Usa BNB nativo en lugar de tokens ERC20
 */
contract ReputationStaking is ERC721, Ownable, ReentrancyGuard {
    address public coreContract;
    
    // Reputation tiers
    enum Tier { None, Bronze, Silver, Gold, Platinum, Diamond }
    
    struct Staker {
        uint256 stakedAmount;
        uint256 reputationScore;
        Tier tier;
        uint256 correctVotes;
        uint256 totalVotes;
        uint256 slashedAmount;
        uint256 lastUpdateTime;
        bool hasNFT;
    }
    
    struct DisputeVote {
        uint256 marketId;
        uint8 vote; // 1=Yes, 2=No, 3=Invalid
        uint256 stakeWeight;
        bool rewarded;
        bool slashed;
    }
    
    // State
    mapping(address => Staker) public stakers;
    mapping(address => mapping(uint256 => DisputeVote)) public votes;
    mapping(uint256 => mapping(uint8 => uint256)) public voteWeights; // marketId => outcome => weight
    mapping(address => uint256[]) public userVotes;
    
    uint256 public totalStaked;
    uint256 public totalSlashed;
    uint256 public minStake = 0.1 ether; // 0.1 BNB
    uint256 public slashingPenalty = 2000; // 20%
    
    uint256 public nftCounter;
    
    // Tier requirements (in BNB)
    uint256[6] public tierRequirements = [
        0,                    // None
        0.1 ether,            // Bronze: 0.1 BNB
        1 ether,              // Silver: 1 BNB
        10 ether,             // Gold: 10 BNB
        50 ether,             // Platinum: 50 BNB
        100 ether             // Diamond: 100 BNB
    ];
    
    event Staked(address indexed user, uint256 amount, Tier newTier);
    event Unstaked(address indexed user, uint256 amount);
    event VoteCast(address indexed user, uint256 indexed marketId, uint8 vote, uint256 weight);
    event VoteRewarded(address indexed user, uint256 indexed marketId, uint256 reward);
    event VoteSlashed(address indexed user, uint256 indexed marketId, uint256 slashed);
    event ReputationNFTMinted(address indexed user, uint256 tokenId, Tier tier);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier);
    
    constructor() 
        ERC721("MetaPredict Reputation", "MPR")
        Ownable(msg.sender) 
    {
    }
    
    function setCoreContract(address _core) external onlyOwner {
        coreContract = _core;
    }
    
    // ============ Staking Functions ============
    
    /**
     * @notice Stake BNB para ganar reputación
     */
    function stake(address _user, uint256 _amount) 
        external 
        payable
        nonReentrant 
    {
        require(msg.sender == coreContract, "Only core");
        require(msg.value >= minStake, "Below min stake");
        require(msg.value == _amount, "Amount mismatch");
        
        Staker storage staker = stakers[_user];
        staker.stakedAmount += _amount;
        staker.lastUpdateTime = block.timestamp;
        
        totalStaked += _amount;
        
        // Update tier
        Tier oldTier = staker.tier;
        Tier newTier = _calculateTier(staker.stakedAmount);
        
        if (newTier > oldTier) {
            staker.tier = newTier;
            emit TierUpgraded(_user, oldTier, newTier);
            
            // Mint NFT badge if eligible
            if (newTier >= Tier.Gold && !staker.hasNFT) {
                _mintReputationNFT(_user, newTier);
            }
        }
        
        emit Staked(_user, _amount, newTier);
    }
    
    /**
     * @notice Unstake BNB (con cooldown period)
     */
    function unstake(uint256 _amount) 
        external 
        nonReentrant 
    {
        Staker storage staker = stakers[msg.sender];
        require(staker.stakedAmount >= _amount, "Insufficient stake");
        require(
            block.timestamp >= staker.lastUpdateTime + 7 days,
            "Cooldown period"
        );
        
        staker.stakedAmount -= _amount;
        totalStaked -= _amount;
        
        // Update tier
        Tier newTier = _calculateTier(staker.stakedAmount);
        if (newTier < staker.tier) {
            staker.tier = newTier;
        }
        
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, _amount);
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
    
    // ============ Voting Functions ============
    
    /**
     * @notice Vota en dispute de oracle
     */
    function recordVote(
        address _user,
        uint256 _marketId,
        uint8 _vote
    ) external {
        require(msg.sender == coreContract, "Only core");
        require(_vote >= 1 && _vote <= 3, "Invalid vote");
        
        Staker storage staker = stakers[_user];
        require(staker.stakedAmount >= minStake, "Must stake first");
        require(votes[_user][_marketId].marketId == 0, "Already voted");
        
        // Vote weight = sqrt(staked amount) para prevenir whale dominance
        uint256 weight = _sqrt(staker.stakedAmount);
        
        votes[_user][_marketId] = DisputeVote({
            marketId: _marketId,
            vote: _vote,
            stakeWeight: weight,
            rewarded: false,
            slashed: false
        });
        
        voteWeights[_marketId][_vote] += weight;
        userVotes[_user].push(_marketId);
        staker.totalVotes++;
        
        emit VoteCast(_user, _marketId, _vote, weight);
    }
    
    /**
     * @notice Procesa rewards/slashing después de resolución
     */
    function processVoteResult(
        uint256 _marketId,
        uint8 _correctOutcome
    ) external {
        require(msg.sender == coreContract, "Only core");
        
        // Find all voters for this market
        // (In production, use off-chain indexing + merkle proof)
        
        uint256 totalCorrectWeight = voteWeights[_marketId][_correctOutcome];
        uint256 rewardPool = 0;
        
        // First pass: slash incorrect voters
        for (uint256 i = 0; i < userVotes[msg.sender].length; i++) {
            uint256 marketId = userVotes[msg.sender][i];
            if (marketId != _marketId) continue;
            
            DisputeVote storage vote = votes[msg.sender][_marketId];
            Staker storage staker = stakers[msg.sender];
            
            if (vote.vote != _correctOutcome) {
                // Slash
                uint256 slashAmount = (staker.stakedAmount * slashingPenalty) / 10000;
                staker.stakedAmount -= slashAmount;
                staker.slashedAmount += slashAmount;
                totalSlashed += slashAmount;
                rewardPool += slashAmount;
                vote.slashed = true;
                
                emit VoteSlashed(msg.sender, _marketId, slashAmount);
            } else {
                staker.correctVotes++;
            }
            
            // Update reputation score
            staker.reputationScore = (staker.correctVotes * 100) / staker.totalVotes;
        }
        
        // Second pass: reward correct voters (proportional to weight)
        for (uint256 i = 0; i < userVotes[msg.sender].length; i++) {
            uint256 marketId = userVotes[msg.sender][i];
            if (marketId != _marketId) continue;
            
            DisputeVote storage vote = votes[msg.sender][_marketId];
            
            if (vote.vote == _correctOutcome && !vote.rewarded) {
                uint256 reward = (rewardPool * vote.stakeWeight) / totalCorrectWeight;
                stakers[msg.sender].stakedAmount += reward;
                vote.rewarded = true;
                
                emit VoteRewarded(msg.sender, _marketId, reward);
            }
        }
    }
    
    // ============ NFT Functions ============
    
    function _mintReputationNFT(address _user, Tier _tier) internal {
        uint256 tokenId = ++nftCounter;
        _safeMint(_user, tokenId);
        stakers[_user].hasNFT = true;
        
        emit ReputationNFTMinted(_user, tokenId, _tier);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        address owner = ownerOf(tokenId);
        Tier tier = stakers[owner].tier;
        
        // Return dynamic metadata based on tier and reputation
        return string(abi.encodePacked(
            "https://api.metapredict.ai/nft/",
            _uint2str(tokenId),
            "?tier=",
            _uint2str(uint256(tier))
        ));
    }
    
    // ============ View Functions ============
    
    function getStaker(address _user) 
        external 
        view 
        returns (Staker memory) 
    {
        return stakers[_user];
    }
    
    function getVote(address _user, uint256 _marketId) 
        external 
        view 
        returns (DisputeVote memory) 
    {
        return votes[_user][_marketId];
    }
    
    function getUserVotes(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userVotes[_user];
    }
    
    function getVoteWeights(uint256 _marketId) 
        external 
        view 
        returns (uint256 yes, uint256 no, uint256 invalid) 
    {
        yes = voteWeights[_marketId][1];
        no = voteWeights[_marketId][2];
        invalid = voteWeights[_marketId][3];
    }
    
    // ============ Internal Functions ============
    
    function _calculateTier(uint256 _amount) internal view returns (Tier) {
        if (_amount >= tierRequirements[5]) return Tier.Diamond;
        if (_amount >= tierRequirements[4]) return Tier.Platinum;
        if (_amount >= tierRequirements[3]) return Tier.Gold;
        if (_amount >= tierRequirements[2]) return Tier.Silver;
        if (_amount >= tierRequirements[1]) return Tier.Bronze;
        return Tier.None;
    }
    
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InsurancePool
 * @notice Pool de seguro con yield farming (BNB nativo)
 * @dev Protege contra fallos del oracle, genera yield en OPBNB
 * @dev Usa BNB nativo en lugar de tokens ERC20
 */
contract InsurancePool is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    address public coreContract;
    
    uint256 public totalInsured;
    uint256 public totalClaimed;
    uint256 public totalYieldGenerated;
    uint256 public utilizationRateBP; // basis points
    uint256 public maxUtilization = 8000; // 80% max
    
    // Insurance parameters
    uint256 public constant PREMIUM_FEE_BP = 10; // 0.1%
    uint256 public constant MIN_DEPOSIT = 0.01 ether; // 0.01 BNB
    uint256 public constant CLAIM_COOLDOWN = 1 hours;
    
    // Share-based system (similar to ERC4626 but for native BNB)
    uint256 public totalShares;
    mapping(address => uint256) public shares;
    
    struct InsurancePolicy {
        uint256 marketId;
        bool activated;
        uint256 reserve;
        uint256 claimed;
        uint256 activatedAt;
        uint256 expiresAt;
        mapping(address => bool) hasClaimed;
    }
    
    struct UserDeposit {
        uint256 amount;
        uint256 shares;
        uint256 depositedAt;
        uint256 lastYieldClaim;
    }
    
    mapping(uint256 => InsurancePolicy) public policies;
    mapping(address => UserDeposit) public deposits;
    mapping(address => uint256[]) public userPolicies;
    
    // Yield tracking
    uint256 public totalYieldAccrued;
    uint256 public lastYieldHarvest;
    uint256 public yieldPerShare; // scaled by 1e18
    
    // ============ Events ============
    
    event Deposited(
        address indexed user,
        uint256 assets,
        uint256 shares
    );
    
    event Withdrawn(
        address indexed user,
        uint256 assets,
        uint256 shares
    );
    
    event InsuranceActivated(
        uint256 indexed marketId,
        uint256 reserve,
        uint256 expiresAt
    );
    
    event ClaimProcessed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    event YieldHarvested(
        uint256 amount,
        uint256 timestamp
    );
    
    event YieldDistributed(
        address indexed user,
        uint256 amount
    );
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        lastYieldHarvest = block.timestamp;
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
    
    function setMaxUtilization(uint256 _maxBP) external onlyOwner {
        require(_maxBP <= 10000, "Invalid BP");
        maxUtilization = _maxBP;
    }
    
    // ============ Deposit/Withdraw Functions ============
    
    /**
     * @notice Deposita BNB para ganar yield + proteger mercados
     */
    function deposit(address receiver) 
        external 
        payable 
        nonReentrant 
        returns (uint256 userShares) 
    {
        require(msg.value >= MIN_DEPOSIT, "Below min deposit");
        
        // Harvest yield before deposit
        _harvestYield();
        
        // Calculate shares (1:1 initially, can be adjusted for yield)
        userShares = _convertToShares(msg.value);
        
        totalShares += userShares;
        shares[receiver] += userShares;
        
        deposits[receiver] = UserDeposit({
            amount: msg.value,
            shares: shares[receiver],
            depositedAt: block.timestamp,
            lastYieldClaim: block.timestamp
        });
        
        emit Deposited(receiver, msg.value, userShares);
        
        return userShares;
    }
    
    /**
     * @notice Retira BNB + yield acumulado
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 userShares) {
        require(msg.sender == owner || msg.sender == coreContract, "Unauthorized");
        
        // Claim pending yield first
        _claimYield(owner);
        
        // Check utilization
        uint256 available = totalAssets() - totalInsured + totalClaimed;
        require(assets <= available, "Insufficient liquidity");
        
        userShares = _convertToShares(assets);
        require(shares[owner] >= userShares, "Insufficient shares");
        
        totalShares -= userShares;
        shares[owner] -= userShares;
        
        // Update deposits
        if (deposits[owner].amount > 0) {
            if (deposits[owner].amount <= assets) {
                delete deposits[owner];
            } else {
                deposits[owner].amount -= assets;
                deposits[owner].shares -= userShares;
            }
        }
        
        // Transfer BNB
        (bool success, ) = payable(receiver).call{value: assets}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(owner, assets, userShares);
        
        return userShares;
    }
    
    // ============ Insurance Functions ============
    
    /**
     * @notice Recibe premium de insurance de apuestas
     */
    function receiveInsurancePremium(
        uint256 _marketId,
        uint256 _amount
    ) external payable onlyCore {
        require(msg.value >= _amount, "Insufficient BNB");
        
        policies[_marketId].reserve += _amount;
        totalInsured += _amount;
        
        // Update utilization
        uint256 total = totalAssets();
        if (total > 0) {
            utilizationRateBP = (totalInsured * 10000) / total;
        }
    }
    
    /**
     * @notice Activa seguro cuando oracle falla
     */
    function activateInsurance(uint256 _marketId) external onlyCore {
        InsurancePolicy storage policy = policies[_marketId];
        require(!policy.activated, "Already activated");
        require(policy.reserve > 0, "No reserve");
        
        policy.activated = true;
        policy.marketId = _marketId;
        policy.activatedAt = block.timestamp;
        policy.expiresAt = block.timestamp + 30 days;
        
        emit InsuranceActivated(_marketId, policy.reserve, policy.expiresAt);
    }
    
    /**
     * @notice Procesa claim de seguro
     */
    function processClaim(
        uint256 _marketId,
        address _user,
        uint256 _amount
    ) external onlyCore nonReentrant returns (uint256) {
        InsurancePolicy storage policy = policies[_marketId];
        require(policy.activated, "Not activated");
        require(!policy.hasClaimed[_user], "Already claimed");
        require(block.timestamp <= policy.expiresAt, "Policy expired");
        require(
            block.timestamp >= policy.activatedAt + CLAIM_COOLDOWN,
            "Cooldown period"
        );
        
        // Verify sufficient funds
        uint256 available = totalAssets() - totalInsured + totalClaimed;
        require(available >= _amount, "Insufficient funds");
        
        // Cap claim to reserve
        uint256 claimAmount = _amount;
        if (policy.claimed + claimAmount > policy.reserve) {
            claimAmount = policy.reserve - policy.claimed;
        }
        
        policy.hasClaimed[_user] = true;
        policy.claimed += claimAmount;
        totalClaimed += claimAmount;
        
        // Update utilization
        uint256 total = totalAssets();
        if (total > 0) {
            utilizationRateBP = ((totalInsured - totalClaimed) * 10000) / total;
        }
        
        // Transfer BNB
        (bool success, ) = payable(_user).call{value: claimAmount}("");
        require(success, "Transfer failed");
        
        emit ClaimProcessed(_marketId, _user, claimAmount);
        
        return claimAmount;
    }
    
    // ============ Yield Functions ============
    
    /**
     * @notice Harvest yield (simplified - can be extended with staking)
     */
    function _harvestYield() internal {
        if (block.timestamp < lastYieldHarvest + 1 hours) return;
        
        // Simple yield calculation (can be extended with actual staking)
        // For now, we'll use a simple interest rate
        uint256 timeElapsed = block.timestamp - lastYieldHarvest;
        uint256 baseYield = (totalAssets() * timeElapsed * 500) / (10000 * 365 days); // ~5% APY
        
        if (baseYield > 0 && totalShares > 0) {
            totalYieldGenerated += baseYield;
            totalYieldAccrued += baseYield;
            yieldPerShare += (baseYield * 1e18) / totalShares;
            lastYieldHarvest = block.timestamp;
            
            emit YieldHarvested(baseYield, block.timestamp);
        }
    }
    
    /**
     * @notice Reclama yield acumulado
     */
    function claimYield() external nonReentrant {
        _claimYield(msg.sender);
    }
    
    function _claimYield(address _user) internal {
        UserDeposit storage userDeposit = deposits[_user];
        if (userDeposit.shares == 0) return;
        
        _harvestYield();
        
        // Calculate pending yield
        uint256 pendingYield = (userDeposit.shares * yieldPerShare) / 1e18;
        uint256 lastClaimed = (userDeposit.shares * 
            (yieldPerShare - ((block.timestamp - userDeposit.lastYieldClaim) * 1e18 / 365 days))
        ) / 1e18;
        
        uint256 claimable = pendingYield > lastClaimed ? pendingYield - lastClaimed : 0;
        
        if (claimable > 0) {
            userDeposit.lastYieldClaim = block.timestamp;
            
            (bool success, ) = payable(_user).call{value: claimable}("");
            require(success, "Transfer failed");
            
            emit YieldDistributed(_user, claimable);
        }
    }
    
    // ============ Internal Functions ============
    
    function _convertToShares(uint256 assets) internal view returns (uint256) {
        if (totalShares == 0 || totalAssets() == 0) {
            return assets; // 1:1 initially
        }
        return (assets * totalShares) / totalAssets();
    }
    
    function _convertToAssets(uint256 _shares) internal view returns (uint256) {
        if (totalShares == 0) return 0;
        return (_shares * totalAssets()) / totalShares;
    }
    
    function totalAssets() public view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ View Functions ============
    
    function getPoolHealth() external view returns (
        uint256 totalAsset,
        uint256 insured,
        uint256 claimed,
        uint256 available,
        uint256 utilizationRate,
        uint256 yieldAPY
    ) {
        totalAsset = totalAssets();
        insured = totalInsured;
        claimed = totalClaimed;
        available = totalAsset - insured + claimed;
        utilizationRate = utilizationRateBP;
        
        // Calculate APY (simplified)
        if (block.timestamp > lastYieldHarvest && totalAsset > 0) {
            uint256 timeElapsed = block.timestamp - lastYieldHarvest;
            uint256 yearlyYield = (totalYieldGenerated * 365 days) / (timeElapsed + 1);
            yieldAPY = (yearlyYield * 10000) / totalAsset;
        }
    }
    
    function getPolicyStatus(uint256 _marketId) 
        external 
        view 
        returns (
            bool activated,
            uint256 reserve,
            uint256 claimed,
            uint256 expiresAt,
            bool expired
        ) 
    {
        InsurancePolicy storage policy = policies[_marketId];
        activated = policy.activated;
        reserve = policy.reserve;
        claimed = policy.claimed;
        expiresAt = policy.expiresAt;
        expired = block.timestamp > policy.expiresAt;
    }
    
    function getUserDeposit(address _user) 
        external 
        view 
        returns (UserDeposit memory) 
    {
        return deposits[_user];
    }
    
    function getPendingYield(address _user) 
        external 
        view 
        returns (uint256) 
    {
        UserDeposit storage userDeposit = deposits[_user];
        if (userDeposit.shares == 0) return 0;
        
        uint256 pendingYield = (userDeposit.shares * yieldPerShare) / 1e18;
        uint256 lastClaimed = (userDeposit.shares * 
            (yieldPerShare - ((block.timestamp - userDeposit.lastYieldClaim) * 1e18 / 365 days))
        ) / 1e18;
        
        return pendingYield > lastClaimed ? pendingYield - lastClaimed : 0;
    }
    
    function hasClaimed(uint256 _marketId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return policies[_marketId].hasClaimed[_user];
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVenus.sol";

/**
 * @title InsurancePool
 * @notice Pool de seguro ERC-4626 con yield farming en Venus Protocol
 * @dev Protege contra fallos del oracle, genera APY del 5-12% en opBNB
 */
contract InsurancePool is ERC4626, Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    address public coreContract;
    address public venusVToken; // vUSDC en opBNB
    
    uint256 public totalInsured;
    uint256 public totalClaimed;
    uint256 public totalYieldGenerated;
    uint256 public utilizationRateBP; // basis points
    uint256 public maxUtilization = 8000; // 80% max
    
    // Insurance parameters
    uint256 public constant PREMIUM_FEE_BP = 10; // 0.1%
    uint256 public constant MIN_DEPOSIT = 10e6; // $10
    uint256 public constant CLAIM_COOLDOWN = 1 hours;
    
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
    
    constructor(
        IERC20 _asset,
        address _venusVToken,
        string memory _name,
        string memory _symbol
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        venusVToken = _venusVToken;
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
    
    function setVenusVToken(address _vToken) external onlyOwner {
        venusVToken = _vToken;
    }
    
    function setMaxUtilization(uint256 _maxBP) external onlyOwner {
        require(_maxBP <= 10000, "Invalid BP");
        maxUtilization = _maxBP;
    }
    
    // ============ Deposit/Withdraw Functions ============
    
    /**
     * @notice Deposita USDC para ganar yield + proteger mercados
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public override nonReentrant returns (uint256 shares) {
        require(assets >= MIN_DEPOSIT, "Below min deposit");
        
        // Harvest yield before deposit
        _harvestYield();
        
        shares = super.deposit(assets, receiver);
        
        deposits[receiver] = UserDeposit({
            amount: assets,
            shares: shares,
            depositedAt: block.timestamp,
            lastYieldClaim: block.timestamp
        });
        
        // Stake 70% en Venus para yield
        uint256 stakeAmount = (assets * 7000) / 10000;
        _stakeInVenus(stakeAmount);
        
        emit Deposited(receiver, assets, shares);
        
        return shares;
    }
    
    /**
     * @notice Retira USDC + yield acumulado
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override nonReentrant returns (uint256 shares) {
        // Claim pending yield first
        _claimYield(owner);
        
        // Check utilization
        uint256 available = totalAssets() - totalInsured + totalClaimed;
        require(assets <= available, "Insufficient liquidity");
        
        // Unstake from Venus if needed
        if (IERC20(asset()).balanceOf(address(this)) < assets) {
            uint256 toUnstake = assets - IERC20(asset()).balanceOf(address(this));
            _unstakeFromVenus(toUnstake);
        }
        
        shares = super.withdraw(assets, receiver, owner);
        
        // Update deposits
        if (deposits[owner].amount > 0) {
            if (deposits[owner].amount <= assets) {
                delete deposits[owner];
            } else {
                deposits[owner].amount -= assets;
            }
        }
        
        emit Withdrawn(owner, assets, shares);
        
        return shares;
    }
    
    // ============ Insurance Functions ============
    
    /**
     * @notice Recibe premium de insurance de apuestas
     */
    function receiveInsurancePremium(
        uint256 _marketId,
        uint256 _amount
    ) external onlyCore {
        require(
            IERC20(asset()).transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        policies[_marketId].reserve += _amount;
        totalInsured += _amount;
        
        // Update utilization
        utilizationRateBP = (totalInsured * 10000) / totalAssets();
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
        utilizationRateBP = ((totalInsured - totalClaimed) * 10000) / totalAssets();
        
        // Transfer USDC
        require(
            IERC20(asset()).transfer(_user, claimAmount),
            "Transfer failed"
        );
        
        emit ClaimProcessed(_marketId, _user, claimAmount);
        
        return claimAmount;
    }
    
    // ============ Yield Functions ============
    
    /**
     * @notice Harvest yield de Venus Protocol
     */
    function _harvestYield() internal {
        if (block.timestamp < lastYieldHarvest + 1 hours) return;
        
        // Get underlying balance from Venus
        uint256 venusBalance = IVenus(venusVToken).balanceOfUnderlying(address(this));
        uint256 deposited = (totalAssets() * 7000) / 10000;
        
        if (venusBalance > deposited) {
            uint256 yield = venusBalance - deposited;
            
            // Redeem yield only
            IVenus(venusVToken).redeemUnderlying(yield);
            
            totalYieldGenerated += yield;
            totalYieldAccrued += yield;
            lastYieldHarvest = block.timestamp;
            
            // Update yield per share
            uint256 totalShares = totalSupply();
            if (totalShares > 0) {
                yieldPerShare += (yield * 1e18) / totalShares;
            }
            
            emit YieldHarvested(yield, block.timestamp);
        }
    }
    
    /**
     * @notice Reclama yield acumulado
     */
    function claimYield() external nonReentrant {
        _claimYield(msg.sender);
    }
    
    function _claimYield(address _user) internal {
        UserDeposit storage deposit = deposits[_user];
        if (deposit.shares == 0) return;
        
        _harvestYield();
        
        // Calculate pending yield
        uint256 pendingYield = (deposit.shares * yieldPerShare) / 1e18;
        uint256 lastClaimed = (deposit.shares * 
            (yieldPerShare - ((block.timestamp - deposit.lastYieldClaim) * 1e18 / 365 days))
        ) / 1e18;
        
        uint256 claimable = pendingYield - lastClaimed;
        
        if (claimable > 0) {
            deposit.lastYieldClaim = block.timestamp;
            
            require(
                IERC20(asset()).transfer(_user, claimable),
                "Transfer failed"
            );
            
            emit YieldDistributed(_user, claimable);
        }
    }
    
    /**
     * @notice Stake en Venus Protocol
     */
    function _stakeInVenus(uint256 _amount) internal {
        if (_amount == 0) return;
        
        IERC20(asset()).approve(venusVToken, _amount);
        
        uint256 mintResult = IVenus(venusVToken).mint(_amount);
        require(mintResult == 0, "Venus mint failed");
    }
    
    /**
     * @notice Unstake de Venus Protocol
     */
    function _unstakeFromVenus(uint256 _amount) internal {
        uint256 redeemResult = IVenus(venusVToken).redeemUnderlying(_amount);
        require(redeemResult == 0, "Venus redeem failed");
    }
    
    /**
     * @notice Emergency withdraw de Venus
     */
    function emergencyUnstakeAll() external onlyOwner {
        uint256 venusBalance = IVenus(venusVToken).balanceOfUnderlying(address(this));
        if (venusBalance > 0) {
            _unstakeFromVenus(venusBalance);
        }
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
        uint256 yearlyYield = (totalYieldGenerated * 365 days) / 
                              (block.timestamp - lastYieldHarvest + 1);
        yieldAPY = totalAsset > 0 ? (yearlyYield * 10000) / totalAsset : 0;
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
        UserDeposit storage deposit = deposits[_user];
        if (deposit.shares == 0) return 0;
        
        uint256 pendingYield = (deposit.shares * yieldPerShare) / 1e18;
        uint256 lastClaimed = (deposit.shares * 
            (yieldPerShare - ((block.timestamp - deposit.lastYieldClaim) * 1e18 / 365 days))
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
}

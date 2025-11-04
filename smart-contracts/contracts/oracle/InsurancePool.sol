// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVenus.sol";

/**
 * @title InsurancePool
 * @notice Pool de seguro ERC-4626 con yield en Venus Protocol
 */
contract InsurancePool is ERC4626, Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    address public predictionMarket;
    address public venusVToken; // vUSDC en opBNB
    
    uint256 public totalInsured;
    uint256 public totalClaimed;
    uint256 public utilizationRate; // basis points
    
    mapping(uint256 => InsuranceStatus) public marketInsurance;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    struct InsuranceStatus {
        bool activated;
        uint256 reserve;
        uint256 claimed;
        uint256 timestamp;
    }
    
    // ============ Events ============
    
    event InsuranceActivated(
        uint256 indexed marketId,
        uint256 reserve,
        uint256 timestamp
    );
    
    event ClaimProcessed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    event YieldDeposited(uint256 amount, uint256 shares);
    
    // ============ Constructor ============
    
    constructor(
        IERC20 _asset,
        address _venusVToken,
        string memory _name,
        string memory _symbol
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        venusVToken = _venusVToken;
    }
    
    // ============ Core Functions ============
    
    function setPredictionMarket(address _market) external onlyOwner {
        predictionMarket = _market;
    }
    
    /**
     * @notice Activa seguro para un mercado disputado
     */
    function activateInsurance(uint256 _marketId, uint256 _reserve) external {
        require(msg.sender == predictionMarket, "Only market");
        require(!marketInsurance[_marketId].activated, "Already activated");
        
        marketInsurance[_marketId] = InsuranceStatus({
            activated: true,
            reserve: _reserve,
            claimed: 0,
            timestamp: block.timestamp
        });
        
        totalInsured += _reserve;
        
        emit InsuranceActivated(_marketId, _reserve, block.timestamp);
    }
    
    /**
     * @notice Procesa claim de seguro
     */
    function processClaim(
        uint256 _marketId,
        address _user,
        uint256 _amount
    ) external nonReentrant returns (uint256) {
        require(msg.sender == predictionMarket, "Only market");
        require(marketInsurance[_marketId].activated, "Not activated");
        require(!hasClaimed[_marketId][_user], "Already claimed");
        
        // Verificar que hay fondos suficientes
        uint256 available = totalAssets() - totalInsured + totalClaimed;
        require(available >= _amount, "Insufficient funds");
        
        hasClaimed[_marketId][_user] = true;
        marketInsurance[_marketId].claimed += _amount;
        totalClaimed += _amount;
        
        // Transfer USDC al usuario
        require(
            IERC20(asset()).transfer(_user, _amount),
            "Transfer failed"
        );
        
        emit ClaimProcessed(_marketId, _user, _amount);
        
        return _amount;
    }
    
    /**
     * @notice Deposita yield de Venus Protocol
     */
    function depositYield() external onlyOwner {
        // Harvest yield from Venus vToken
        uint256 yield = IVenus(venusVToken).balanceOfUnderlying(address(this)) -
                        totalAssets();
        
        if (yield > 0) {
            IVenus(venusVToken).redeemUnderlying(yield);
            emit YieldDeposited(yield, 0);
        }
    }
    
    /**
     * @notice Stake USDC en Venus para generar yield
     */
    function stakeInVenus(uint256 _amount) external onlyOwner {
        require(_amount <= totalAssets(), "Insufficient balance");
        
        IERC20(asset()).approve(venusVToken, _amount);
        IVenus(venusVToken).mint(_amount);
    }
    
    // ============ View Functions ============
    
    function getInsuranceStatus(uint256 _marketId) 
        external 
        view 
        returns (InsuranceStatus memory) 
    {
        return marketInsurance[_marketId];
    }
    
    function getPoolHealth() external view returns (
        uint256 totalAsset,
        uint256 insured,
        uint256 claimed,
        uint256 available
    ) {
        totalAsset = totalAssets();
        insured = totalInsured;
        claimed = totalClaimed;
        available = totalAsset - insured + claimed;
    }
}


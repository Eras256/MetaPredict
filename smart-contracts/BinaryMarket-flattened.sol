// Sources flattened with hardhat v3.1.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File npm/@openzeppelin/contracts@5.4.0/utils/Context.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File npm/@openzeppelin/contracts@5.4.0/access/Ownable.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File npm/@openzeppelin/contracts@5.4.0/utils/ReentrancyGuard.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/markets/BinaryMarket.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;
/**
 * @title BinaryMarket
 * @notice Mercado de predicci├│n binario est├índar (YES/NO)
 * @dev Usa BNB nativo en lugar de tokens ERC20
 */
contract BinaryMarket is Ownable, ReentrancyGuard {
    address public immutable coreContract;
    
    struct Market {
        string question;
        string description;
        uint256 resolutionTime;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        uint8 outcome; // 1=Yes, 2=No, 3=Invalid
    }
    
    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 avgYesPrice;
        uint256 avgNoPrice;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 shares
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        uint8 outcome
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    constructor(address _coreContract) 
        Ownable(msg.sender) 
    {
        coreContract = _coreContract;
    }
    
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core");
        _;
    }
    
    function createMarket(
        uint256 _marketId,
        string calldata _question,
        string calldata _description,
        uint256 _resolutionTime,
        string calldata // _metadata unused here
    ) external onlyCore {
        markets[_marketId] = Market({
            question: _question,
            description: _description,
            resolutionTime: _resolutionTime,
            totalYesShares: 0,
            totalNoShares: 0,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcome: 0
        });
    }
    
    function placeBet(
        uint256 _marketId,
        address _user,
        bool _isYes,
        uint256 _amount
    ) external payable onlyCore nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(msg.value == _amount, "Amount mismatch");
        
        // Calculate shares (constant product AMM)
        uint256 shares = _calculateShares(market, _isYes, _amount);
        uint256 avgPrice = (_amount * 1e18) / shares;
        
        if (_isYes) {
            market.yesPool += _amount;
            market.totalYesShares += shares;
            positions[_marketId][_user].yesShares += shares;
            positions[_marketId][_user].avgYesPrice = _calculateAvgPrice(
                positions[_marketId][_user].avgYesPrice,
                positions[_marketId][_user].yesShares - shares,
                avgPrice,
                shares
            );
        } else {
            market.noPool += _amount;
            market.totalNoShares += shares;
            positions[_marketId][_user].noShares += shares;
            positions[_marketId][_user].avgNoPrice = _calculateAvgPrice(
                positions[_marketId][_user].avgNoPrice,
                positions[_marketId][_user].noShares - shares,
                avgPrice,
                shares
            );
        }
        
        emit BetPlaced(_marketId, _user, _isYes, _amount, shares);
    }
    
    function resolveMarket(uint256 _marketId, uint8 _outcome) 
        external 
        onlyCore 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        
        market.resolved = true;
        market.outcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }
    
    function claimWinnings(uint256 _marketId) 
        external 
        nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        require(
            position.yesShares > 0 || position.noShares > 0,
            "No position"
        );
        
        uint256 payout = 0;
        
        if (market.outcome == 1 && position.yesShares > 0) {
            payout = (position.yesShares * (market.yesPool + market.noPool)) / 
                     market.totalYesShares;
        } else if (market.outcome == 2 && position.noShares > 0) {
            payout = (position.noShares * (market.yesPool + market.noPool)) / 
                     market.totalNoShares;
        } else if (market.outcome == 3) {
            uint256 yesInvested = (position.yesShares * position.avgYesPrice) / 1e18;
            uint256 noInvested = (position.noShares * position.avgNoPrice) / 1e18;
            payout = yesInvested + noInvested;
        }
        
        require(payout > 0, "No winnings");
        
        position.claimed = true;
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, payout);
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
    
    function _calculateShares(
        Market storage market,
        bool _isYes,
        uint256 _amount
    ) internal view returns (uint256) {
        uint256 pool = _isYes ? market.yesPool : market.noPool;
        uint256 totalShares = _isYes ? market.totalYesShares : market.totalNoShares;
        
        if (totalShares == 0) {
            return _amount;
        }
        
        return (_amount * totalShares) / pool;
    }
    
    function _calculateAvgPrice(
        uint256 _oldAvg,
        uint256 _oldShares,
        uint256 _newPrice,
        uint256 _newShares
    ) internal pure returns (uint256) {
        if (_oldShares == 0) return _newPrice;
        
        return ((_oldAvg * _oldShares) + (_newPrice * _newShares)) / 
               (_oldShares + _newShares);
    }
    
    function getMarket(uint256 _marketId) 
        external 
        view 
        returns (Market memory) 
    {
        return markets[_marketId];
    }
    
    function getPosition(uint256 _marketId, address _user) 
        external 
        view 
        returns (Position memory) 
    {
        return positions[_marketId][_user];
    }
    
    function getCurrentOdds(uint256 _marketId) 
        external 
        view 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market storage market = markets[_marketId];
        
        uint256 totalPool = market.yesPool + market.noPool;
        if (totalPool == 0) return (5000, 5000);
        
        yesOdds = (market.yesPool * 10000) / totalPool;
        noOdds = (market.noPool * 10000) / totalPool;
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../core/PredictionMarketCore.sol";

/**
 * @title MaliciousReentrancyContract
 * @notice Contract used for testing reentrancy protection
 * @dev This contract attempts to exploit reentrancy vulnerabilities
 */
contract MaliciousReentrancyContract {
    PredictionMarketCore public target;
    uint256 public marketId;
    bool public attacking;

    constructor(address _target) {
        target = PredictionMarketCore(payable(_target));
    }

    function attack(uint256 _marketId) external payable {
        marketId = _marketId;
        attacking = true;
        
        // Attempt to place bet and reenter
        target.placeBet{value: msg.value}(_marketId, true);
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            // Attempt reentrancy attack
            try target.placeBet(marketId, true) {} catch {}
        }
    }
}


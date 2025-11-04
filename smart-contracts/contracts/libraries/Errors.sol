// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Errors
 * @notice Custom errors library para optimización de gas
 * @dev Usar custom errors en lugar de require strings ahorra gas
 */
library Errors {
    // Market Errors
    error InvalidAmount();
    error MarketNotActive();
    error MarketExpired();
    error MarketNotFound();
    error MarketAlreadyResolved();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidOutcome();
    error AlreadyClaimed();
    error InvalidTime();
    error QuestionTooShort();
    error InvalidBetAmount();
    
    // Oracle Errors
    error UnauthorizedResolver();
    error ConsensusNotReached();
    error InvalidRequestId();
    error OracleNotReady();
    error ResolutionFailed();
    
    // Insurance Errors
    error InsurancePoolEmpty();
    error InsuranceNotActivated();
    error InsuranceAlreadyClaimed();
    error InsufficientInsuranceFunds();
    
    // Reputation Errors
    error StakeTooLow();
    error ReputationNotEnough();
    error Unauthorized();
    
    // Cross-Chain Errors
    error CrossChainFailed();
    error InvalidChain();
    error MessageNotReceived();
    
    // Pyth Errors
    error PythPriceNotFound();
    error PythPriceStale();
    error InvalidPriceId();
}


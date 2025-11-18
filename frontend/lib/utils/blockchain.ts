/**
 * Blockchain utility functions
 */

const OPBNB_SCAN_BASE_URL = 'https://testnet.opbnbscan.com';

/**
 * Generate opBNBScan URL for a transaction hash
 */
export function getTransactionUrl(txHash: string): string {
  return `${OPBNB_SCAN_BASE_URL}/tx/${txHash}`;
}

/**
 * Generate opBNBScan URL for an address
 */
export function getAddressUrl(address: string): string {
  return `${OPBNB_SCAN_BASE_URL}/address/${address}`;
}

/**
 * Format transaction hash for display (first 6 + last 4 characters)
 */
export function formatTxHash(txHash: string): string {
  if (!txHash || txHash.length < 10) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

/**
 * Format address for display (first 6 + last 4 characters)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


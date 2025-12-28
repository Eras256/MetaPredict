import crypto from 'crypto';
import { logger } from './logger';

/**
 * Validates Chainlink Functions request signature
 * 
 * Chainlink Functions can send requests with:
 * 1. HMAC signature in x-chainlink-signature header
 * 2. Secret token in x-chainlink-secret header
 * 3. Or no authentication (for development/testing)
 */

export interface ChainlinkAuthResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validates Chainlink Functions request
 * @param signature Signature from x-chainlink-signature header
 * @param secret Secret from x-chainlink-secret header (if used)
 * @param body Request body (stringified)
 * @param timestamp Timestamp from x-chainlink-timestamp header (if used)
 */
export function validateChainlinkSignature(
  signature: string | undefined,
  secret: string | undefined,
  body: string,
  timestamp?: string
): ChainlinkAuthResult {
  // If no signature validation is configured, allow in development
  const chainlinkSecret = process.env.CHAINLINK_SECRET || process.env.CHAINLINK_FUNCTIONS_SECRET;
  const requireAuth = process.env.CHAINLINK_REQUIRE_AUTH !== 'false';
  
  // In development, allow requests without auth if explicitly disabled
  if (!requireAuth && process.env.NODE_ENV !== 'production') {
    logger.warn('[ChainlinkAuth] Signature validation disabled (development mode)');
    return { isValid: true };
  }
  
  // If secret is configured, validate using secret token
  if (chainlinkSecret) {
    if (!secret || secret !== chainlinkSecret) {
      logger.warn('[ChainlinkAuth] Invalid secret token');
      return { 
        isValid: false, 
        reason: 'Invalid secret token' 
      };
    }
    logger.info('[ChainlinkAuth] Secret token validated');
    return { isValid: true };
  }
  
  // If signature is provided, validate HMAC-SHA256
  if (signature) {
    const chainlinkSecret = process.env.CHAINLINK_SECRET || process.env.CHAINLINK_FUNCTIONS_SECRET;
    
    if (!chainlinkSecret) {
      logger.warn('[ChainlinkAuth] Signature provided but no secret configured for HMAC validation');
      // In development, allow if signature exists
      if (process.env.NODE_ENV !== 'production') {
        return { isValid: true };
      }
      return {
        isValid: false,
        reason: 'HMAC secret not configured'
      };
    }

    try {
      // Chainlink Functions uses HMAC-SHA256
      // Format: HMAC-SHA256(timestamp + body, secret)
      const timestampStr = timestamp || '';
      const message = timestampStr + body;
      
      const hmac = crypto.createHmac('sha256', chainlinkSecret);
      hmac.update(message);
      const expectedSignature = hmac.digest('hex');
      
      // Compare signatures (constant-time comparison to prevent timing attacks)
      const providedSignature = signature.replace(/^sha256=/, ''); // Remove prefix if present
      
      if (expectedSignature.length !== providedSignature.length) {
        logger.warn('[ChainlinkAuth] Signature length mismatch');
        return {
          isValid: false,
          reason: 'Invalid signature format'
        };
      }

      // Constant-time comparison
      let isValid = true;
      for (let i = 0; i < expectedSignature.length; i++) {
        if (expectedSignature[i] !== providedSignature[i]) {
          isValid = false;
        }
      }

      if (!isValid) {
        logger.warn('[ChainlinkAuth] HMAC signature validation failed');
        return {
          isValid: false,
          reason: 'Invalid signature'
        };
      }

      logger.info('[ChainlinkAuth] HMAC signature validated successfully');
      return { isValid: true };
    } catch (error: any) {
      logger.error(`[ChainlinkAuth] Error validating HMAC: ${error.message}`);
      return {
        isValid: false,
        reason: 'Signature validation error'
      };
    }
  }
  
  // If no auth method is configured and we're in production, reject
  if (process.env.NODE_ENV === 'production' && !chainlinkSecret && !signature) {
    logger.error('[ChainlinkAuth] No authentication method configured in production');
    return { 
      isValid: false, 
      reason: 'No authentication configured' 
    };
  }
  
  // Default: allow if no strict validation is required
  logger.warn('[ChainlinkAuth] No signature validation performed');
  return { isValid: true };
}

/**
 * Validates request origin (IP whitelist)
 * This is an additional security layer
 */
export function validateChainlinkOrigin(ip: string | undefined): ChainlinkAuthResult {
  const allowedIPs = process.env.CHAINLINK_ALLOWED_IPS?.split(',') || [];
  
  if (allowedIPs.length === 0) {
    // No IP whitelist configured, allow all
    return { isValid: true };
  }
  
  if (!ip) {
    return { 
      isValid: false, 
      reason: 'IP address not available' 
    };
  }
  
  const isValid = allowedIPs.some(allowedIP => {
    // Support CIDR notation or exact IPs
    if (allowedIP.includes('/')) {
      // TODO: Implement CIDR matching if needed
      return ip.startsWith(allowedIP.split('/')[0]);
    }
    return ip === allowedIP;
  });
  
  if (!isValid) {
    logger.warn(`[ChainlinkAuth] Request from unauthorized IP: ${ip}`);
  }
  
  return { 
    isValid, 
    reason: isValid ? undefined : 'IP not whitelisted' 
  };
}


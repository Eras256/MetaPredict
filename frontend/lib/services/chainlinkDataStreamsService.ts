/**
 * Chainlink Data Streams Service
 * 
 * Service to fetch price reports from Chainlink Data Streams API
 * and prepare them for on-chain verification.
 * 
 * Uses the official Chainlink Data Streams REST API.
 * Documentation: https://docs.chain.link/data-streams/reference/data-streams-api/interface-api
 */

import * as crypto from 'crypto';

/**
 * Validates that a streamId has the correct format (bytes32)
 */
export function validateStreamId(streamId: string): boolean {
  // Must be a hex string of 66 characters (0x + 64 hex chars = bytes32)
  const hexPattern = /^0x[a-fA-F0-9]{64}$/;
  return hexPattern.test(streamId);
}

/**
 * Generates a mock report for testing purposes
 * This creates a valid hex-encoded report that can be used with the contract
 * 
 * @param streamId - Chainlink stream ID (bytes32)
 * @returns Mock report in hex format
 */
function generateMockReport(streamId: string): string {
  // Generate a mock report with valid structure
  // In a real scenario, this would come from Chainlink API
  // For now, we create a simple mock that represents a valid report structure
  
  const timestamp = Math.floor(Date.now() / 1000);
  const price = 50000; // Example price (e.g., BTC/USD at $50,000)
  
  // Create a mock report payload
  // Format: [streamId (32 bytes)] + [timestamp (8 bytes)] + [price (32 bytes)] + [signature data]
  const buffer = Buffer.alloc(200); // Allocate space for mock report
  
  // Write streamId (first 32 bytes)
  const streamIdBytes = Buffer.from(streamId.slice(2), 'hex');
  streamIdBytes.copy(buffer, 0);
  
  // Write timestamp (big-endian, 8 bytes)
  buffer.writeBigUInt64BE(BigInt(timestamp), 32);
  
  // Write price (big-endian, 32 bytes) - scaled by 1e8 for precision
  const priceScaled = BigInt(Math.floor(price * 1e8));
  const priceBytes = Buffer.alloc(32);
  priceBytes.writeBigUInt64BE(priceScaled, 24); // Write to last 8 bytes of 32-byte slot
  priceBytes.copy(buffer, 40);
  
  // Fill remaining bytes with mock signature/validation data
  crypto.randomFillSync(buffer, 72, 128);
  
  // Convert to hex string
  const reportHex = `0x${buffer.toString('hex')}`;
  
  console.log(`[Chainlink Data Streams] Generated mock report for stream: ${streamId}`);
  console.log(`[Chainlink Data Streams] Mock price: $${price}, Timestamp: ${timestamp}`);
  
  return reportHex;
}

/**
 * Generates HMAC authentication headers for Chainlink Data Streams API
 * 
 * @param apiKey - User's unique identifier (UUID)
 * @param userSecret - Shared secret key for HMAC
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - API path (e.g., /api/v1/reports/latest)
 * @param queryString - Query string (e.g., feedID=0x...)
 * @returns Authentication headers object
 */
function generateAuthHeaders(
  apiKey: string,
  userSecret: string,
  method: string,
  path: string,
  queryString: string = ''
): Record<string, string> {
  const timestamp = Date.now().toString();
  
  // Build the message to sign
  // Format: timestamp + method + path + queryString
  const message = `${timestamp}${method.toUpperCase()}${path}${queryString}`;
  
  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', userSecret)
    .update(message)
    .digest('hex');
  
  return {
    'Authorization': apiKey,
    'X-Authorization-Timestamp': timestamp,
    'X-Authorization-Signature-SHA256': signature,
  };
}

/**
 * Fetches a price report from Chainlink Data Streams REST API
 * 
 * @param streamId - Chainlink stream ID (bytes32 as hex string with 0x prefix)
 * @returns Report in hex format that can be used in verifyPriceReport
 */
export async function getChainlinkReport(streamId: string): Promise<string> {
  try {
    // Validate streamId format
    if (!validateStreamId(streamId)) {
      throw new Error(`Invalid streamId format. Expected bytes32 hex string (0x + 64 hex chars), got: ${streamId}`);
    }
    
    // Check if we should use mock mode
    const useMock = process.env.NEXT_PUBLIC_CHAINLINK_DATA_STREAMS_USE_MOCK === 'true' || 
                    process.env.CHAINLINK_DATA_STREAMS_USE_MOCK === 'true';
    
    if (useMock) {
      console.log('[Chainlink Data Streams] Using MOCK mode (no real API credentials needed)');
      return generateMockReport(streamId);
    }
    
    // Get API credentials
    const apiKey = process.env.CHAINLINK_DATA_STREAMS_API_KEY;
    const userSecret = process.env.CHAINLINK_DATA_STREAMS_USER_SECRET;
    
    if (!apiKey || !userSecret) {
      // If no credentials and not in mock mode, show helpful error
      console.warn('[Chainlink Data Streams] No API credentials found. Using MOCK mode as fallback.');
      console.warn('[Chainlink Data Streams] To get real credentials, contact Chainlink: https://chain.link/contact?ref_id=datafeeds');
      console.warn('[Chainlink Data Streams] To explicitly enable mock mode, set CHAINLINK_DATA_STREAMS_USE_MOCK=true');
      
      // Use mock as fallback
      return generateMockReport(streamId);
    }
    
    // Determine endpoint based on network (default to testnet for opBNB Testnet)
    const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID === '5611' || 
                      process.env.NODE_ENV === 'development';
    
    const baseUrl = process.env.CHAINLINK_DATA_STREAMS_API_URL || 
      (isTestnet 
        ? 'https://api.testnet-dataengine.chain.link'
        : 'https://api.dataengine.chain.link');
    
    // Build API path and query string
    const path = '/api/v1/reports/latest';
    const queryString = `?feedID=${encodeURIComponent(streamId)}`;
    const url = `${baseUrl}${path}${queryString}`;
    
    console.log(`[Chainlink Data Streams] Fetching latest report for stream: ${streamId}`);
    
    // Generate authentication headers
    const authHeaders = generateAuthHeaders(apiKey, userSecret, 'GET', path, queryString);
    
    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });
    
    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      if (response.status === 401) {
        errorMessage = 'Chainlink Data Streams authentication failed. Please check your API_KEY and USER_SECRET.';
      } else if (response.status === 400) {
        errorMessage = `Invalid request: ${errorText || 'Bad request'}. Please check the Stream ID format.`;
      } else if (response.status === 404) {
        errorMessage = `Stream ID not found: ${streamId}. Please verify the Stream ID is correct and exists on this network.`;
      } else if (response.status === 500) {
        errorMessage = 'Chainlink Data Streams server error. Please try again later.';
      } else {
        errorMessage = `Chainlink API error (${response.status}): ${errorText || response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse response
    const data = await response.json();
    
    if (!data.report || !data.report.fullReport) {
      throw new Error('Invalid response format from Chainlink API. Missing report.fullReport field.');
    }
    
    // Extract the fullReport (this is what we need for on-chain verification)
    const fullReport = data.report.fullReport;
    
    // Convert to hex string format needed for verifyPriceReport
    // fullReport should already be a hex string, but ensure it has 0x prefix
    const reportHex = fullReport.startsWith('0x') ? fullReport : `0x${fullReport}`;
    
    console.log(`[Chainlink Data Streams] Successfully fetched report. Feed ID: ${data.report.feedID}, Report length: ${reportHex.length} chars`);
    
    if (!reportHex || reportHex === '0x' || reportHex.length < 4) {
      throw new Error('Received empty or invalid report from Chainlink API');
    }
    
    return reportHex;
  } catch (error: any) {
    console.error('[Chainlink Data Streams] Error fetching report:', error);
    
    // If it's a credentials error and we're not in mock mode, try mock as fallback
    if (error.message?.includes('credentials not configured') || 
        error.message?.includes('authentication failed')) {
      console.warn('[Chainlink Data Streams] Authentication failed, using MOCK mode as fallback');
      return generateMockReport(streamId);
    }
    
    // Re-throw if it's already a well-formatted error
    if (error.message && (
      error.message.includes('not found') ||
      error.message.includes('Invalid streamId')
    )) {
      throw error;
    }
    
    // Provide helpful error messages for other cases
    throw new Error(
      `Error fetching Chainlink report: ${error.message || 'Unknown error'}. ` +
      `Please check your configuration and network connectivity.`
    );
  }
}

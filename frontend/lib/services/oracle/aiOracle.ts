/**
 * Oracle service for AI resolution
 */

export interface OracleRequest {
  marketId: number;
  question: string;
  description: string;
  metadata?: string;
}

export interface OracleResponse {
  outcome: number; // 1=Yes, 2=No, 3=Invalid
  confidence: number; // 0-100
  evidence: string; // IPFS hash
  modelVotes: {
    gpt4: number;
    claude: number;
    gemini: number;
    llama: number;
    mistral: number;
  };
}

export async function requestOracleResolution(request: OracleRequest): Promise<OracleResponse> {
  const response = await fetch('/api/oracle/resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to request oracle resolution');
  }

  return response.json();
}

export async function getOracleConsensus(marketId: number): Promise<OracleResponse | null> {
  const response = await fetch(`/api/oracle/consensus?marketId=${marketId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function verifyOracleResult(marketId: number): Promise<boolean> {
  const response = await fetch(`/api/oracle/verify?marketId=${marketId}`);

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verified;
}


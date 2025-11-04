/**
 * IPFS service for uploading and fetching metadata
 */

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export interface IPFSMetadata {
  question?: string;
  description?: string;
  image?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export async function uploadToIPFS(metadata: IPFSMetadata): Promise<string> {
  try {
    // In production, use Pinata or another IPFS service
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

export async function fetchFromIPFS(hash: string): Promise<IPFSMetadata | null> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${hash}`);
    
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
}

export function getIPFSURL(hash: string): string {
  return `${IPFS_GATEWAY}${hash}`;
}


import { NextRequest } from 'next/server';
import { supabase } from '@/lib/config/supabase';

/**
 * Get authenticated user from request
 * Supports:
 * 1. Authorization header with Bearer token (Supabase JWT)
 * 2. x-wallet-address header (for wallet-based auth)
 * 3. userId in request body (fallback)
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{
  userId: string | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
}> {
  try {
    // Method 1: Check Authorization header (Supabase JWT)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        // Get user from database
        const { data: dbUser } = await supabase
          .from('users')
          .select('id, wallet_address')
          .eq('id', user.id)
          .single();
        
        if (dbUser) {
          return {
            userId: dbUser.id,
            walletAddress: dbUser.wallet_address,
            isAuthenticated: true,
          };
        }
      }
    }
    
    // Method 2: Check x-wallet-address header
    const walletAddress = request.headers.get('x-wallet-address');
    if (walletAddress) {
      const { data: user } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (user) {
        return {
          userId: user.id,
          walletAddress: user.wallet_address,
          isAuthenticated: true,
        };
      }
    }
    
    // Method 3: Try to get from request body (for POST requests)
    try {
      const body = await request.json();
      if (body.userId) {
        const { data: user } = await supabase
          .from('users')
          .select('id, wallet_address')
          .eq('id', body.userId)
          .single();
        
        if (user) {
          return {
            userId: user.id,
            walletAddress: user.wallet_address,
            isAuthenticated: true,
          };
        }
      }
    } catch {
      // Body parsing failed, continue
    }
    
    return {
      userId: null,
      walletAddress: null,
      isAuthenticated: false,
    };
  } catch (error) {
    console.error('[Auth] Error getting authenticated user:', error);
    return {
      userId: null,
      walletAddress: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<{
  userId: string;
  walletAddress: string | null;
}> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth.isAuthenticated || !auth.userId) {
    throw new Error('Authentication required');
  }
  
  return {
    userId: auth.userId,
    walletAddress: auth.walletAddress,
  };
}


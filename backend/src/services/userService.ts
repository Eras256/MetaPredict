import { supabase } from '../lib/supabase';

export interface UserData {
  walletAddress: string;
  embeddedWallet?: boolean;
  reputation?: number;
  totalStaked?: number;
  totalWon?: number;
  totalLost?: number;
  freeBetsUsed?: number;
  isPremium?: boolean;
  premiumExpiresAt?: Date;
}

export const userService = {
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return data;
  },

  async getUserByWalletAddress(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Error fetching user by wallet:', error);
      throw error;
    }
    
    return data;
  },

  async createUser(userId: string, userData: UserData) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        wallet_address: userData.walletAddress.toLowerCase(),
        embedded_wallet: userData.embeddedWallet || false,
        reputation: userData.reputation || 0,
        total_staked: userData.totalStaked || 0,
        total_won: userData.totalWon || 0,
        total_lost: userData.totalLost || 0,
        free_bets_used: userData.freeBetsUsed || 0,
        is_premium: userData.isPremium || false,
        premium_expires_at: userData.premiumExpiresAt?.toISOString() || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return data;
  },

  async updateUser(userId: string, updates: Partial<UserData>) {
    const updateData: any = {};
    
    if (updates.walletAddress !== undefined) updateData.wallet_address = updates.walletAddress.toLowerCase();
    if (updates.embeddedWallet !== undefined) updateData.embedded_wallet = updates.embeddedWallet;
    if (updates.reputation !== undefined) updateData.reputation = updates.reputation;
    if (updates.totalStaked !== undefined) updateData.total_staked = updates.totalStaked;
    if (updates.totalWon !== undefined) updateData.total_won = updates.totalWon;
    if (updates.totalLost !== undefined) updateData.total_lost = updates.totalLost;
    if (updates.freeBetsUsed !== undefined) updateData.free_bets_used = updates.freeBetsUsed;
    if (updates.isPremium !== undefined) updateData.is_premium = updates.isPremium;
    if (updates.premiumExpiresAt !== undefined) updateData.premium_expires_at = updates.premiumExpiresAt?.toISOString() || null;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data;
  },

  async upsertUserByWallet(walletAddress: string, userData: Partial<UserData>) {
    // Buscar usuario existente
    const existing = await this.getUserByWalletAddress(walletAddress);
    
    if (existing) {
      return await this.updateUser(existing.id, userData);
    } else {
      // Si no existe, necesitamos crear un UUID para el usuario
      // En producción, esto debería venir de Supabase Auth
      const { v4: uuidv4 } = await import('uuid');
      const userId = uuidv4();
      return await this.createUser(userId, {
        walletAddress,
        ...userData
      } as UserData);
    }
  }
};


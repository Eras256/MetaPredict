/**
 * Servicio para sincronizar datos on-chain con Supabase
 */

import { supabase } from '@/lib/config/supabase';
import { useActiveAccount } from 'thirdweb/react';

export interface MarketData {
  marketIdOnChain: number;
  question: string;
  description?: string;
  marketType: 'binary' | 'conditional' | 'subjective';
  resolutionTime: Date;
  createdBy?: string;
  metadata?: string;
  streamId?: string;
  targetPrice?: number;
  parentMarketId?: number;
}

export interface BetData {
  marketId: number;
  userId: string;
  amount: number;
  outcome: boolean;
  shares: number;
  transactionHash: string;
}

export const supabaseSync = {
  /**
   * Sincronizar mercado creado en blockchain con Supabase
   */
  async syncMarket(marketData: MarketData) {
    try {
      const { data, error } = await supabase
        .from('markets')
        .upsert({
          market_id_on_chain: marketData.marketIdOnChain,
          question: marketData.question,
          description: marketData.description,
          market_type: marketData.marketType,
          resolution_time: marketData.resolutionTime.toISOString(),
          created_by: marketData.createdBy || null,
          metadata: marketData.metadata,
          stream_id: marketData.streamId,
          target_price: marketData.targetPrice,
          parent_market_id: marketData.parentMarketId,
          status: 'active'
        }, {
          onConflict: 'market_id_on_chain'
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing market to Supabase:', error);
        throw error;
      }

      console.log('✅ Market synced to Supabase:', data);
      return data;
    } catch (error) {
      console.error('Failed to sync market:', error);
      // No lanzar error para no interrumpir el flujo on-chain
      return null;
    }
  },

  /**
   * Sincronizar apuesta realizada en blockchain con Supabase
   */
  async syncBet(betData: BetData) {
    try {
      const { data, error } = await supabase
        .from('bets')
        .insert({
          market_id: betData.marketId,
          user_id: betData.userId,
          amount: betData.amount.toString(),
          outcome: betData.outcome,
          shares: betData.shares.toString(),
          transaction_hash: betData.transactionHash
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing bet to Supabase:', error);
        throw error;
      }

      console.log('✅ Bet synced to Supabase:', data);
      return data;
    } catch (error) {
      console.error('Failed to sync bet:', error);
      return null;
    }
  },

  /**
   * Obtener o crear usuario por wallet address
   */
  async getOrCreateUser(walletAddress: string) {
    try {
      // Buscar usuario existente
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (existingUser && !fetchError) {
        return existingUser;
      }

      // Si no existe, crear uno nuevo
      // Nota: En producción, esto debería venir de Supabase Auth
      // Por ahora, generamos un UUID temporal
      const userId = crypto.randomUUID();

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          wallet_address: walletAddress.toLowerCase(),
          embedded_wallet: false,
          reputation: 0,
          total_staked: 0,
          total_won: 0,
          total_lost: 0,
          free_bets_used: 0,
          is_premium: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      console.log('✅ User created in Supabase:', newUser);
      return newUser;
    } catch (error) {
      console.error('Failed to get or create user:', error);
      // Retornar null para no interrumpir el flujo
      return null;
    }
  },

  /**
   * Obtener mercados desde Supabase
   */
  async getMarkets(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching markets from Supabase:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      return [];
    }
  },

  /**
   * Obtener mercado por ID on-chain
   */
  async getMarketByChainId(marketIdOnChain: number) {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('market_id_on_chain', marketIdOnChain)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch market:', error);
      return null;
    }
  },

  /**
   * Obtener apuestas de un usuario
   */
  async getUserBets(userId: string, marketId?: number) {
    try {
      let query = supabase
        .from('bets')
        .select(`
          *,
          markets:market_id (
            id,
            question,
            status,
            outcome
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (marketId) {
        query = query.eq('market_id', marketId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user bets:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user bets:', error);
      return [];
    }
  },

  /**
   * Actualizar estado de mercado
   */
  async updateMarketStatus(marketIdOnChain: number, status: 'pending' | 'active' | 'resolving' | 'resolved' | 'disputed' | 'expired') {
    try {
      const { data, error } = await supabase
        .from('markets')
        .update({ status })
        .eq('market_id_on_chain', marketIdOnChain)
        .select()
        .single();

      if (error) {
        console.error('Error updating market status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update market status:', error);
      return null;
    }
  },

  /**
   * Sincronizar resolución de mercado
   */
  async syncResolution(
    marketId: number,
    outcome: 'yes' | 'no' | 'invalid',
    confidence?: number,
    consensusCount?: number,
    totalModels?: number,
    oracleVotes?: any[],
    resolvedBy?: string,
    transactionHash?: string
  ) {
    try {
      // Actualizar mercado
      await this.updateMarketStatus(marketId, 'resolved');

      // Crear registro de resolución
      const { data, error } = await supabase
        .from('resolutions')
        .upsert({
          market_id: marketId,
          outcome,
          confidence,
          consensus_count: consensusCount,
          total_models: totalModels,
          oracle_votes: oracleVotes,
          resolved_by: resolvedBy || null,
          transaction_hash: transactionHash
        }, {
          onConflict: 'market_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing resolution:', error);
        throw error;
      }

      console.log('✅ Resolution synced to Supabase:', data);
      return data;
    } catch (error) {
      console.error('Failed to sync resolution:', error);
      return null;
    }
  }
};


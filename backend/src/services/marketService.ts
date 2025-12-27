import { supabase } from '../lib/supabase';

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
  transactionHash?: string;
}

export interface ResolutionData {
  marketId: number;
  outcome: 'yes' | 'no' | 'invalid';
  confidence?: number;
  consensusCount?: number;
  totalModels?: number;
  oracleVotes?: any[];
  resolvedBy?: string;
  transactionHash?: string;
}

export const marketService = {
  async getAllMarkets() {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
    
    return data || [];
  },

  async getMarketById(id: string | number) {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching market:', error);
      return null;
    }
    
    return data;
  },

  async getMarketByChainId(marketIdOnChain: number) {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('market_id_on_chain', marketIdOnChain)
      .single();
    
    if (error) {
      console.error('Error fetching market by chain ID:', error);
      return null;
    }
    
    return data;
  },

  async createMarket(marketData: MarketData) {
    const { data, error } = await supabase
      .from('markets')
      .insert({
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
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating market:', error);
      throw error;
    }
    
    return data;
  },

  async placeBet(betData: BetData) {
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
      console.error('Error placing bet:', error);
      throw error;
    }
    
    return data;
  },

  async getUserBets(userId: string, marketId?: number) {
    let query = supabase
      .from('bets')
      .select('*')
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
  },

  async resolveMarket(marketId: number, resolutionData: ResolutionData) {
    // Actualizar mercado
    const { error: marketError } = await supabase
      .from('markets')
      .update({
        status: 'resolved',
        outcome: resolutionData.outcome,
        updated_at: new Date().toISOString()
      })
      .eq('id', marketId);
    
    if (marketError) {
      console.error('Error updating market:', marketError);
      throw marketError;
    }

    // Crear registro de resolución
    const { data, error } = await supabase
      .from('resolutions')
      .insert({
        market_id: marketId,
        outcome: resolutionData.outcome,
        confidence: resolutionData.confidence,
        consensus_count: resolutionData.consensusCount,
        total_models: resolutionData.totalModels,
        oracle_votes: resolutionData.oracleVotes,
        resolved_by: resolutionData.resolvedBy || null,
        transaction_hash: resolutionData.transactionHash
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating resolution:', error);
      throw error;
    }
    
    return data;
  },

  async updateMarketStatus(marketId: number, status: 'pending' | 'active' | 'resolving' | 'resolved' | 'disputed' | 'expired') {
    const { data, error } = await supabase
      .from('markets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', marketId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating market status:', error);
      throw error;
    }
    
    return data;
  },

  async getMarketResolution(marketId: number) {
    const { data, error } = await supabase
      .from('resolutions')
      .select('*')
      .eq('market_id', marketId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No resolution found
        return null;
      }
      console.error('Error fetching resolution:', error);
      throw error;
    }
    
    return data;
  }
};


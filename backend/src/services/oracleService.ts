import { ethers } from "ethers";
import { supabase } from '../lib/supabase';
import { marketService } from './marketService';

const TRUTH_CHAIN_ADDRESS = process.env.TRUTH_CHAIN_ADDRESS || "";

export const oracleService = {
  async requestResolution(marketId: number) {
    // Actualizar estado del mercado a "resolving"
    await marketService.updateMarketStatus(marketId, 'resolving');
    
    // TODO: Llamar contrato TruthChain/AIOracle.requestResolution via Chainlink Functions
    // Por ahora retornamos el estado actualizado
    
    return {
      requestId: `resolution-${marketId}-${Date.now()}`,
      marketId,
      status: "pending",
    };
  },

  async getOracleStatus() {
    // Obtener estadísticas desde la base de datos
    const { data: markets, error } = await supabase
      .from('markets')
      .select('status');
    
    if (error) {
      console.error('Error fetching oracle status:', error);
      throw error;
    }
    
    const activeMarkets = markets?.filter(m => m.status === 'active').length || 0;
    const pendingResolutions = markets?.filter(m => m.status === 'resolving').length || 0;
    const totalResolved = markets?.filter(m => m.status === 'resolved').length || 0;
    
    // TODO: Obtener insurance pool balance desde contrato
    const insurancePoolBalance = 0;
    
    return {
      activeMarkets,
      pendingResolutions,
      totalResolved,
      insurancePoolBalance,
    };
  },

  async fileDispute(marketId: number, userId: string, reason: string) {
    // Crear disputa en la base de datos
    const { data, error } = await supabase
      .from('disputes')
      .insert({
        market_id: marketId,
        challenger_id: userId,
        reason,
        status: 'open'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
    
    // Actualizar estado del mercado a "disputed"
    await marketService.updateMarketStatus(marketId, 'disputed');
    
    // TODO: Llamar contrato TruthChain.fileDispute
    
    return {
      disputeId: data.id.toString(),
      marketId,
      challenger: userId,
      reason,
      timestamp: new Date(data.created_at),
    };
  },

  async getDisputes(marketId?: number) {
    let query = supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (marketId) {
      query = query.eq('market_id', marketId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching disputes:', error);
      throw error;
    }
    
    return data || [];
  },

  async voteOnDispute(disputeId: number, userId: string, vote: boolean, weight: number) {
    const { data, error } = await supabase
      .from('dispute_votes')
      .upsert({
        dispute_id: disputeId,
        user_id: userId,
        vote,
        weight: weight.toString()
      }, {
        onConflict: 'dispute_id,user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error voting on dispute:', error);
      throw error;
    }
    
    // Actualizar contadores de votos en la disputa
    const { data: votes } = await supabase
      .from('dispute_votes')
      .select('vote, weight')
      .eq('dispute_id', disputeId);
    
    const votesYes = votes?.filter(v => v.vote === true)
      .reduce((sum, v) => sum + parseFloat(v.weight.toString()), 0) || 0;
    const votesNo = votes?.filter(v => v.vote === false)
      .reduce((sum, v) => sum + parseFloat(v.weight.toString()), 0) || 0;
    
    await supabase
      .from('disputes')
      .update({
        votes_yes: Math.round(votesYes),
        votes_no: Math.round(votesNo)
      })
      .eq('id', disputeId);
    
    return data;
  }
};


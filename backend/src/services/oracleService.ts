import { ethers } from "ethers";
import { supabase } from '../lib/supabase';
import { marketService } from './marketService';
import { getContract, getContractWithSigner, CONTRACT_ADDRESSES, INSURANCE_POOL_ABI, AI_ORACLE_ABI, PREDICTION_MARKET_CORE_ABI } from '../lib/contracts';
import { logger } from '../utils/logger';

const TRUTH_CHAIN_ADDRESS = process.env.TRUTH_CHAIN_ADDRESS || "";

export const oracleService = {
  async requestResolution(marketId: number) {
    // Actualizar estado del mercado a "resolving"
    await marketService.updateMarketStatus(marketId, 'resolving');
    
    try {
      // Obtener información del mercado desde Supabase
      const { data: market } = await supabase
        .from('markets')
        .select('question, market_id_on_chain')
        .eq('id', marketId)
        .single();
      
      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }
      
      // Intentar llamar al contrato directamente si tenemos PRIVATE_KEY configurado
      try {
        const coreContract = getContractWithSigner(CONTRACT_ADDRESSES.CORE_CONTRACT, PREDICTION_MARKET_CORE_ABI);
        const tx = await coreContract.initiateResolution(market.market_id_on_chain);
        logger.info(`[OracleService] Initiated resolution on-chain: ${tx.hash}`);
        
        // Esperar confirmación
        const receipt = await tx.wait();
        logger.info(`[OracleService] Resolution initiated confirmed in block ${receipt.blockNumber}`);
        
        return {
          requestId: receipt.transactionHash,
          marketId,
          chainMarketId: market.market_id_on_chain,
          status: "pending",
          txHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        };
      } catch (contractError: any) {
        // Si falla la llamada al contrato (por ejemplo, no hay PRIVATE_KEY), continuar con modo offline
        logger.warn(`[OracleService] Could not call contract directly: ${contractError.message}`);
        logger.info(`[OracleService] Resolution requested for market ${marketId} (chain ID: ${market.market_id_on_chain})`);
        
        return {
          requestId: `resolution-${marketId}-${Date.now()}`,
          marketId,
          chainMarketId: market.market_id_on_chain,
          status: "pending",
          note: "Resolution will be initiated when PredictionMarketCore.initiateResolution is called"
        };
      }
    } catch (error: any) {
      logger.error(`[OracleService] Error requesting resolution: ${error.message}`);
      throw error;
    }
  },

  /**
   * Fulfill resolution manually by calling AIOracle.fulfillResolutionManual
   * This is called after getting consensus from LLMs
   */
  async fulfillResolutionManual(marketId: number, outcome: number, confidence: number) {
    try {
      // Obtener market_id_on_chain desde Supabase
      const { data: market } = await supabase
        .from('markets')
        .select('market_id_on_chain')
        .eq('id', marketId)
        .single();
      
      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }

      // Llamar al contrato AIOracle directamente
      const aiOracle = getContractWithSigner(CONTRACT_ADDRESSES.AI_ORACLE, AI_ORACLE_ABI);
      
      // outcome: 1=Yes, 2=No, 3=Invalid
      const tx = await aiOracle.fulfillResolutionManual(
        market.market_id_on_chain,
        outcome,
        confidence
      );
      
      logger.info(`[OracleService] Fulfilling resolution on-chain: ${tx.hash}`);
      
      // Esperar confirmación
      const receipt = await tx.wait();
      logger.info(`[OracleService] Resolution fulfilled confirmed in block ${receipt.blockNumber}`);
      
      // Actualizar estado del mercado en Supabase
      const outcomeMap: Record<number, 'yes' | 'no' | 'invalid'> = {
        1: 'yes',
        2: 'no',
        3: 'invalid'
      };
      
      await marketService.updateMarketStatus(marketId, 'resolved');
      await marketService.updateMarketOutcome(marketId, outcomeMap[outcome] || 'invalid');
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        outcome,
        confidence
      };
    } catch (error: any) {
      logger.error(`[OracleService] Error fulfilling resolution: ${error.message}`);
      throw error;
    }
  },

  async getOracleStatus() {
    // Obtener estadísticas desde la base de datos
    const { data: markets, error } = await supabase
      .from('markets')
      .select('status');
    
    if (error) {
      logger.error('[OracleService] Error fetching oracle status:', error);
      throw error;
    }
    
    const activeMarkets = markets?.filter(m => m.status === 'active').length || 0;
    const pendingResolutions = markets?.filter(m => m.status === 'resolving').length || 0;
    const totalResolved = markets?.filter(m => m.status === 'resolved').length || 0;
    
    // Obtener insurance pool balance desde contrato
    let insurancePoolBalance = 0;
    try {
      const insurancePool = getContract(CONTRACT_ADDRESSES.INSURANCE_POOL, INSURANCE_POOL_ABI);
      const totalAssets = await insurancePool.totalAssets();
      insurancePoolBalance = Number(ethers.formatEther(totalAssets));
      
      logger.info(`[OracleService] Insurance pool balance: ${insurancePoolBalance} BNB`);
    } catch (error: any) {
      logger.warn(`[OracleService] Could not fetch insurance pool balance: ${error.message}`);
      // Continuar con balance = 0 si falla
    }
    
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
      logger.error('[OracleService] Error creating dispute:', error);
      throw error;
    }
    
    // Actualizar estado del mercado a "disputed"
    await marketService.updateMarketStatus(marketId, 'disputed');
    
    // Nota: TruthChain.fileDispute existe pero no está desplegado como contrato principal
    // El sistema de disputas funciona principalmente a través de la base de datos
    // Si TruthChain está desplegado, se puede llamar aquí
    // Por ahora, solo registramos en la BD
    
    logger.info(`[OracleService] Dispute filed for market ${marketId} by user ${userId}`);
    
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


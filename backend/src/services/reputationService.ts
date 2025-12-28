import { ethers } from "ethers";
import { supabase } from '../lib/supabase';
import { getContract, CONTRACT_ADDRESSES, REPUTATION_STAKING_ABI } from '../lib/contracts';
import { logger } from '../utils/logger';
import { userService } from './userService';

export const reputationService = {
  async getReputation(userId: string) {
    // Obtener datos de Supabase
    const { data, error } = await supabase
      .from('reputation_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    // Obtener wallet address del usuario
    const user = await userService.getUserById(userId);
    const walletAddress = user?.wallet_address;
    
    // Obtener datos del contrato ReputationStaking si tenemos wallet address
    let contractStakeAmount = 0;
    let contractReputationScore = 0;
    let contractTier = 0;
    let contractCorrectVotes = 0;
    let contractTotalVotes = 0;
    let contractSlashedAmount = 0;
    let contractHasNFT = false;
    
    if (walletAddress) {
      try {
        const reputationStaking = getContract(CONTRACT_ADDRESSES.REPUTATION_STAKING, REPUTATION_STAKING_ABI);
        const stakerData = await reputationStaking.getStaker(walletAddress);
        
        contractStakeAmount = Number(ethers.formatEther(stakerData.stakedAmount));
        contractReputationScore = Number(stakerData.reputationScore);
        contractTier = Number(stakerData.tier);
        contractCorrectVotes = Number(stakerData.correctVotes);
        contractTotalVotes = Number(stakerData.totalVotes);
        contractSlashedAmount = Number(ethers.formatEther(stakerData.slashedAmount));
        contractHasNFT = stakerData.hasNFT;
        
        logger.info(`[ReputationService] Contract data for ${walletAddress}: stake=${contractStakeAmount}, score=${contractReputationScore}`);
      } catch (error: any) {
        logger.warn(`[ReputationService] Could not fetch contract data: ${error.message}`);
        // Continuar con datos de BD si falla
      }
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No reputation record found, return default (prioritize contract data if available)
        return {
          userId,
          stakeAmount: contractStakeAmount || 0,
          accuracy: contractReputationScore || 50,
          disputesWon: contractCorrectVotes || 0,
          slashesIncurred: contractSlashedAmount > 0 ? 1 : 0,
          isMember: contractStakeAmount > 0,
          tier: contractTier,
          totalVotes: contractTotalVotes,
          hasNFT: contractHasNFT,
        };
      }
      logger.error('[ReputationService] Error fetching reputation:', error);
      throw error;
    }
    
    // Combinar datos de BD y contrato (contrato tiene prioridad para stake y score)
    return {
      userId: data.user_id,
      stakeAmount: contractStakeAmount || parseFloat(data.stake_amount.toString()),
      accuracy: contractReputationScore || (data.accuracy ? parseFloat(data.accuracy.toString()) : 50),
      disputesWon: contractCorrectVotes || data.disputes_won,
      slashesIncurred: contractSlashedAmount > 0 ? Math.ceil(contractSlashedAmount / 0.1) : data.slashes_incurred,
      isMember: contractStakeAmount > 0 || data.is_member,
      tier: contractTier,
      totalVotes: contractTotalVotes,
      hasNFT: contractHasNFT,
    };
  },

  async joinDAO(userId: string, stakeAmount: number) {
    // Obtener wallet address del usuario
    const user = await userService.getUserById(userId);
    const walletAddress = user?.wallet_address;
    
    if (!walletAddress) {
      throw new Error(`User ${userId} has no wallet address`);
    }

    // Insertar o actualizar registro de reputación
    const { data, error } = await supabase
      .from('reputation_history')
      .upsert({
        user_id: userId,
        stake_amount: stakeAmount.toString(),
        is_member: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      logger.error('[ReputationService] Error joining DAO:', error);
      throw error;
    }
    
    // Sincronizar con el contrato después de que el usuario haga stake desde el frontend
    // El frontend llama a PredictionMarketCore.stake() que internamente llama a ReputationStaking.stake()
    // Aquí solo registramos en la BD y sincronizamos después
    
    logger.info(`[ReputationService] User ${userId} joined DAO with stake ${stakeAmount}`);
    
    // Intentar sincronizar con el contrato después de un breve delay
    // (en producción, esto se haría mediante eventos del contrato)
    setTimeout(async () => {
      try {
        await this.syncReputationFromContract(userId);
      } catch (err: any) {
        logger.warn(`[ReputationService] Could not sync reputation after join: ${err.message}`);
      }
    }, 5000);
    
    return {
      success: true,
      userId,
      stakeAmount,
      walletAddress,
      data,
      note: "Stake transaction must be initiated from frontend via PredictionMarketCore"
    };
  },

  /**
   * Sincroniza la reputación desde el contrato a la base de datos
   */
  async syncReputationFromContract(userId: string) {
    const user = await userService.getUserById(userId);
    const walletAddress = user?.wallet_address;
    
    if (!walletAddress) {
      return;
    }

    try {
      const reputationStaking = getContract(CONTRACT_ADDRESSES.REPUTATION_STAKING, REPUTATION_STAKING_ABI);
      const stakerData = await reputationStaking.getStaker(walletAddress);
      
      const contractStakeAmount = Number(ethers.formatEther(stakerData.stakedAmount));
      const contractReputationScore = Number(stakerData.reputationScore);
      const contractTier = Number(stakerData.tier);
      const contractCorrectVotes = Number(stakerData.correctVotes);
      const contractTotalVotes = Number(stakerData.totalVotes);
      const contractSlashedAmount = Number(ethers.formatEther(stakerData.slashedAmount));
      const contractHasNFT = stakerData.hasNFT;
      
      // Actualizar base de datos con datos del contrato
      await supabase
        .from('reputation_history')
        .upsert({
          user_id: userId,
          stake_amount: contractStakeAmount.toString(),
          accuracy: contractReputationScore.toString(),
          disputes_won: contractCorrectVotes,
          slashes_incurred: contractSlashedAmount > 0 ? Math.ceil(contractSlashedAmount / 0.1) : 0,
          is_member: contractStakeAmount > 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      logger.info(`[ReputationService] Synced reputation for ${userId} from contract`);
      
      return {
        stakeAmount: contractStakeAmount,
        accuracy: contractReputationScore,
        tier: contractTier,
        correctVotes: contractCorrectVotes,
        totalVotes: contractTotalVotes,
        slashedAmount: contractSlashedAmount,
        hasNFT: contractHasNFT
      };
    } catch (error: any) {
      logger.warn(`[ReputationService] Could not sync reputation from contract: ${error.message}`);
      throw error;
    }
  },

  async updateReputation(
    userId: string,
    wasCorrect: boolean,
    marketSize: number,
    confidence: number
  ) {
    // Obtener reputación actual (incluye datos del contrato)
    const current = await this.getReputation(userId);
    
    // Sincronizar primero con el contrato para obtener datos más recientes
    try {
      await this.syncReputationFromContract(userId);
      // Re-obtener después de sincronizar
      const synced = await this.getReputation(userId);
      
      // Usar datos del contrato si están disponibles
      const contractAccuracy = synced.accuracy !== current.accuracy ? synced.accuracy : current.accuracy;
      const contractDisputesWon = synced.disputesWon !== current.disputesWon ? synced.disputesWon : current.disputesWon;
      const contractSlashesIncurred = synced.slashesIncurred !== current.slashesIncurred ? synced.slashesIncurred : current.slashesIncurred;
      
      // Calcular nueva accuracy basada en el resultado
      const newAccuracy = wasCorrect 
        ? Math.min(100, contractAccuracy + (confidence / 10))
        : Math.max(0, contractAccuracy - (confidence / 10));
      
      // Actualizar registro en BD
      const { data, error } = await supabase
        .from('reputation_history')
        .upsert({
          user_id: userId,
          stake_amount: synced.stakeAmount.toString(),
          accuracy: newAccuracy,
          disputes_won: wasCorrect ? contractDisputesWon + 1 : contractDisputesWon,
          slashes_incurred: wasCorrect ? contractSlashesIncurred : contractSlashesIncurred + 1,
          is_member: synced.isMember,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (error) {
        logger.error('[ReputationService] Error updating reputation:', error);
        throw error;
      }
      
      logger.info(`[ReputationService] Reputation updated for ${userId}: accuracy=${newAccuracy}, wasCorrect=${wasCorrect}`);
      
      return {
        userId,
        accuracy: newAccuracy,
        data
      };
    } catch (syncError: any) {
      // Si falla la sincronización, usar datos locales
      logger.warn(`[ReputationService] Could not sync from contract, using local data: ${syncError.message}`);
      
      const newAccuracy = wasCorrect 
        ? Math.min(100, current.accuracy + (confidence / 10))
        : Math.max(0, current.accuracy - (confidence / 10));
      
      const { data, error } = await supabase
        .from('reputation_history')
        .upsert({
          user_id: userId,
          stake_amount: current.stakeAmount.toString(),
          accuracy: newAccuracy,
          disputes_won: wasCorrect ? (current.disputesWon || 0) + 1 : (current.disputesWon || 0),
          slashes_incurred: wasCorrect ? (current.slashesIncurred || 0) : (current.slashesIncurred || 0) + 1,
          is_member: current.isMember,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (error) {
        logger.error('[ReputationService] Error updating reputation:', error);
        throw error;
      }
      
      return {
        userId,
        accuracy: newAccuracy,
        data
      };
    }
  },

  async getLeaderboard(limit: number = 100) {
    const { data, error } = await supabase
      .from('reputation_history')
      .select(`
        *,
        users:user_id (
          id,
          wallet_address,
          reputation
        )
      `)
      .order('stake_amount', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
    
    return data || [];
  },

  async addDisputeWin(userId: string) {
    const current = await this.getReputation(userId);
    
    const { data, error } = await supabase
      .from('reputation_history')
      .upsert({
        user_id: userId,
        stake_amount: current.stakeAmount.toString(),
        accuracy: current.accuracy,
        disputes_won: current.disputesWon + 1,
        slashes_incurred: current.slashesIncurred,
        is_member: current.isMember,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding dispute win:', error);
      throw error;
    }
    
    return data;
  },

  async addSlash(userId: string) {
    const current = await this.getReputation(userId);
    
    const { data, error } = await supabase
      .from('reputation_history')
      .upsert({
        user_id: userId,
        stake_amount: current.stakeAmount.toString(),
        accuracy: Math.max(0, current.accuracy - 5), // Reducir accuracy
        disputes_won: current.disputesWon,
        slashes_incurred: current.slashesIncurred + 1,
        is_member: current.isMember,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding slash:', error);
      throw error;
    }
    
    return data;
  }
};


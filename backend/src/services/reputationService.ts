import { supabase } from '../lib/supabase';

export const reputationService = {
  async getReputation(userId: string) {
    const { data, error } = await supabase
      .from('reputation_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No reputation record found, return default
        return {
          userId,
          stakeAmount: 0,
          accuracy: 50,
          disputesWon: 0,
          slashesIncurred: 0,
          isMember: false,
        };
      }
      console.error('Error fetching reputation:', error);
      throw error;
    }
    
    return {
      userId: data.user_id,
      stakeAmount: parseFloat(data.stake_amount.toString()),
      accuracy: data.accuracy ? parseFloat(data.accuracy.toString()) : 50,
      disputesWon: data.disputes_won,
      slashesIncurred: data.slashes_incurred,
      isMember: data.is_member,
    };
  },

  async joinDAO(userId: string, stakeAmount: number) {
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
      console.error('Error joining DAO:', error);
      throw error;
    }
    
    // TODO: Llamar contrato ReputationDAO.joinDAO aquí
    
    return {
      success: true,
      userId,
      stakeAmount,
      data
    };
  },

  async updateReputation(
    userId: string,
    wasCorrect: boolean,
    marketSize: number,
    confidence: number
  ) {
    // Obtener reputación actual
    const current = await this.getReputation(userId);
    
    // Calcular nueva accuracy (simplificado)
    const newAccuracy = wasCorrect 
      ? Math.min(100, current.accuracy + (confidence / 10))
      : Math.max(0, current.accuracy - (confidence / 10));
    
    // Actualizar registro
    const { data, error } = await supabase
      .from('reputation_history')
      .upsert({
        user_id: userId,
        stake_amount: current.stakeAmount.toString(),
        accuracy: newAccuracy,
        disputes_won: current.disputesWon,
        slashes_incurred: current.slashesIncurred,
        is_member: current.isMember,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating reputation:', error);
      throw error;
    }
    
    // TODO: Llamar contrato ReputationDAO.updateReputation aquí
    
    return {
      userId,
      accuracy: newAccuracy,
      data
    };
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


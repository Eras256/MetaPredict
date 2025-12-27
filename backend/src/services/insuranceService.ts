import { supabase } from '../lib/supabase';

export interface InsuranceClaimData {
  marketId: number;
  userId: string;
  amount: number;
  reason?: string;
  transactionHash?: string;
}

export const insuranceService = {
  async createClaim(claimData: InsuranceClaimData) {
    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        market_id: claimData.marketId,
        user_id: claimData.userId,
        amount: claimData.amount.toString(),
        reason: claimData.reason,
        status: 'pending',
        transaction_hash: claimData.transactionHash
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating insurance claim:', error);
      throw error;
    }
    
    return data;
  },

  async getUserClaims(userId: string) {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        markets:market_id (
          id,
          question,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user claims:', error);
      throw error;
    }
    
    return data || [];
  },

  async getClaimById(claimId: number) {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        markets:market_id (
          id,
          question,
          status
        )
      `)
      .eq('id', claimId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching claim:', error);
      throw error;
    }
    
    return data;
  },

  async updateClaimStatus(
    claimId: number,
    status: 'pending' | 'approved' | 'rejected' | 'paid',
    transactionHash?: string
  ) {
    const updateData: any = {
      status,
      resolved_at: status !== 'pending' ? new Date().toISOString() : null
    };
    
    if (transactionHash) {
      updateData.transaction_hash = transactionHash;
    }
    
    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updateData)
      .eq('id', claimId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
    
    return data;
  },

  async getPendingClaims() {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        markets:market_id (
          id,
          question
        ),
        users:user_id (
          id,
          wallet_address
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching pending claims:', error);
      throw error;
    }
    
    return data || [];
  },

  async getClaimsStats() {
    const { data: claims, error } = await supabase
      .from('insurance_claims')
      .select('status, amount');
    
    if (error) {
      console.error('Error fetching claims stats:', error);
      throw error;
    }
    
    const total = claims?.length || 0;
    const pending = claims?.filter(c => c.status === 'pending').length || 0;
    const approved = claims?.filter(c => c.status === 'approved').length || 0;
    const paid = claims?.filter(c => c.status === 'paid').length || 0;
    const rejected = claims?.filter(c => c.status === 'rejected').length || 0;
    
    const totalAmount = claims?.reduce((sum, c) => 
      sum + parseFloat(c.amount.toString()), 0) || 0;
    const paidAmount = claims?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;
    
    return {
      total,
      pending,
      approved,
      paid,
      rejected,
      totalAmount,
      paidAmount
    };
  }
};


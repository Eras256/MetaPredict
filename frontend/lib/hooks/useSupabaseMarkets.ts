/**
 * Hook para obtener mercados desde Supabase
 * Complementa los datos on-chain con información de la base de datos
 */

"use client";

import { useState, useEffect } from "react";
import { supabaseSync } from "@/lib/services/supabaseSync";

export interface SupabaseMarket {
  id: number;
  market_id_on_chain: number;
  question: string;
  description?: string;
  market_type: 'binary' | 'conditional' | 'subjective';
  parent_market_id?: number;
  resolution_time: string;
  status: 'pending' | 'active' | 'resolving' | 'resolved' | 'disputed' | 'expired';
  outcome?: 'yes' | 'no' | 'invalid';
  metadata?: string;
  stream_id?: string;
  target_price?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseMarkets() {
  const [markets, setMarkets] = useState<SupabaseMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseSync.getMarkets(100);
      setMarkets(data as SupabaseMarket[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch markets from Supabase");
      console.error("Error fetching markets from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
  };
}

export function useSupabaseMarket(marketIdOnChain: number) {
  const [market, setMarket] = useState<SupabaseMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (marketIdOnChain) {
      fetchMarket();
    }
  }, [marketIdOnChain]);

  const fetchMarket = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseSync.getMarketByChainId(marketIdOnChain);
      setMarket(data as SupabaseMarket | null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch market from Supabase");
      console.error("Error fetching market from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    market,
    loading,
    error,
    refetch: fetchMarket,
  };
}

export function useSupabaseUserBets(userId?: string, marketId?: number) {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchBets();
    } else {
      setLoading(false);
    }
  }, [userId, marketId]);

  const fetchBets = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseSync.getUserBets(userId, marketId);
      setBets(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bets from Supabase");
      console.error("Error fetching bets from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    bets,
    loading,
    error,
    refetch: fetchBets,
  };
}


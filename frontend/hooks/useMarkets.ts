"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function useMarkets() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/markets`);
      setMarkets(response.data.markets);
      setError(null);
    } catch (err) {
      setError("Failed to fetch markets");
      console.error(err);
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


import express from "express";
import { z } from "zod";
import { marketService } from "../services/marketService";
import { validateWallet, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Get all markets
router.get("/", async (req, res) => {
  try {
    const markets = await marketService.getAllMarkets();
    res.json({ markets });
  } catch (error: any) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: "Failed to fetch markets", details: error.message });
  }
});

// Get market by ID (puede ser ID de BD o market_id_on_chain)
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let market;
    
    // Intentar como ID de BD primero
    if (!isNaN(Number(id))) {
      market = await marketService.getMarketById(Number(id));
    }
    
    // Si no se encuentra, intentar como market_id_on_chain
    if (!market && !isNaN(Number(id))) {
      market = await marketService.getMarketByChainId(Number(id));
    }
    
    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }
    res.json({ market });
  } catch (error: any) {
    console.error('Error fetching market:', error);
    res.status(500).json({ error: "Failed to fetch market", details: error.message });
  }
});

// Get user bets for a market
router.get("/:id/bets", optionalAuth, async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const bets = await marketService.getUserBets(userId, marketId);
    res.json({ bets });
  } catch (error: any) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: "Failed to fetch bets", details: error.message });
  }
});

// Get market resolution
router.get("/:id/resolution", async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const resolution = await marketService.getMarketResolution(marketId);
    
    if (!resolution) {
      return res.status(404).json({ error: "Resolution not found" });
    }
    
    res.json({ resolution });
  } catch (error: any) {
    console.error('Error fetching resolution:', error);
    res.status(500).json({ error: "Failed to fetch resolution", details: error.message });
  }
});

// Place bet (requiere autenticación)
router.post("/:id/bet", validateWallet, async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const { amount, outcome, shares, transactionHash } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }
    
    if (!amount || outcome === undefined || !shares) {
      return res.status(400).json({ error: "amount, outcome, and shares are required" });
    }
    
    const bet = await marketService.placeBet({
      marketId,
      userId,
      amount: parseFloat(amount),
      outcome: Boolean(outcome),
      shares: parseFloat(shares),
      transactionHash
    });
    
    res.status(201).json({ bet });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: "Failed to place bet", details: error.message });
  }
});

// Resolve market (requiere autenticación de admin/system)
router.post("/:id/resolve", optionalAuth, async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const { outcome, confidence, consensusCount, totalModels, oracleVotes, transactionHash } = req.body;
    const resolvedBy = req.user?.id;
    
    if (!outcome || !['yes', 'no', 'invalid'].includes(outcome)) {
      return res.status(400).json({ error: "Valid outcome (yes/no/invalid) is required" });
    }
    
    const resolution = await marketService.resolveMarket(marketId, {
      marketId,
      outcome,
      confidence,
      consensusCount,
      totalModels,
      oracleVotes,
      resolvedBy,
      transactionHash
    });
    
    res.json({ resolution });
  } catch (error: any) {
    console.error('Error resolving market:', error);
    res.status(500).json({ error: "Failed to resolve market", details: error.message });
  }
});

// Update market status
router.patch("/:id/status", optionalAuth, async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const { status } = req.body;
    
    if (!['pending', 'active', 'resolving', 'resolved', 'disputed', 'expired'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const market = await marketService.updateMarketStatus(marketId, status);
    res.json({ market });
  } catch (error: any) {
    console.error('Error updating market status:', error);
    res.status(500).json({ error: "Failed to update market status", details: error.message });
  }
});

export default router;


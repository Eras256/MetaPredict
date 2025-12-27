import express from "express";
import { aggregationService } from "../services/aggregationService";
import { optionalAuth, validateWallet } from "../middleware/auth";

const router = express.Router();

// Get price comparison
router.post("/compare", async (req, res) => {
  try {
    const { marketDescription } = req.body;
    
    if (!marketDescription) {
      return res.status(400).json({ error: "marketDescription is required" });
    }
    
    const comparison = await aggregationService.getPriceComparison(marketDescription);
    res.json({ comparison });
  } catch (error: any) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ error: "Failed to compare prices", details: error.message });
  }
});

// Execute best route (requiere autenticación)
router.post("/execute", validateWallet, async (req, res) => {
  try {
    const { marketDescription, betAmount, isYes } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }
    
    if (!marketDescription || !betAmount || isYes === undefined) {
      return res.status(400).json({ error: "marketDescription, betAmount, and isYes are required" });
    }
    
    const result = await aggregationService.executeBestRoute(
      userId,
      marketDescription,
      parseFloat(betAmount),
      Boolean(isYes)
    );
    res.json({ result });
  } catch (error: any) {
    console.error('Error executing route:', error);
    res.status(500).json({ error: "Failed to execute route", details: error.message });
  }
});

// Get user portfolio
router.get("/portfolio/:userId", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const portfolio = await aggregationService.getPortfolio(userId);
    res.json({ portfolio });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: "Failed to get portfolio", details: error.message });
  }
});

// Get portfolio value
router.get("/portfolio/:userId/value", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const value = await aggregationService.getPortfolioValue(userId);
    res.json({ value });
  } catch (error: any) {
    console.error('Error fetching portfolio value:', error);
    res.status(500).json({ error: "Failed to get portfolio value", details: error.message });
  }
});

export default router;


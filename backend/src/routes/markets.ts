import express from "express";
import { z } from "zod";
import { marketService } from "../services/marketService";

const router = express.Router();

const createMarketSchema = z.object({
  description: z.string().min(10).max(500),
  category: z.enum(["sports", "politics", "crypto", "entertainment", "climate"]),
  outcome: z.enum(["binary", "conditional", "subjective"]),
  deadline: z.string().datetime(),
  parentMarketId: z.string().uuid().optional(),
  parentOutcome: z.enum(["YES", "NO"]).optional(),
});

// Get all markets
router.get("/", async (req, res) => {
  try {
    const markets = await marketService.getAllMarkets();
    res.json({ markets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

// Get market by ID
router.get("/:id", async (req, res) => {
  try {
    const market = await marketService.getMarketById(req.params.id);
    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }
    res.json({ market });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch market" });
  }
});

// Create market
router.post("/", async (req, res) => {
  try {
    const data = createMarketSchema.parse(req.body);
    const market = await marketService.createMarket(data);
    res.status(201).json({ market });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create market" });
  }
});

// Place bet
router.post("/:id/bet", async (req, res) => {
  try {
    const { amount, outcome } = req.body;
    const { userId } = req.body; // From auth middleware
    const bet = await marketService.placeBet(req.params.id, userId, amount, outcome);
    res.json({ bet });
  } catch (error) {
    res.status(500).json({ error: "Failed to place bet" });
  }
});

// Resolve market
router.post("/:id/resolve", async (req, res) => {
  try {
    const { outcome } = req.body;
    const market = await marketService.resolveMarket(req.params.id, outcome);
    res.json({ market });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve market" });
  }
});

export default router;


import express from "express";
import { aggregationService } from "../services/aggregationService";

const router = express.Router();

// Get price comparison
router.post("/compare", async (req, res) => {
  try {
    const { marketDescription } = req.body;
    const comparison = await aggregationService.getPriceComparison(marketDescription);
    res.json({ comparison });
  } catch (error) {
    res.status(500).json({ error: "Failed to compare prices" });
  }
});

// Execute best route
router.post("/execute", async (req, res) => {
  try {
    const { marketDescription, betAmount, isYes } = req.body;
    const { userId } = req.body; // From auth middleware
    const result = await aggregationService.executeBestRoute(
      userId,
      marketDescription,
      betAmount,
      isYes
    );
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute route" });
  }
});

// Get user portfolio
router.get("/portfolio/:userId", async (req, res) => {
  try {
    const portfolio = await aggregationService.getPortfolio(req.params.userId);
    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ error: "Failed to get portfolio" });
  }
});

export default router;


import express from "express";
import { reputationService } from "../services/reputationService";
import { optionalAuth, validateWallet } from "../middleware/auth";

const router = express.Router();

// Get user reputation
router.get("/:userId", async (req, res) => {
  try {
    const reputation = await reputationService.getReputation(req.params.userId);
    res.json({ reputation });
  } catch (error: any) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ error: "Failed to get reputation", details: error.message });
  }
});

// Join DAO (requiere autenticación)
router.post("/join", validateWallet, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { stakeAmount } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (!stakeAmount || stakeAmount <= 0) {
      return res.status(400).json({ error: "Valid stake amount is required" });
    }
    
    const result = await reputationService.joinDAO(userId, parseFloat(stakeAmount));
    res.json({ result });
  } catch (error: any) {
    console.error('Error joining DAO:', error);
    res.status(500).json({ error: "Failed to join DAO", details: error.message });
  }
});

// Update reputation (sistema interno)
router.post("/update", optionalAuth, async (req, res) => {
  try {
    const { userId, wasCorrect, marketSize, confidence } = req.body;
    
    if (!userId || wasCorrect === undefined || !marketSize || !confidence) {
      return res.status(400).json({ error: "userId, wasCorrect, marketSize, and confidence are required" });
    }
    
    const reputation = await reputationService.updateReputation(
      userId,
      Boolean(wasCorrect),
      parseFloat(marketSize),
      parseFloat(confidence)
    );
    res.json({ reputation });
  } catch (error: any) {
    console.error('Error updating reputation:', error);
    res.status(500).json({ error: "Failed to update reputation", details: error.message });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const leaderboard = await reputationService.getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: "Failed to get leaderboard", details: error.message });
  }
});

// Add dispute win
router.post("/dispute-win", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const result = await reputationService.addDisputeWin(userId);
    res.json({ result });
  } catch (error: any) {
    console.error('Error adding dispute win:', error);
    res.status(500).json({ error: "Failed to add dispute win", details: error.message });
  }
});

// Add slash (penalización)
router.post("/slash", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const result = await reputationService.addSlash(userId);
    res.json({ result });
  } catch (error: any) {
    console.error('Error adding slash:', error);
    res.status(500).json({ error: "Failed to add slash", details: error.message });
  }
});

export default router;


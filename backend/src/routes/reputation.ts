import express from "express";
import { reputationService } from "../services/reputationService";

const router = express.Router();

// Get user reputation
router.get("/:userId", async (req, res) => {
  try {
    const reputation = await reputationService.getReputation(req.params.userId);
    res.json({ reputation });
  } catch (error) {
    res.status(500).json({ error: "Failed to get reputation" });
  }
});

// Join DAO
router.post("/join", async (req, res) => {
  try {
    const { userId, stakeAmount } = req.body;
    const result = await reputationService.joinDAO(userId, stakeAmount);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to join DAO" });
  }
});

// Update reputation
router.post("/update", async (req, res) => {
  try {
    const { userId, wasCorrect, marketSize, confidence } = req.body;
    const reputation = await reputationService.updateReputation(
      userId,
      wasCorrect,
      marketSize,
      confidence
    );
    res.json({ reputation });
  } catch (error) {
    res.status(500).json({ error: "Failed to update reputation" });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await reputationService.getLeaderboard();
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

export default router;


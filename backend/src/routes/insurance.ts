import express from "express";
import { insuranceService } from "../services/insuranceService";
import { optionalAuth, validateWallet } from "../middleware/auth";

const router = express.Router();

// Create insurance claim
router.post("/claims", validateWallet, async (req, res) => {
  try {
    const { marketId, amount, reason, transactionHash } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }
    
    if (!marketId || !amount) {
      return res.status(400).json({ error: "marketId and amount are required" });
    }
    
    const claim = await insuranceService.createClaim({
      marketId: Number(marketId),
      userId,
      amount: parseFloat(amount),
      reason,
      transactionHash
    });
    
    res.status(201).json({ claim });
  } catch (error: any) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: "Failed to create claim", details: error.message });
  }
});

// Get user claims
router.get("/claims/user/:userId", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const claims = await insuranceService.getUserClaims(userId);
    res.json({ claims });
  } catch (error: any) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ error: "Failed to fetch claims", details: error.message });
  }
});

// Get claim by ID
router.get("/claims/:id", async (req, res) => {
  try {
    const claimId = Number(req.params.id);
    const claim = await insuranceService.getClaimById(claimId);
    
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }
    
    res.json({ claim });
  } catch (error: any) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: "Failed to fetch claim", details: error.message });
  }
});

// Update claim status (admin/system only)
router.patch("/claims/:id/status", optionalAuth, async (req, res) => {
  try {
    const claimId = Number(req.params.id);
    const { status, transactionHash } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const claim = await insuranceService.updateClaimStatus(claimId, status, transactionHash);
    res.json({ claim });
  } catch (error: any) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: "Failed to update claim status", details: error.message });
  }
});

// Get pending claims (admin)
router.get("/claims/pending", optionalAuth, async (req, res) => {
  try {
    const claims = await insuranceService.getPendingClaims();
    res.json({ claims });
  } catch (error: any) {
    console.error('Error fetching pending claims:', error);
    res.status(500).json({ error: "Failed to fetch pending claims", details: error.message });
  }
});

// Get claims statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await insuranceService.getClaimsStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching claims stats:', error);
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

export default router;


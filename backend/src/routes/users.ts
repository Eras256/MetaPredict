import express from "express";
import { userService } from "../services/userService";
import { optionalAuth, validateWallet } from "../middleware/auth";

const router = express.Router();

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
});

// Get user by wallet address
router.get("/wallet/:address", async (req, res) => {
  try {
    const user = await userService.getUserByWalletAddress(req.params.address);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error: any) {
    console.error('Error fetching user by wallet:', error);
    res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
});

// Create or update user (upsert by wallet)
router.post("/", validateWallet, async (req, res) => {
  try {
    const walletAddress = req.user?.walletAddress || req.body.walletAddress;
    const { embeddedWallet, reputation, totalStaked, totalWon, totalLost, freeBetsUsed, isPremium, premiumExpiresAt } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
    
    const user = await userService.upsertUserByWallet(walletAddress, {
      embeddedWallet,
      reputation,
      totalStaked,
      totalWon,
      totalLost,
      freeBetsUsed,
      isPremium,
      premiumExpiresAt: premiumExpiresAt ? new Date(premiumExpiresAt) : undefined
    });
    
    res.status(201).json({ user });
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: "Failed to create/update user", details: error.message });
  }
});

// Update user
router.patch("/:id", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Solo permitir actualizar el propio usuario
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden: Can only update own profile" });
    }
    
    const user = await userService.updateUser(userId, updates);
    res.json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: "Failed to update user", details: error.message });
  }
});

export default router;


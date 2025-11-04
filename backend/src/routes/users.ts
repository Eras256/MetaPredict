import express from "express";
import { userService } from "../services/userService";

const router = express.Router();

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create user (email login)
router.post("/", async (req, res) => {
  try {
    const { email, walletAddress } = req.body;
    const user = await userService.createUser(email, walletAddress);
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;


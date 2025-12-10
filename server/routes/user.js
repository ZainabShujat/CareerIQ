// server/routes/user.js
import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/user/me
 * Protected. Returns full profile for the logged-in user (without password).
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean().select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("GET /api/user/me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/user/me
 * Protected. Update allowed profile fields.
 * Body should contain the fields to update (only allowed fields will be applied).
 */
router.put("/me", auth, async (req, res) => {
  try {
    // allowed fields to update (expand as needed)
    const allowed = [
      "name",
      "headline",
      "photoUrl",
      "about",
      "education",     // expect array of objects
      "experience",    // expect array of objects
      "projects",      // expect array of objects
      "skills",        // expect array of {name, proficiency}
      "happinessIndex" // expect { happiness, stability, money }
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("PUT /api/user/me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

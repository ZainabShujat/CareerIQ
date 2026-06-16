import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// POST /api/personality
router.post("/", auth, async (req, res) => {
  try {
    const { scores, answers, timestamp, careerOrientation, orientationAnswers } = req.body;

    if (!scores) return res.status(400).json({ error: "Scores are required" });

    const user = await User.findById(req.user._id);
    user.personality = { scores, answers, timestamp };
    if (careerOrientation !== undefined) user.careerOrientation = careerOrientation;
    if (orientationAnswers !== undefined) user.orientationAnswers = orientationAnswers;
    await user.save();

    res.json({ 
      success: true, 
      personality: user.personality, 
      careerOrientation: user.careerOrientation, 
      orientationAnswers: user.orientationAnswers 
    });
  } catch (err) {
    console.error("Personality Save Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;

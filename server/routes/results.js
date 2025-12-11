const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  try {
    const user = req.user;
    const { testId, score, details } = req.body;

    if (!testId || score === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Store inside user.results array
    user.results = user.results || [];
    user.results.push({
      testId,
      score,
      details,
      takenAt: new Date()
    });

    await user.save();

    return res.json({ success: true, results: user.results });

  } catch (err) {
    console.error("Save results error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

// server/routes/careers.js
import express from "express";
import Career from "../models/Career.js";

const router = express.Router();

// GET /api/careers  (list)
router.get("/", async (req, res) => {
  try {
    const careers = await Career.find().sort({ title: 1 });
    res.json(careers);
  } catch (err) {
    console.error("Careers list error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/careers/:idOrSlug  (detail)
router.get("/:idOrSlug", async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const career = await Career.findOne({
      $or: [{ slug: idOrSlug }, { id: idOrSlug }]
    });

    if (!career) return res.status(404).json({ error: "Not found" });

    res.json(career);
  } catch (err) {
    console.error("Career detail error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

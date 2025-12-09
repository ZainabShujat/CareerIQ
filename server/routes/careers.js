// server/routes/careers.js
import express from "express";
import Career from "../models/Career.js";
import Result from "../models/Result.js";

const router = express.Router(); // <- must be before any router.get/post calls

/**
 * GET /api/careers
 * Optional query:
 *  - tag=engineering    -> returns careers that have that tag (case-insensitive)
 *  - q=text             -> simple title/short/skills fuzzy search
 */
router.get("/", async (req, res) => {
  try {
    const { tag, q } = req.query;
    let filter = {};

    if (tag) {
      const t = String(tag).toLowerCase();
      filter = { tags: { $elemMatch: { $regex: new RegExp(`^${t}$`, "i") } } };
    } else if (q) {
      const qq = String(q);
      filter = {
        $or: [
          { title: { $regex: qq, $options: "i" } },
          { short: { $regex: qq, $options: "i" } },
          { skills: { $elemMatch: { $regex: qq, $options: "i" } } }
        ]
      };
    }

    const careers = await Career.find(filter).lean();
    return res.json(careers);
  } catch (err) {
    console.error("GET /api/careers error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /api/careers/match
 * Query mode: ?tags=engineering,medical
 * If resultId provided as path param (/match/:resultId) your earlier route will still work.
 * This is a quick fallback so the frontend can call match based on tags alone.
 */
router.get("/match", async (req, res) => {
  try {
    // either tags=eng,medical OR resultId path variant handled by your other route
    const { tags } = req.query;
    let preferredTags = [];

    if (tags) {
      preferredTags = String(tags).split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    // if no tags, return top careers (by whatever default ordering)
    const careers = await Career.find().lean();

    if (preferredTags.length === 0) {
      return res.json({ matches: careers.slice(0, 6), count: Math.min(6, careers.length) });
    }

    const scored = careers.map(c => {
      const ctags = (c.tags || []).map(x => String(x).toLowerCase());
      let score = 0;
      preferredTags.forEach(pt => { if (ctags.includes(pt)) score += 2; });
      preferredTags.forEach(pt => { if ((c.title || "").toLowerCase().includes(pt)) score += 1; });
      score += Math.random() * 0.01;
      return { career: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 6).map(s => s.career);
    return res.json({ matches: top, count: top.length });
  } catch (err) {
    console.error("GET /api/careers/match query error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /api/careers/match/:resultId
 * Simple heuristic matcher for demo: ranks careers by tag overlap with result.preferredTags
 * Returns top 6 careers
 */
router.get("/match/:resultId", async (req, res) => {
  try {
    const { resultId } = req.params;
    if (!resultId) return res.status(400).json({ error: "missing resultId" });

    // fetch result
    const result = await Result.findById(resultId).lean();
    if (!result) return res.status(404).json({ error: "result not found" });

    // expected: result.preferredTags = ['engineering','data'] (case-insensitive)
    const preferredTags = (result.preferredTags || []).map(t => String(t).toLowerCase());

    // if no preferredTags provided, try to infer from result.answers (optional)
    // (you can add logic here later to extract tags from answers)
    const careers = await Career.find().lean();

    // score careers by tag overlap + small title match boost
    const scored = careers.map(c => {
      const tags = (c.tags || []).map(t => String(t).toLowerCase());
      let score = 0;
      preferredTags.forEach(pt => { if (tags.includes(pt)) score += 2; });
      preferredTags.forEach(pt => { if ((c.title || "").toLowerCase().includes(pt)) score += 1; });
      // small random tie-breaker
      score += Math.random() * 0.01;
      return { career: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 6).map(s => s.career);

    return res.json({ matches: top, count: top.length });
  } catch (err) {
    console.error("match route error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const careers = await Career.find();
    res.json(careers);
  } catch (err) {
    res.status(500).json({ error: err.message });
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


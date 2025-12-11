// server/routes/ai.js

console.log("🔎 ai route file loaded — OPENAI_KEY present?", !!process.env.OPENAI_KEY);
import express from "express";
import fetch from "node-fetch"; // if using node18+ fetch exists; otherwise install node-fetch
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 1000 * 30,
  max: 10,
});

function buildPromptForInsights(payload) {
  // payload = { profile, tests, happiness }
  const { profile = {}, tests = {}, happiness = {} } = payload;
  return `You are a career guidance assistant. Given:
Profile: ${JSON.stringify(profile)}
Skill tests: ${JSON.stringify(tests)}
Happiness sliders: ${JSON.stringify(happiness)}

Produce JSON with keys:
- recommendations: [{title, confidence, reason}]
- strengths: [string]
- weaknesses: [string]
- actionPlan: [string]
- resources: [string]

Be concise and actionable.`;
}

// POST /api/ai/insights
router.post("/insights", limiter, async (req, res) => {
  try {
    const body = req.body || {};
    const key = process.env.OPENAI_KEY;
    const prompt = buildPromptForInsights(body);

    if (!key) {
      // deterministic fallback: basic rule-based analysis
      const recs = [];
      const topTag = (body.tests?.topSkill || "general").toLowerCase();
      recs.push({ title: `${topTag} Specialist`, confidence: "medium", reason: "Based on your top skill." });
      return res.json({
        recommendations: recs,
        strengths: ["Adaptive", "Curious"],
        weaknesses: ["Needs practical projects"],
        actionPlan: ["Do a 4-week project", "Take an online course"],
        resources: ["Coursera, YouTube"],
        promptUsed: prompt,
      });
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful career guidance assistant for college students." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.8,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "OpenAI error", details: text });
    }
    const json = await r.json();
    // try to parse assistant content as JSON; fallback to raw text
    const content = json.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // if assistant returned text, package it simply
      parsed = { narrative: content };
    }
    return res.json({ ...parsed, promptUsed: prompt });
  } catch (err) {
    console.error("AI insights error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/ai/chat
router.post("/chat", limiter, async (req, res) => {
  try {
    const key = process.env.OPENAI_KEY;
    const { messages = [] } = req.body;
    if (!key) return res.status(400).json({ error: "OPENAI_KEY not configured on server" });

    const payload = {
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.9,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    const content = json.choices?.[0]?.message?.content || "";
    res.json({ content, raw: json });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

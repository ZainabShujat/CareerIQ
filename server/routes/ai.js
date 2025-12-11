// server/routes/ai.js
import express from "express";
import rateLimit from "express-rate-limit";

const router = express.Router();

// safer key generator (avoid X-Forwarded-For crash)
const limiter = rateLimit({
  windowMs: 1000 * 30,
  max: 12,
  keyGenerator: (req) => {
    return req.ip || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "anon";
  }
});

// Simple careers mapping for rule-based recommendations.
// Add or expand to match your careers-100.json later.
const CAREER_MAP = {
  "programming": ["Frontend Developer", "Backend Developer", "Fullstack Developer"],
  "data": ["Data Analyst", "ML Engineer", "Data Scientist"],
  "design": ["UX Designer", "Product Designer", "Visual Designer"],
  "teaching": ["School Teacher", "Content Creator", "Corporate Trainer"],
  "medical": ["Nurse", "Medical Researcher", "Physician Assistant"],
  "management": ["Project Manager", "Product Manager", "Operations Manager"],
  "general": ["Business Analyst", "Consultant", "Entrepreneur"]
};

function pickCareersForSkill(skill, count = 3) {
  const key = (skill || "general").toLowerCase();
  const list = CAREER_MAP[key] || CAREER_MAP["general"];
  return list.slice(0, count);
}

function confidenceFromScore(score) {
  if (score == null) return "medium";
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function analyze(profile = {}, tests = {}, happiness = {}) {
  // tests may have { scores: { skill: number, ... }, topSkill: "data" }
  const scores = tests.scores || {};
  const topSkill = (tests.topSkill || Object.keys(scores)[0] || "general").toLowerCase();
  const topScore = scores[topSkill] ?? (tests.topScore ?? 65);

  // recommendations
  const candidates = pickCareersForSkill(topSkill, 5);
  const recommendations = candidates.slice(0, 3).map((title, i) => ({
    title,
    confidence: confidenceFromScore(topScore - i * 10),
    reason: `Matched by top skill "${topSkill}" with score ${topScore}.`
  }));

  // strengths / weaknesses (simple heuristics)
  const strengths = [];
  const weaknesses = [];
  if (topScore >= 75) strengths.push(`${topSkill} aptitude`);
  else weaknesses.push(`${topSkill} needs practice`);

  // happiness sliders: salary, stress, worklife
  const sSalary = happiness.salary ?? 50;
  const sStress = happiness.stress ?? 50;
  const sWorklife = happiness.worklife ?? happiness.worklifeQuality ?? 50;

  if (sSalary >= 70) strengths.push("salary expectation matched");
  else weaknesses.push("consider salary expectations vs. role");

  if (sStress <= 40) strengths.push("comfortable under low stress");
  else weaknesses.push("may struggle with high-stress roles");

  if (sWorklife >= 60) strengths.push("prefers healthy work-life balance");

  // action plan (3 items)
  const actionPlan = [
    `Build a small portfolio project related to ${topSkill} (2-4 weeks).`,
    `Take a focused course to raise ${topSkill} skill by 10-20 points.`,
    `Apply to internships or small freelance gigs to get real experience.`
  ];

  // resources
  const resources = [
    "Free courses on Coursera / edX / YouTube",
    "Documentation and tutorials on MDN / official libs",
    "Community: Discord / Reddit groups for the skill"
  ];

  return {
    recommendations,
    strengths,
    weaknesses,
    actionPlan,
    resources
  };
}

// POST /api/ai/insights
router.post("/insights", limiter, async (req, res) => {
  try {
    const body = req.body || {};
    // If OpenAI key present and you want to toggle to real AI later, keep this flag.
    // But for rule-based mode we ignore external API.
    const result = analyze(body.profile, body.tests, body.happiness);

    // also attach a little summary narrative for UI
    const narrative = `Hi ${body.profile?.name || "there"} — based on top skill "${body.tests?.topSkill || 'general'}" we recommend ${result.recommendations.map(r => r.title).join(", ")}.`;

    return res.json({ ...result, narrative, fallback: true });
  } catch (err) {
    console.error("AI insights error (rule mode):", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/ai/chat
// Accepts { messages: [{role, content}], message: "..." , profile: {...} }
router.post("/chat", limiter, async (req, res) => {
  try {
    const { messages = [], message = "", profile = {}, tests = {}, happiness = {} } = req.body;

    // Simple rule-based reply:
    const last = message || (messages.length ? messages[messages.length - 1].content : "");
    const lower = (last || "").toLowerCase();

    // If user asks for recommendations, return short analyze summary
    if (lower.includes("recommend") || lower.includes("career") || lower.includes("suggest")) {
      const analysis = analyze(profile, tests, happiness);
      const reply = `Based on the info you gave, top picks: ${analysis.recommendations.map(r => `${r.title} (${r.confidence})`).join(", ")}. I suggest: ${analysis.actionPlan[0]}`;
      return res.json({ content: reply, fallback: true });
    }

    // If user asks about a specific career in recommendations
    for (const skill of Object.keys(CAREER_MAP)) {
      for (const c of CAREER_MAP[skill]) {
        if (lower.includes(c.toLowerCase())) {
          const reply = `${c} typically requires skill in ${skill}. Suggested first steps: build a portfolio project and read starter tutorials.`;
          return res.json({ content: reply, fallback: true });
        }
      }
    }

    // generic replies
    if (!last || last.trim().length < 3) {
      return res.json({ content: "Hey — what specifically do you want advice on? (career suggestions, next steps, skill building)", fallback: true });
    }

    return res.json({
      content: `I hear you: "${last}". Quick thought: focus on one project or learning goal this week, then reach out with progress and I can refine suggestions.`,
      fallback: true
    });
  } catch (err) {
    console.error("AI chat error (rule mode):", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

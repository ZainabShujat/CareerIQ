// server/routes/ai.js
import express from "express";
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 1000 * 30,
  max: 12,
  keyGenerator: (req) => {
    return req.ip || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "anon";
  }
});

// Basic career map used for rule-based matching & suggestions.
// Expand this or load from careers-100.json for better coverage.
const CAREER_MAP = {
  programming: ["Frontend Developer", "Backend Developer", "Fullstack Developer"],
  data: ["Data Analyst", "ML Engineer", "Data Scientist"],
  design: ["UX Designer", "Product Designer", "Visual Designer"],
  teaching: ["School Teacher", "Content Creator", "Corporate Trainer"],
  medical: ["Nurse", "Medical Researcher", "Physician Assistant"],
  management: ["Project Manager", "Product Manager", "Operations Manager"],
  general: ["Business Analyst", "Consultant", "Entrepreneur"]
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
  const scores = tests.scores || {};
  const topSkill = (tests.topSkill || Object.keys(scores)[0] || "general").toLowerCase();
  const topScore = scores[topSkill] ?? (tests.topScore ?? 65);

  const candidates = pickCareersForSkill(topSkill, 5);
  const recommendations = candidates.slice(0, 3).map((title, i) => ({
    title,
    confidence: confidenceFromScore(topScore - i * 10),
    reason: `Matched by top skill "${topSkill}" with score ${topScore}.`
  }));

  const strengths = [];
  const weaknesses = [];
  if (topScore >= 75) strengths.push(`${topSkill} aptitude`);
  else weaknesses.push(`${topSkill} needs practice`);

  const sSalary = happiness.salary ?? 50;
  const sStress = happiness.stress ?? 50;
  const sWorklife = happiness.worklife ?? happiness.worklifeQuality ?? 50;

  if (sSalary >= 70) strengths.push("salary expectation matched");
  else weaknesses.push("consider salary expectations vs. role");

  if (sStress <= 40) strengths.push("comfortable under low stress");
  else weaknesses.push("may struggle with high-stress roles");

  if (sWorklife >= 60) strengths.push("prefers healthy work-life balance");

  const actionPlan = [
    `Build a small portfolio project related to ${topSkill} (2-4 weeks).`,
    `Take a focused course to raise ${topSkill} skill by 10-20 points.`,
    `Apply to internships or small freelance gigs to get real experience.`
  ];

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

// Helper: detect if user text matches career-intent
function hasCareerIntent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const keywords = [
    "career", "path", "become", "how to", "how do i", "steps", "guide", "which career", "recommend",
    "suggest", "what should i", "i want to be", "i want to know a path", "career path"
  ];
  return keywords.some(k => lower.includes(k));
}

// Helper: find a known career or skill mentioned in text
function extractCareerOrSkill(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  // check career names
  for (const skill of Object.keys(CAREER_MAP)) {
    for (const role of CAREER_MAP[skill]) {
      if (lower.includes(role.toLowerCase())) return { type: "role", value: role, skill };
    }
    // also match skill keywords
    if (lower.includes(skill)) return { type: "skill", value: skill, skill };
  }
  // some common phrasing: "data science", "web dev"
  if (lower.includes("data")) return { type: "skill", value: "data", skill: "data" };
  if (lower.includes("web") || lower.includes("frontend") || lower.includes("backend")) return { type: "skill", value: "programming", skill: "programming" };
  return null;
}

// POST /api/ai/insights
router.post("/insights", limiter, async (req, res) => {
  try {
    const body = req.body || {};
    const result = analyze(body.profile, body.tests, body.happiness);
    const narrative = `Hi ${body.profile?.name || "there"} — based on top skill "${body.tests?.topSkill || 'general'}" we recommend ${result.recommendations.map(r => r.title).join(", ")}.`;
    return res.json({ ...result, narrative, content: narrative, reply: narrative, fallback: true });
  } catch (err) {
    console.error("AI insights error (rule mode):", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/ai/chat
router.post("/chat", limiter, async (req, res) => {
  try {
    const { messages = [], message = "", profile = {}, tests = {}, happiness = {} } = req.body || {};
    // derive user text: prefer explicit `message`, else last message content in array
    const last = (typeof message === "string" && message.trim().length) ? message.trim() : (messages.length ? (messages[messages.length - 1].content || "") : "");
    const lower = (last || "").toLowerCase();

    // log minimal request for debugging (safe)
    console.log("AI chat request:", { ip: req.ip, len: (last || "").length, sample: (last || "").slice(0, 80) });

    // 1) If user mentions a specific role/skill, return role-specific steps
    const mention = extractCareerOrSkill(last);
    if (mention && (mention.type === "role" || mention.type === "skill")) {
      const skillKey = mention.skill || mention.value;
      const careers = pickCareersForSkill(skillKey, 3);
      const reply = mention.type === "role"
        ? `${mention.value} usually maps to skills in ${skillKey}. Suggested next steps: 1) build a small project, 2) follow a focused course, 3) apply to internships. Example roles: ${careers.join(", ")}.`
        : `If you're interested in ${mention.value}, common paths include: ${careers.join(", ")}. Actionable first step: build one small project and share it in a community for feedback.`;

      return res.json({ content: reply, reply: reply, fallback: false });
    }

    // 2) If user expresses career-intent / asks for path, run analyze() for tailored recommendations
    if (hasCareerIntent(last)) {
      const analysis = analyze(profile, tests, happiness);
      const recs = analysis.recommendations.map(r => `${r.title} (${r.confidence})`).join(", ");
      const reply = `For a career path, top picks are: ${recs}. Starter plan: ${analysis.actionPlan[0]} Next steps: ${analysis.actionPlan.slice(1).join(" / ")}.`;
      return res.json({ content: reply, reply: reply, fallback: false });
    }

    // 3) If the user asks a short question / greeting, respond conversationally
    if (!last || last.trim().length < 3) {
      const reply = "Hey — what specifically would you like help with? Try: 'suggest careers', 'how to become a data scientist', or 'what are steps to become a frontend developer'.";
      return res.json({ content: reply, reply: reply, fallback: true });
    }

    // 4) If nothing above matched, be helpful: offer a small, specific action
    // Use analysis as a dynamic base so answers vary with profile/tests input
    const analysis = analyze(profile, tests, happiness);
    const fallbackReply = `I hear you: "${last}". Quick thought: ${analysis.actionPlan[0]} If you want a clearer path, ask "what career matches me" or mention a role (for example: Data Analyst or UX Designer).`;
    return res.json({ content: fallbackReply, reply: fallbackReply, fallback: true });

  } catch (err) {
    console.error("AI chat error (rule mode):", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

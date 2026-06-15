import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

function noKey(res) {
  if (!process.env.OPENAI_KEY) {
    res.status(500).json({ error: "OpenAI API key is missing from environment variables." });
    return true;
  }
  return false;
}

// ── POST /api/ai/chat  (existing general chatbot) ────────────────────────────
router.post("/chat", async (req, res) => {
  if (noKey(res)) return;
  try {
    const { message, profile, tests } = req.body;
    const systemPrompt = `You are CareerIQ, an AI career assistant. 
User Profile: ${JSON.stringify(profile || {})}
Skill Test Results: ${JSON.stringify(tests || {})}
Provide helpful, concise, personalised career advice.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
    });
    res.json({ content: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI /chat error:", err.message);
    res.status(500).json({ content: "Error processing request." });
  }
});

// ── POST /api/ai/explain  (why does this career match the user?) ─────────────
router.post("/explain", async (req, res) => {
  if (noKey(res)) return;
  try {
    const { career, userProfile, scores } = req.body;
    const prompt = `You are CareerIQ, an AI career advisor. Explain in 3-4 sentences why this user is a ${scores?.final ?? "good"}% match for ${career?.title}.

Career requirements:
- Traits: ${JSON.stringify(career?.requiredTraits || {})}
- Skills: ${JSON.stringify(career?.requiredSkills || {})}
- Lifestyle: ${JSON.stringify(career?.lifestyleProfile || {})}

User profile:
- Personality scores: ${JSON.stringify(userProfile?.personality || {})}
- Skill scores: ${JSON.stringify(userProfile?.skills || {})}
- Lifestyle preferences: ${JSON.stringify(userProfile?.happiness || {})}

Score breakdown: Personality match ${scores?.personality}%, Skill match ${scores?.skills}%, Lifestyle match ${scores?.lifestyle}%.

Write a clear, personal, encouraging explanation. Mention specific traits or skills. Do not use bullet points — write flowing sentences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    });
    res.json({ explanation: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI /explain error:", err.message);
    res.status(500).json({ explanation: "Could not generate explanation." });
  }
});

// ── POST /api/ai/strengths  (personalised strength + growth analysis) ─────────
router.post("/strengths", async (req, res) => {
  if (noKey(res)) return;
  try {
    const { personality, skills } = req.body;
    const prompt = `You are CareerIQ, an AI career advisor. Analyse this person's assessment data and provide a personalised strength and growth report.

Personality scores (0-100):
${Object.entries(personality || {}).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Skill scores:
${skills ? Object.entries(skills).map(([k, v]) => `- ${k}: ${v}`).join("\n") : "Not yet taken"}

Provide:
1. TOP STRENGTHS (2-3): Their most notable personality traits and skills. Be specific.
2. GROWTH AREAS (2-3): Areas where they score lower and could develop to open more career paths.
3. CAREER DIRECTION: 1-2 sentences about the type of work they are likely to thrive in, based on their data.

Keep it actionable, encouraging and specific to their numbers. Use section headers as shown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });
    res.json({ analysis: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI /strengths error:", err.message);
    res.status(500).json({ analysis: "Could not generate analysis." });
  }
});

// ── POST /api/ai/gap  (gap analysis for a target career) ─────────────────────
router.post("/gap", async (req, res) => {
  if (noKey(res)) return;
  try {
    const { targetCareer, userProfile } = req.body;
    const prompt = `You are CareerIQ, a career development advisor. Produce a gap analysis for this user targeting: ${targetCareer?.title}.

Career requirements:
- Traits: ${JSON.stringify(targetCareer?.requiredTraits || {})}
- Skills: ${JSON.stringify(targetCareer?.requiredSkills || {})}

User current scores:
- Personality: ${JSON.stringify(userProfile?.personality || {})}
- Skills: ${JSON.stringify(userProfile?.skills || {})}

Provide:
1. CURRENT READINESS: X% (calculate based on trait and skill gaps)
2. KEY GAPS: The 2-3 most significant gaps between user scores and what this career requires
3. ACTION PLAN: Concrete steps to close those gaps (courses, projects, experiences)

Be specific and realistic. Keep it under 200 words.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
    });
    res.json({ gap: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI /gap error:", err.message);
    res.status(500).json({ gap: "Could not generate gap analysis." });
  }
});

export default router;

// server/routes/careers.js
import express from "express";
import Career from "../models/Career.js";
import Result from "../models/Result.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY || "dummy-key" });

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

/**
 * GET /api/careers/:idOrSlug/live-data
 * Dynamically fetches live Indian market details, salary tiers, and top employers using OpenAI.
 * Includes a robust fallback mechanism in case the API key is invalid or fails.
 */
/**
 * GET /api/careers/:idOrSlug/live-data
 * Dynamically fetches live Indian market details, salary tiers, and top employers.
 * Uses Gemini or OpenAI if keys are provided, otherwise falls back to a highly realistic, domain-specific generator.
 */
router.get("/:idOrSlug/live-data", async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const career = await Career.findOne({
      $or: [{ slug: idOrSlug }, { id: idOrSlug }]
    });

    if (!career) return res.status(404).json({ error: "Not found" });

    // Dynamic Category-Aware Fallback
    const fallbackData = getLiveFallbackData(career);

    // 1. Try Gemini first (completely free and developer-friendly)
    if (process.env.GEMINI_KEY && !process.env.GEMINI_KEY.includes("dummy")) {
      try {
        const geminiResult = await fetchGeminiData(career.title, fallbackData);
        if (geminiResult) {
          return res.json(geminiResult);
        }
      } catch (geminiErr) {
        console.warn("Gemini Live Data API call failed. Trying OpenAI. Error:", geminiErr.message);
      }
    }

    // 2. Try OpenAI second (standard paid option)
    if (process.env.OPENAI_KEY && !process.env.OPENAI_KEY.includes("dummy")) {
      try {
        const prompt = `You are CareerIQ, an AI market analyst. Provide live career salary data, top employers, and market demand insights in India for the career: ${career.title}.
Return a JSON object containing:
- juniorSalary (LPA range, e.g. "₹4–6 LPA")
- midSalary (LPA range, e.g. "₹8–15 LPA")
- seniorSalary (LPA range, e.g. "₹18–30 LPA")
- demandLevel ("High", "Growing", or "Stable")
- demandTrend (1-2 sentences about hiring trends in India for 2026)
- topEmployers (array of 4 prominent companies in India hiring for this role)
- hotTools (array of 4 emerging tools, technologies, or skills for this role)

Do not output any markdown formatting or prefix, only output raw JSON.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        });

        const content = completion.choices[0].message.content.trim();
        const cleanJson = content.replace(/^```json\s*/i, "").replace(/```$/, "");
        const parsed = JSON.parse(cleanJson);

        return res.json({
          juniorSalary: parsed.juniorSalary || fallbackData.juniorSalary,
          midSalary: parsed.midSalary || fallbackData.midSalary,
          seniorSalary: parsed.seniorSalary || fallbackData.seniorSalary,
          demandLevel: parsed.demandLevel || fallbackData.demandLevel,
          demandTrend: parsed.demandTrend || fallbackData.demandTrend,
          topEmployers: parsed.topEmployers || fallbackData.topEmployers,
          hotTools: parsed.hotTools || fallbackData.hotTools,
        });
      } catch (apiErr) {
        console.error("OpenAI Live Data API call failed. Using fallback data. Error:", apiErr.message);
        return res.json(fallbackData);
      }
    }

    // 3. Serve intelligent fallback if no API keys are available or both failed
    return res.json(fallbackData);
  } catch (err) {
    console.error("GET Live career data error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Helper: Fetches live data from Google's Gemini API (free tier)
 */
async function fetchGeminiData(careerTitle, fallback) {
  const key = process.env.GEMINI_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const prompt = `You are CareerIQ, an AI market analyst. Provide live career salary data, top employers, and market demand insights in India for the career: ${careerTitle}.
Return a JSON object containing:
- juniorSalary (LPA range, e.g. "₹4–6 LPA")
- midSalary (LPA range, e.g. "₹8–15 LPA")
- seniorSalary (LPA range, e.g. "₹18–30 LPA")
- demandLevel ("High", "Growing", or "Stable")
- demandTrend (1-2 sentences about hiring trends in India for 2026)
- topEmployers (array of 4 prominent companies in India hiring for this role)
- hotTools (array of 4 emerging tools, technologies, or skills for this role)

Do not output any markdown formatting or prefix, only output raw JSON.`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const cleanJson = text.replace(/^```json\s*/i, "").replace(/```$/, "");
  const parsed = JSON.parse(cleanJson);
  return {
    juniorSalary: parsed.juniorSalary || fallback.juniorSalary,
    midSalary: parsed.midSalary || fallback.midSalary,
    seniorSalary: parsed.seniorSalary || fallback.seniorSalary,
    demandLevel: parsed.demandLevel || fallback.demandLevel,
    demandTrend: parsed.demandTrend || fallback.demandTrend,
    topEmployers: parsed.topEmployers || fallback.topEmployers,
    hotTools: parsed.hotTools || fallback.hotTools,
  };
}

/**
 * Helper: Generates realistic, localized career data based on tags and title categories.
 */
function getLiveFallbackData(career) {
  const title = (career.title || "").toLowerCase();
  const tags = (career.tags || []).map(t => t.toLowerCase());

  let domain = "other";
  
  if (tags.includes("software") || tags.includes("engineering") || tags.includes("tech") || tags.includes("infrastructure") || tags.includes("ai") || tags.includes("ml") || tags.includes("cloud") || tags.includes("robotics") || tags.includes("hardware") || tags.includes("mobile") || tags.includes("quality")) {
    domain = "tech";
  } else if (tags.includes("medical") || tags.includes("healthcare") || tags.includes("public-health") || tags.includes("pharmacy") || tags.includes("care") || tags.includes("lab") || tags.includes("specialist") || tags.includes("bio") || tags.includes("biotech")) {
    domain = "healthcare";
  } else if (tags.includes("culinary")) {
    domain = "culinary";
  } else if (tags.includes("design") || tags.includes("creative") || tags.includes("media") || tags.includes("writing") || tags.includes("content")) {
    domain = "creative";
  } else if (tags.includes("teaching") || tags.includes("education")) {
    domain = "education";
  } else if (tags.includes("legal") || tags.includes("compliance")) {
    domain = "legal";
  } else if (tags.includes("finance") || tags.includes("business") || tags.includes("management") || tags.includes("marketing") || tags.includes("sales") || tags.includes("client") || tags.includes("customer") || tags.includes("consulting")) {
    domain = "business";
  } else if (tags.includes("logistics") || tags.includes("operations") || tags.includes("ops")) {
    domain = "operations";
  } else if (tags.includes("science") || tags.includes("environment") || tags.includes("research")) {
    domain = "science";
  }

  // Parse base salary
  let base = 5;
  let isVariable = false;
  if (career.salary) {
    if (career.salary.toLowerCase().includes("variable") || career.salary.toLowerCase().includes("unlimited")) {
      isVariable = true;
    } else {
      const match = career.salary.match(/([0-9.]+)/);
      if (match) {
        base = parseFloat(match[1]);
      }
    }
  }

  let juniorSalary = "";
  let midSalary = "";
  let seniorSalary = "";

  if (isVariable) {
    juniorSalary = "Variable (₹0–3 LPA)";
    midSalary = "Variable (₹5–15 LPA)";
    seniorSalary = "Variable / Unlimited";
  } else {
    // Generate realistic scales based on base
    const jrMin = Math.max(1.8, Math.round(base * 0.6 * 10) / 10);
    const jrMax = Math.max(2.5, Math.round(base * 0.8 * 10) / 10);
    const midMin = base;
    const midMax = Math.round(base * 1.5 * 10) / 10;
    const srMin = Math.round(base * 2.2 * 10) / 10;
    const srMax = Math.max(15, Math.round(base * 4.5 * 10) / 10);

    juniorSalary = `₹${jrMin}–${jrMax} LPA`;
    midSalary = `₹${midMin}–${midMax} LPA`;
    seniorSalary = `₹${srMin}–${srMax} LPA`;
  }

  let demandLevel = "Growing";
  let demandTrend = "";
  let topEmployers = [];
  let hotTools = (career.skills && career.skills.slice(0, 4)) || ["Communication", "Problem Solving"];

  switch(domain) {
    case "tech":
      demandLevel = tags.includes("ai") || tags.includes("ml") || tags.includes("cloud") ? "High Demand" : "Growing";
      demandTrend = `India's booming digital economy continues to drive steady hiring for ${career.title} roles, particularly across SaaS, cloud infrastructure, and AI engineering services.`;
      topEmployers = ["TCS", "Infosys", "Wipro", "Cognizant", "Google India", "Microsoft India", "Tech Startups"];
      break;
    case "healthcare":
      demandLevel = "Stable";
      demandTrend = `Growth in healthcare infrastructure and clinical research services across India ensures steady, resilient demand for qualified ${career.title} professionals.`;
      topEmployers = ["Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Dr. Reddy's", "Biocon", "WHO India", "Ministry of Health"];
      break;
    case "culinary":
      demandLevel = "Growing";
      demandTrend = `The expansion of luxury hospitality, quick service restaurants (QSRs), and artisanal bakeries in Indian metros is driving strong demand for skilled culinary professionals like ${career.title}s.`;
      topEmployers = ["Taj Hotels", "ITC Hotels", "Oberoi Group", "Jubilant FoodWorks (Domino's)", "Marriott International", "Baking/Restaurant Chains"];
      break;
    case "creative":
      demandLevel = "Growing";
      demandTrend = `The rapid growth of digital media, advertising agencies, e-commerce platforms, and product design startups in India is fueling demand for talented ${career.title}s.`;
      topEmployers = ["Zomato", "Swiggy", "Fractal Ink UI/UX", "Social Beat", "Leo Burnett India", "Netflix India", "Creative Agencies"];
      break;
    case "education":
      demandLevel = "Stable";
      demandTrend = `Hiring demand for ${career.title}s remains resilient as educational institutions, schools, and EdTech platforms focus on hybrid learning and high-quality instructional delivery.`;
      topEmployers = ["Kendriya Vidyalaya Sangathan", "Delhi Public School Society", "BYJU'S", "Unacademy", "Vedantu", "Pearson India", "Private Schools"];
      break;
    case "legal":
      demandLevel = "Stable";
      demandTrend = `Corporate expansion, digital privacy regulations, and compliance mandates in India are driving the need for skilled ${career.title}s in top law firms and MNCs.`;
      topEmployers = ["Shardul Amarchand Mangaldas", "Cyril Amarchand Mangaldas", "AZB & Partners", "Khaitan & Co", "Trilegal", "In-House Corporate Legal Teams"];
      break;
    case "business":
      demandLevel = "Growing";
      demandTrend = `Business consolidation, consulting needs, and digital transformations across Indian corporations create a continuous demand for strategy-focused ${career.title}s.`;
      topEmployers = ["HDFC Bank", "ICICI Bank", "Deloitte India", "PwC India", "EY India", "KPMG India", "McKinsey & Co.", "Goldman Sachs"];
      break;
    case "operations":
      demandLevel = "Growing";
      demandTrend = `The rapid expansion of e-commerce, warehousing, supply chains, and third-party logistics (3PL) in India is accelerating hiring for specialized ${career.title} roles.`;
      topEmployers = ["Delhivery", "Blue Dart Express", "DHL India", "Amazon India Logistics", "Flipkart Logistics", "FedEx India", "Supply Chain Firms"];
      break;
    case "science":
      demandLevel = "Stable";
      demandTrend = `Increased focus on environmental sustainability, ESG compliance, and biomedical innovation in India is driving steady opportunities for ${career.title}s in research and advisory.`;
      topEmployers = ["The Energy and Resources Institute (TERI)", "Centre for Science and Environment (CSE)", "CSIR Labs", "Biotech Research Centers", "NGOs"];
      break;
    default:
      demandLevel = "Growing";
      demandTrend = `Professional service sectors and evolving market trends in India support a steady hiring environment for ${career.title} professionals.`;
      topEmployers = ["Deloitte", "MNCs", "Leading Domestic Enterprises", "Fast-growing Startups"];
      break;
  }

  // Filter employers to keep it around 4
  topEmployers = topEmployers.slice(0, 4);

  return {
    juniorSalary,
    midSalary,
    seniorSalary,
    demandLevel,
    demandTrend,
    topEmployers,
    hotTools
  };
}

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


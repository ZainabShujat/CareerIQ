/**
 * server/routes/ai.js
 *
 * ML-Powered Career Chatbot Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture (no heavy dependencies — pure JS):
 *
 * 1. INTENT CLASSIFIER  — TF-IDF weighted keyword scoring across 14 intent classes
 * 2. CAREER MATCHER     — Cosine similarity between user trait vector & career vectors
 * 3. PROFILE ANALYSER   — Extracts dominant traits/skills from user profile object
 * 4. RESPONSE GENERATOR — Selects & personalises response templates using profile data
 * 5. OPENAI GATEWAY     — Tries OpenAI gpt-3.5-turbo first; falls back to ML engine
 */

import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ─── 1. OpenAI (optional) ────────────────────────────────────────────────────
let openai = null;
try {
  if (process.env.OPENAI_KEY && process.env.OPENAI_KEY.startsWith("sk-")) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  }
} catch (_) {}

// ─── 2. Career Knowledge Base ────────────────────────────────────────────────
/**
 * Each career has a normalised trait vector (0-1 per dimension).
 * Dimensions: analytical, creative, leadership, social, technical,
 *             structured, entrepreneurial, empathetic, communication, independence
 * This is the "ML model" — a hand-crafted feature matrix trained on domain knowledge.
 */
const CAREER_KB = [
  {
    title: "Data Scientist",
    slug: "data-scientist",
    tags: ["data", "tech", "ml", "ai"],
    salaryRange: "₹6–30 LPA",
    demandLevel: "Very High",
    traits:   { analytical:0.95, creative:0.5, leadership:0.4, social:0.3, technical:0.9, structured:0.7, entrepreneurial:0.3, empathetic:0.2, communication:0.5, independence:0.7 },
    requiredSkills: ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualisation"],
    description: "Uncover insights from complex data using statistics and machine learning. High demand across all industries.",
    entryPath: "B.Sc/B.Tech → online ML courses → Kaggle portfolio → internship → junior Data Analyst → Data Scientist",
    topEmployers: ["Google", "Microsoft", "Flipkart", "Swiggy", "Mu Sigma", "Fractal Analytics"],
  },
  {
    title: "Software Engineer",
    slug: "software-engineer",
    tags: ["tech", "coding", "engineering"],
    salaryRange: "₹4–60 LPA",
    demandLevel: "Extremely High",
    traits:   { analytical:0.85, creative:0.6, leadership:0.4, social:0.3, technical:0.95, structured:0.75, entrepreneurial:0.4, empathetic:0.2, communication:0.4, independence:0.65 },
    requiredSkills: ["DSA", "System Design", "Git", "JavaScript/Python/Java", "APIs"],
    description: "Design and build software systems. Backend, frontend, full-stack, mobile — multiple specialisations available.",
    entryPath: "CS degree or bootcamp → personal projects → open source contributions → campus/off-campus hiring",
    topEmployers: ["Infosys", "TCS", "Wipro", "Google", "Microsoft", "startups"],
  },
  {
    title: "UX/UI Designer",
    slug: "ux-designer",
    tags: ["design", "creative", "product"],
    salaryRange: "₹3–35 LPA",
    demandLevel: "High",
    traits:   { analytical:0.5, creative:0.95, leadership:0.4, social:0.6, technical:0.4, structured:0.55, entrepreneurial:0.5, empathetic:0.85, communication:0.7, independence:0.55 },
    requiredSkills: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"],
    description: "Create intuitive, beautiful product experiences. Bridge the gap between users and technology.",
    entryPath: "Design tools mastery → portfolio of 3–5 case studies → internship → junior designer role",
    topEmployers: ["Zomato", "Swiggy", "Razorpay", "Thoughtworks", "Flipkart", "design agencies"],
  },
  {
    title: "Product Manager",
    slug: "product-manager",
    tags: ["product", "strategy", "business", "tech"],
    salaryRange: "₹8–80 LPA",
    demandLevel: "High",
    traits:   { analytical:0.8, creative:0.65, leadership:0.9, social:0.8, technical:0.55, structured:0.6, entrepreneurial:0.8, empathetic:0.7, communication:0.9, independence:0.4 },
    requiredSkills: ["Roadmapping", "Data Analysis", "Stakeholder Management", "Agile/Scrum", "PRD Writing"],
    description: "Own the product strategy, define the roadmap, and work with engineering and design to ship features users love.",
    entryPath: "Any engineering/business degree → Associate PM programmes → lateral move from SWE or designer",
    topEmployers: ["Google", "Amazon", "Flipkart", "Paytm", "CRED", "Meesho"],
  },
  {
    title: "Cybersecurity Analyst",
    slug: "cybersecurity-analyst",
    tags: ["security", "tech", "networking"],
    salaryRange: "₹5–40 LPA",
    demandLevel: "Very High",
    traits:   { analytical:0.9, creative:0.5, leadership:0.4, social:0.25, technical:0.9, structured:0.8, entrepreneurial:0.3, empathetic:0.2, communication:0.35, independence:0.8 },
    requiredSkills: ["Network Security", "Ethical Hacking", "SIEM Tools", "Cryptography", "Incident Response"],
    description: "Protect systems and data from cyber threats. One of the fastest growing fields globally.",
    entryPath: "Networking basics → CEH/CISSP certification → CTF competitions → SOC analyst → senior roles",
    topEmployers: ["Infosys", "Wipro", "IBM", "Deloitte", "PwC", "government agencies"],
  },
  {
    title: "Financial Analyst",
    slug: "financial-analyst",
    tags: ["finance", "business", "analytics"],
    salaryRange: "₹4–35 LPA",
    demandLevel: "Moderate",
    traits:   { analytical:0.9, creative:0.3, leadership:0.5, social:0.4, technical:0.5, structured:0.9, entrepreneurial:0.4, empathetic:0.2, communication:0.55, independence:0.6 },
    requiredSkills: ["Financial Modelling", "Excel/Python", "Valuation", "Accounting", "CFA"],
    description: "Analyse financial data to guide business decisions and investment strategies.",
    entryPath: "B.Com/B.A. Economics → CFA Level 1 → internship at bank or NBFC → analyst role",
    topEmployers: ["HDFC", "ICICI", "McKinsey", "Goldman Sachs", "JP Morgan", "Deloitte"],
  },
  {
    title: "Digital Marketer",
    slug: "digital-marketer",
    tags: ["marketing", "creative", "business", "social"],
    salaryRange: "₹3–20 LPA",
    demandLevel: "High",
    traits:   { analytical:0.6, creative:0.8, leadership:0.5, social:0.8, technical:0.4, structured:0.5, entrepreneurial:0.7, empathetic:0.7, communication:0.9, independence:0.45 },
    requiredSkills: ["SEO/SEM", "Google Analytics", "Content Strategy", "Social Media", "Email Marketing"],
    description: "Drive brand awareness and growth through digital channels — SEO, paid ads, content, social media.",
    entryPath: "Marketing degree or self-learning → Google/HubSpot certifications → internship → junior marketer",
    topEmployers: ["iProspect", "WPP agencies", "startups", "e-commerce companies", "in-house teams"],
  },
  {
    title: "Doctor / Physician",
    slug: "doctor",
    tags: ["medical", "healthcare", "biology"],
    salaryRange: "₹8–60 LPA",
    demandLevel: "Steady",
    traits:   { analytical:0.8, creative:0.4, leadership:0.6, social:0.7, technical:0.65, structured:0.75, entrepreneurial:0.3, empathetic:0.95, communication:0.8, independence:0.5 },
    requiredSkills: ["Medical Diagnosis", "Clinical Skills", "Patient Communication", "Research", "Emergency Care"],
    description: "Diagnose and treat illnesses, promote health and wellbeing. Requires long training but highly rewarding.",
    entryPath: "NEET → MBBS (5.5 years) → Internship (1 year) → MD/MS or General Practice",
    topEmployers: ["Apollo", "Fortis", "AIIMS", "government hospitals", "private clinics"],
  },
  {
    title: "Civil/Mechanical Engineer",
    slug: "civil-mechanical-engineer",
    tags: ["engineering", "construction", "manufacturing"],
    salaryRange: "₹3–20 LPA",
    demandLevel: "Moderate",
    traits:   { analytical:0.8, creative:0.5, leadership:0.5, social:0.3, technical:0.85, structured:0.85, entrepreneurial:0.3, empathetic:0.2, communication:0.4, independence:0.6 },
    requiredSkills: ["AutoCAD", "Structural Analysis", "Project Management", "Materials Science", "Thermodynamics"],
    description: "Design and build physical infrastructure or mechanical systems. Core engineering disciplines.",
    entryPath: "JEE → B.Tech → campus placement or GATE → PSU/private sector",
    topEmployers: ["L&T", "Tata Projects", "BHEL", "DRDO", "infrastructure companies"],
  },
  {
    title: "Teacher / Educator",
    slug: "teacher",
    tags: ["teaching", "education", "social"],
    salaryRange: "₹2–15 LPA",
    demandLevel: "Steady",
    traits:   { analytical:0.5, creative:0.65, leadership:0.7, social:0.9, technical:0.25, structured:0.6, entrepreneurial:0.4, empathetic:0.95, communication:0.95, independence:0.35 },
    requiredSkills: ["Curriculum Design", "Classroom Management", "Communication", "Patience", "Subject Expertise"],
    description: "Shape the next generation. EdTech is creating new opportunities beyond traditional classrooms.",
    entryPath: "B.Ed → government jobs (CTET/TET) or private schools → EdTech companies (BYJU's, Unacademy)",
    topEmployers: ["BYJU's", "Unacademy", "Vedantu", "government schools", "international schools"],
  },
  {
    title: "AI/ML Engineer",
    slug: "ai-ml-engineer",
    tags: ["ai", "ml", "tech", "data"],
    salaryRange: "₹8–60 LPA",
    demandLevel: "Extremely High",
    traits:   { analytical:0.95, creative:0.6, leadership:0.4, social:0.25, technical:0.98, structured:0.7, entrepreneurial:0.4, empathetic:0.15, communication:0.4, independence:0.75 },
    requiredSkills: ["Python", "TensorFlow/PyTorch", "Mathematics", "MLOps", "Cloud (AWS/GCP)"],
    description: "Build and deploy machine learning models and AI systems. The hottest field in tech right now.",
    entryPath: "CS/Math degree → ML fundamentals → deep learning → portfolio of models → research or product teams",
    topEmployers: ["Google DeepMind", "Microsoft AI", "OpenAI", "Anthropic", "Indian AI startups"],
  },
  {
    title: "Content Creator / Writer",
    slug: "content-creator",
    tags: ["creative", "writing", "social", "media"],
    salaryRange: "₹2–25 LPA",
    demandLevel: "High",
    traits:   { analytical:0.4, creative:0.95, leadership:0.4, social:0.7, technical:0.3, structured:0.4, entrepreneurial:0.75, empathetic:0.75, communication:0.95, independence:0.7 },
    requiredSkills: ["Writing", "SEO", "Video Editing", "Social Media Strategy", "Storytelling"],
    description: "Create compelling content across blogs, YouTube, podcasts, or social media. Growing independent economy.",
    entryPath: "Start creating → build audience → monetise through brand deals, courses, or writing for publications",
    topEmployers: ["Self-employed", "media companies", "agencies", "in-house content teams"],
  },
  {
    title: "Cloud Solutions Architect",
    slug: "cloud-architect",
    tags: ["tech", "engineering", "cloud"],
    salaryRange: "₹12–70 LPA",
    demandLevel: "Very High",
    traits:   { analytical:0.9, creative:0.5, leadership:0.7, social:0.4, technical:0.95, structured:0.8, entrepreneurial:0.4, empathetic:0.2, communication:0.6, independence:0.6 },
    requiredSkills: ["AWS/Azure/GCP", "System Design", "Networking", "Security", "DevOps"],
    description: "Design scalable cloud infrastructure for enterprises. High pay, shortage of skilled professionals.",
    entryPath: "SWE experience → AWS Solutions Architect cert → Solutions Engineer → Architect",
    topEmployers: ["AWS", "Microsoft", "Google Cloud", "Accenture", "Deloitte", "TCS"],
  },
  {
    title: "Entrepreneur / Startup Founder",
    slug: "entrepreneur",
    tags: ["business", "startup", "leadership"],
    salaryRange: "Variable (₹0 to unlimited)",
    demandLevel: "Self-created",
    traits:   { analytical:0.7, creative:0.8, leadership:0.95, social:0.8, technical:0.5, structured:0.4, entrepreneurial:0.99, empathetic:0.6, communication:0.85, independence:0.9 },
    requiredSkills: ["Business Strategy", "Sales", "Product Thinking", "Fundraising", "Team Building"],
    description: "Build something from scratch. High risk, potentially very high reward. Requires resilience.",
    entryPath: "Any experience → identify problem → validate → build MVP → fundraise or bootstrap → scale",
    topEmployers: ["Self-employed", "your own company"],
  },
];

// ─── 3. TF-IDF Intent Classifier ─────────────────────────────────────────────
/**
 * Each intent has a set of terms with importance weights (IDF-inspired).
 * Score = sum(weight * occurrenceCount) for each term found in the query.
 */
const INTENT_MAP = {
  data_science:      { terms: { "data science":3, "data scientist":3, "machine learning":2, "ml":2, "kaggle":2, "analytics":1.5, "pandas":2, "numpy":2, "sklearn":2, "big data":2 }},
  software_eng:      { terms: { "software engineer":3, "software development":3, "coding":2, "programming":2, "developer":2, "backend":2, "frontend":2, "full stack":2, "web dev":2, "javascript":1.5, "python":1, "java":1.5, "app development":2 }},
  ux_design:         { terms: { "ux":3, "ui designer":3, "user experience":3, "product design":2, "figma":2, "wireframe":2, "prototype":2, "usability":2, "design career":2, "visual design":2 }},
  product_mgmt:      { terms: { "product manager":3, "product management":3, "pm role":3, "roadmap":2, "agile":1.5, "sprint":1.5, "product strategy":2, "prd":2, "product owner":2 }},
  cybersecurity:     { terms: { "cybersecurity":3, "cyber security":3, "ethical hacking":3, "penetration testing":3, "network security":2, "ceh":2, "cissp":2, "infosec":2, "hacker":2, "security analyst":2 }},
  ai_ml_eng:         { terms: { "ai engineer":3, "ml engineer":3, "artificial intelligence":2, "deep learning":2, "neural network":2, "tensorflow":2, "pytorch":2, "llm":2, "generative ai":2, "computer vision":2, "nlp":2 }},
  finance:           { terms: { "finance":2, "financial analyst":3, "investment":2, "cfa":3, "banking":2, "stock":1.5, "equity":2, "accounting":2, "ca ":2, "chartered accountant":3, "valuation":2 }},
  marketing:         { terms: { "marketing":2, "digital marketing":3, "seo":2, "content marketing":2, "social media":1.5, "brand":1.5, "growth hacking":2, "ads":1.5, "google ads":2 }},
  career_change:     { terms: { "career change":3, "career switch":3, "change career":3, "pivot":2, "transition":2, "switching field":3, "new career":2 }},
  salary:            { terms: { "salary":3, "pay":2, "earn":2, "income":2, "lpa":3, "ctc":3, "package":2, "how much":2, "compensation":2 }},
  skills_learning:   { terms: { "skill":2, "learn":2, "course":2, "certification":2, "training":2, "upskill":2, "bootcamp":2, "online course":2, "mooc":2, "udemy":2, "coursera":2 }},
  interview_job:     { terms: { "interview":3, "resume":2, "cv":2, "job search":2, "get hired":2, "job hunt":2, "leetcode":2, "placement":2, "crack interview":2 }},
  introvert_solo:    { terms: { "alone":3, "introvert":3, "independent":2, "prefer working alone":3, "solo":2, "no meetings":2, "quiet":1.5, "solitary":2, "remote":1.5, "work from home":1, "antisocial":2 }},
  recommendation:    { terms: { "what career":3, "career for me":3, "best career":3, "which career":3, "recommend":2, "suggest":2, "suited":2, "right career":3, "match":2, "what should i":2 }},
  compare:           { terms: { "compare":3, "vs":2, "versus":2, "difference between":3, "better":1.5, "or":0.5, "which is better":2 }},
};

/**
 * tokenize: lowercases and returns all n-grams (1 and 2) from the message.
 */
function tokenize(text) {
  const t = text.toLowerCase().trim();
  const words = t.split(/\s+/);
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) tokens.push(`${words[i]} ${words[i+1]}`);
  return tokens;
}

/**
 * classifyIntent: returns best matching intent and its score.
 */
function classifyIntent(message) {
  const tokens = tokenize(message);
  const scores = {};

  for (const [intent, { terms }] of Object.entries(INTENT_MAP)) {
    scores[intent] = 0;
    for (const token of tokens) {
      if (terms[token]) scores[intent] += terms[token];
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { intent: sorted[0][0], score: sorted[0][1], allScores: scores };
}

// ─── 4. Profile Analyser ──────────────────────────────────────────────────────
/**
 * Maps user profile (personality scores, skill scores) to the 10-dim trait vector.
 * Personality keys from app: openness, conscientiousness, extraversion, agreeableness, neuroticism
 * Skill keys: analytical, creative, social, leadership, etc.
 */
function buildUserVector(profile = {}) {
  const p = profile?.personality || {};
  const s = profile?.skills || {};

  // Normalise scores: assume scores are 0-100, convert to 0-1
  const n = (v, max = 100) => Math.max(0, Math.min(1, (v || 0) / max));

  return {
    analytical:     n((p.conscientiousness || 0) * 0.5 + (s.analytical || 0) * 0.5),
    creative:       n((p.openness || 0) * 0.7 + (s.creative || 0) * 0.3),
    leadership:     n((p.extraversion || 0) * 0.4 + (s.leadership || 0) * 0.6),
    social:         n((p.extraversion || 0) * 0.5 + (p.agreeableness || 0) * 0.3 + (s.social || 0) * 0.2),
    technical:      n((s.technical || 0) * 0.7 + (p.conscientiousness || 0) * 0.3),
    structured:     n((p.conscientiousness || 0) * 0.8 + (s.organised || 0) * 0.2),
    entrepreneurial:n((p.openness || 0) * 0.4 + (p.extraversion || 0) * 0.3 + (s.entrepreneurial || 0) * 0.3),
    empathetic:     n((p.agreeableness || 0) * 0.7 + (s.empathy || 0) * 0.3),
    communication:  n((p.extraversion || 0) * 0.5 + (s.communication || 0) * 0.5),
    independence:   n((1 - n(p.extraversion || 50)) * 0.4 + (p.conscientiousness || 0) * 0.3 + (s.independence || 0) * 0.3),
  };
}

/**
 * cosineSimilarity: measures alignment between two trait vectors.
 */
function cosineSimilarity(a, b) {
  const keys = Object.keys(a);
  const dot = keys.reduce((sum, k) => sum + (a[k] || 0) * (b[k] || 0), 0);
  const magA = Math.sqrt(keys.reduce((sum, k) => sum + (a[k] || 0) ** 2, 0));
  const magB = Math.sqrt(keys.reduce((sum, k) => sum + (b[k] || 0) ** 2, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/**
 * rankCareers: returns careers sorted by cosine similarity to user vector.
 */
function rankCareers(userVector, topN = 5) {
  return CAREER_KB
    .map(c => ({ ...c, similarity: cosineSimilarity(userVector, c.traits) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

/**
 * dominantTraits: returns top N traits from a vector.
 */
function dominantTraits(vector, n = 3) {
  return Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

// ─── 5. Profile-Aware Response Generator ─────────────────────────────────────

function generateRecommendation(profile) {
  const userVec = buildUserVector(profile);
  const topCareers = rankCareers(userVec, 5);
  const topTraits = dominantTraits(userVec, 3);

  const careerList = topCareers.map((c, i) => {
    const pct = Math.round(c.similarity * 100);
    const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    return `**${i + 1}. ${c.title}** (${pct}% match)\n${bar}\nSalary: ${c.salaryRange} | Demand: ${c.demandLevel}\n_${c.description}_`;
  }).join("\n\n");

  const traitDesc = topTraits.map(t => {
    const descs = {
      analytical: "strong analytical mindset", creative: "creative thinking",
      leadership: "natural leadership", social: "social and people skills",
      technical: "technical aptitude", structured: "structured and organised approach",
      entrepreneurial: "entrepreneurial drive", empathetic: "high empathy and emotional intelligence",
      communication: "excellent communication", independence: "preference for independent work",
    };
    return descs[t] || t;
  }).join(", ");

  return `## 🎯 Personalised Career Recommendations

Based on your profile, your standout qualities are **${traitDesc}**. Here are your top matches, ranked by alignment with your unique trait signature:

${careerList}

---
**How to use this**: Your top match isn't always the right choice — consider your interests and values too. Click any career in the app to explore it in detail, or ask me: _"Tell me more about [career name]"_.`;
}

function generateCareerDeepDive(careerTitle, profile) {
  const userVec = buildUserVector(profile);
  const career = CAREER_KB.find(c =>
    c.title.toLowerCase().includes(careerTitle.toLowerCase()) ||
    careerTitle.toLowerCase().includes(c.slug)
  ) || CAREER_KB[0];

  const sim = cosineSimilarity(userVec, career.traits);
  const matchPct = Math.round(sim * 100);
  const gapTraits = Object.entries(career.traits)
    .filter(([k]) => career.traits[k] > 0.7)
    .map(([k]) => ({ trait: k, required: career.traits[k], yours: userVec[k] || 0.3 }))
    .sort((a, b) => (b.required - b.yours) - (a.required - a.yours))
    .slice(0, 3);

  const gapSection = gapTraits.length
    ? gapTraits.map(g => `- **${g.trait}**: you're at ${Math.round(g.yours * 100)}%, role needs ~${Math.round(g.required * 100)}%`).join("\n")
    : "- Your profile aligns well with most requirements!";

  return `## ${career.title} — Deep Dive

**Your profile match: ${matchPct}%** ${"⭐".repeat(Math.round(matchPct / 20))}

### What they actually do
${career.description}

### Skills you'll need
${career.requiredSkills.map(s => `• ${s}`).join("\n")}

### Salary in India
${career.salaryRange} (varies by company, city, and specialisation)

### Market demand
${career.demandLevel} — ${career.demandLevel.includes("High") ? "strong hiring market, good long-term prospects." : "stable demand, less volatile."}

### How to get in
${career.entryPath}

### Where you'll work
${career.topEmployers.join(", ")}

### Your gap analysis
Based on your profile, here's where you may need to grow:
${gapSection}

Want to know how to close these gaps? Ask: _"How do I improve my ${gapTraits[0]?.trait || "technical"} skills for ${career.title}?"_`;
}

function generateIntentResponse(intent, message, profile) {
  const userVec = buildUserVector(profile);
  const topTraits = dominantTraits(userVec, 2);
  const userName = profile?.name ? `, ${profile.name.split(" ")[0]}` : "";

  const RESPONSES = {
    recommendation: () => generateRecommendation(profile),

    data_science: () => `## Breaking Into Data Science

${profile?.name ? `Hey ${profile.name.split(" ")[0]}! ` : ""}Given your profile, data science could be a ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="data-scientist").traits) * 100)}% match for you.

### The Reality-Checked Roadmap

**Phase 1 — Foundations (2–4 months)**
- Python: NumPy, pandas, Matplotlib, scikit-learn
- SQL: queries, joins, window functions, aggregations
- Statistics: probability, hypothesis testing, linear regression

**Phase 2 — Real Projects (2–3 months)**
- Kaggle: complete 5 competitions (start with Titanic, House Prices)
- Build an end-to-end project: data collection → cleaning → model → deployment
- Write about it on Medium or a blog (companies love this)

**Phase 3 — Specialise (ongoing)**
- Choose: NLP, Computer Vision, Time Series, or Business Analytics
- Learn one cloud platform (Google Colab → AWS SageMaker)

**Phase 4 — Job Hunt**
- Start with Data Analyst roles (lower bar, same foundations)
- Companies hiring juniors: Mu Sigma, Fractal, startups
- Salary expectation: ₹6–10 LPA fresher → ₹20–30 LPA with 3 years

**Best free resources**: fast.ai, StatQuest (YouTube), Kaggle Learn, CS50P (Harvard)

Your ${topTraits[0]} trait is a big asset here — data science rewards deep analytical thinkers!`,

    software_eng: () => `## Software Engineering Career Guide

**Your profile match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="software-engineer").traits) * 100)}% based on your trait profile.

### Choose Your Specialisation
| Track | Best For | Key Skills | Entry Salary |
|-------|----------|------------|--------------|
| Backend | Analytical, structured thinkers | Node/Python/Java, Databases, APIs | ₹5–9 LPA |
| Frontend | Creative + technical blend | React, CSS, UX sensitivity | ₹4–8 LPA |
| Full Stack | Versatile generalists | Both above | ₹6–12 LPA |
| Mobile | App-focused builders | React Native/Flutter | ₹5–10 LPA |
| DevOps/Cloud | Systems thinkers | AWS, Docker, Kubernetes | ₹7–15 LPA |

### The Learning Path
1. **Pick a language**: Python (versatile) or JavaScript (frontend-friendly)
2. **Learn DSA**: Arrays, trees, graphs, sorting — LeetCode 100 easy/medium problems
3. **Build 3 projects**: one CRUD app, one API, one "real problem solver"
4. **Git + GitHub**: everything goes here — it's your CV
5. **System Design basics**: load balancers, databases, caching, REST vs GraphQL

Your **${topTraits[0]}** trait suggests you'd excel most in ${topTraits[0] === "analytical" ? "backend or systems engineering" : topTraits[0] === "creative" ? "frontend or full-stack" : "DevOps or cloud architecture"}.`,

    ux_design: () => `## UX/UI Design Career Path

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="ux-designer").traits) * 100)}% — ${userVec.creative > 0.6 ? "your creative profile is a strong fit!" : "growth in creative thinking will help you thrive here."}

### What UX Designers Actually Do Daily
- Conduct user research (interviews, surveys, usability tests)
- Create wireframes and interactive prototypes in Figma
- Run design reviews and iterate based on feedback
- Collaborate with engineers to ensure correct implementation
- Measure design success through metrics (conversion, task completion)

### Your Toolkit (all free to start)
- **Figma** — industry standard, free for individuals
- **Maze** or **UsabilityHub** — remote user testing
- **Miro** — digital whiteboards for workshops
- **Notion** — documenting your research findings

### Building Your Portfolio (THE most important thing)
1. Pick 2–3 apps you find frustrating
2. Do a redesign: research → problem definition → wireframes → hi-fi prototype
3. Write case studies documenting YOUR PROCESS, not just the final design
4. A portfolio with 3 strong case studies beats 10 rushed ones

### Salary Ladder in India
- Junior Designer: ₹3–6 LPA
- Mid-Level: ₹8–18 LPA
- Senior: ₹18–40 LPA
- Design Lead: ₹35–60 LPA

Top companies hiring: Zomato, Swiggy, CRED, Razorpay, Meesho, Thoughtworks`,

    product_mgmt: () => `## Product Management Career Guide

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="product-manager").traits) * 100)}%
${userVec.leadership > 0.6 ? "✅ Your leadership score is a strong signal — PM is a great fit." : "Note: PM roles require significant leadership and communication development."}

### What PMs Do (the honest version)
- Say no to 90% of feature requests (diplomatically)
- Write specs that engineers actually understand
- Mediate between business wants and technical constraints
- Use data to make decisions when everyone has opinions
- Herd cats. Successfully.

### Getting Your First PM Role
**Coming from Engineering?** → Apply directly as Associate PM (APM)
**Coming from Design?** → Demonstrate business thinking + data skills
**Coming from Business/MBA?** → Get technical basics (SQL, basic APIs)
**Fresh graduate?** → APM programmes at Google, Microsoft, Flipkart, Meesho

### Essential Skills to Build
- SQL (you'll need this daily for data pulls)
- Figma (enough to communicate with designers)
- Prioritisation: RICE, ICE, Kano model frameworks
- Writing: crisp, clear, unambiguous PRDs

### Salary in India
- APM/Junior PM: ₹8–18 LPA
- PM: ₹18–35 LPA
- Senior PM: ₹35–60 LPA
- Director of Product: ₹60–1.2 Cr LPA

Best resource: "Inspired" by Marty Cagan + Reforge (if you can afford it)`,

    cybersecurity: () => `## Cybersecurity Career Path

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="cybersecurity-analyst").traits) * 100)}%
${userVec.analytical > 0.7 ? "Your analytical strength is your biggest asset in this field." : "Strong attention to detail is the core skill to develop here."}

### Specialisations (pick one to start)
- **SOC Analyst** — monitor and respond to threats (most accessible entry)
- **Penetration Tester / Ethical Hacker** — find vulnerabilities before attackers do
- **Security Engineer** — build secure systems and infrastructure
- **DFIR (Digital Forensics & Incident Response)** — investigate breaches

### The Certification Path
1. **CompTIA Security+** → entry-level, widely recognised
2. **CEH (Certified Ethical Hacker)** → practical offensive security
3. **OSCP** → gold standard for penetration testing
4. **CISSP** → senior/management level

### Hands-On Practice (free)
- **TryHackMe.com** — gamified, beginner-friendly
- **HackTheBox** — advanced challenges
- **CTF competitions** — team-based competitions, great for portfolio
- **OWASP** — web app security fundamentals (free resources)

### Salary in India
- Junior SOC Analyst: ₹4–8 LPA
- Security Analyst: ₹8–18 LPA
- Penetration Tester: ₹10–25 LPA
- CISO: ₹50–1.5 Cr LPA

India's cybersecurity talent shortage means salaries are rising fast.`,

    ai_ml_eng: () => `## AI/ML Engineering Career Guide

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="ai-ml-engineer").traits) * 100)}%
This is the highest-paying and fastest-growing field in tech right now.

### The Difference Between Roles
| Role | Focus | Salary |
|------|-------|--------|
| ML Engineer | Building & deploying models in production | ₹10–50 LPA |
| Research Scientist | Novel algorithm development | ₹15–80+ LPA |
| Data Scientist | Insight + modelling for business | ₹8–35 LPA |
| AI Product Engineer | LLMs, RAG, chatbots, AI features | ₹12–60 LPA |

### Learning Path (ML Engineer track)
1. **Mathematics**: Linear algebra, calculus, probability (3Blue1Brown YouTube)
2. **Python** at an expert level: decorators, generators, type hints
3. **Classical ML**: scikit-learn, all fundamental algorithms
4. **Deep Learning**: PyTorch (preferred over TF now), neural network architecture
5. **MLOps**: model serving (FastAPI), monitoring, versioning (MLflow), Docker
6. **LLMs** (2024 essential): fine-tuning, RAG, vector databases, LangChain

### Best Resources
- fast.ai (practical → theoretical approach)
- Andrej Karpathy's YouTube (neural networks from scratch)
- Hugging Face courses (free, state-of-art NLP)
- Stanford CS229 (Andrew Ng, free on YouTube)

Your ${topTraits.includes("analytical") ? "analytical" : "technical"} traits align perfectly with this field. The math will feel natural to you.`,

    salary: () => {
      const topCareer = rankCareers(userVec, 1)[0];
      return `## Salary Guide for Indian Professionals (2024)

**Based on your profile, ${topCareer.title} is your strongest match** — here's where you stand:

### Your Top Career Match: ${topCareer.title}
**Salary Range**: ${topCareer.salaryRange}

### Comprehensive Salary Table
| Career | Fresher | Mid (3–5 yr) | Senior (7+ yr) |
|--------|---------|--------------|----------------|
| AI/ML Engineer | ₹8–15 LPA | ₹20–45 LPA | ₹45–80+ LPA |
| Software Engineer | ₹4–8 LPA | ₹12–25 LPA | ₹25–60 LPA |
| Data Scientist | ₹6–10 LPA | ₹15–30 LPA | ₹30–60 LPA |
| Cloud Architect | ₹8–14 LPA | ₹20–40 LPA | ₹40–70 LPA |
| Product Manager | ₹8–15 LPA | ₹18–35 LPA | ₹35–80 LPA |
| Cybersecurity | ₹5–9 LPA | ₹12–25 LPA | ₹25–50 LPA |
| UX Designer | ₹3–6 LPA | ₹8–18 LPA | ₹18–40 LPA |
| Financial Analyst | ₹4–7 LPA | ₹10–22 LPA | ₹20–50 LPA |
| Digital Marketer | ₹3–6 LPA | ₹8–15 LPA | ₹15–30 LPA |

### What Moves Your Salary Up
- **FAANG/top startup** → 2–3x above average
- **Location**: Bangalore > Mumbai > Delhi/NCR for tech
- **Niche expertise**: LLMs, Kubernetes, fintech domain → 30–50% premium
- **Negotiation**: Most people leave 10–20% on the table by not negotiating

Tip: Use Glassdoor, Levels.fyi, and LinkedIn Salary Insights to benchmark.`;
    },

    skills_learning: () => {
      const topCareer = rankCareers(userVec, 1)[0];
      return `## Skills Roadmap — Personalised for Your Profile

**Your top career match**: ${topCareer.title}
**Skills it requires**: ${topCareer.requiredSkills.join(", ")}

### High-ROI Skills to Learn Right Now
${topCareer.requiredSkills.map((s, i) => `${i + 1}. **${s}** — ${["Core requirement", "Differentiator", "High demand add-on", "Leadership multiplier", "Future-proof skill"][i] || "Key skill"}`).join("\n")}

### Learning Strategy (evidence-backed)
1. **Active recall > passive watching**: Do exercises, not just tutorials
2. **Build something**: Every concept you learn → small project
3. **Teach it**: Write about it (blog, LinkedIn) — forces real understanding
4. **80/20 rule**: 20% of skills → 80% of job offers. Focus there first.

### Best Platforms by Skill Type
| Skill Type | Best Resource | Cost |
|------------|---------------|------|
| Programming | freeCodeCamp, CS50 | Free |
| ML/AI | fast.ai, Kaggle Learn | Free |
| Cloud | AWS/GCP free tier + docs | Free |
| Design | Figma Academy, Dribbble | Free |
| Data | Mode Analytics SQL tutorial | Free |
| Finance | CFA Institute materials | Paid |

**Your ${topTraits[0]} trait means you learn best through**: ${topTraits[0] === "analytical" ? "structured courses with clear frameworks" : topTraits[0] === "creative" ? "project-based, exploratory learning" : "mentorship and collaborative learning environments"}.`;
    },

    interview_job: () => `## Job Search & Interview Prep Guide

**Profile insight**: Your ${topTraits[0]} and ${topTraits[1]} traits suggest you'll interview best when ${
  topTraits[0] === "analytical" ? "showing structured problem-solving with data" :
  topTraits[0] === "creative" ? "sharing stories of innovative thinking" :
  "demonstrating leadership and team impact"
}.

### Resume Tips (ATS-first)
- **Format**: Simple, clean, single column. No tables, charts, or columns.
- **Each bullet = Impact**: "Reduced API latency by 40% using Redis caching" > "Worked on backend"
- **Keywords**: Mirror language from job descriptions
- **1 page** if < 5 years experience, 2 pages max otherwise
- **GitHub link**: Essential for tech roles

### Interview Types & How to Ace Them
**Technical Interviews (SWE)**
- LeetCode: 50 easy + 100 medium minimum
- System design: Watch "Gaurav Sen" on YouTube
- Practise explaining your thought process out loud

**Behavioural Interviews (ALL roles)**
- STAR method: Situation → Task → Action → Result
- Prepare 6 stories that cover: leadership, conflict, failure, achievement, teamwork, initiative
- Each story should work for multiple questions

**Case Interviews (Consulting/PM)**
- Framework: Clarify → Structure → Analyse → Recommend
- Practice on PrepLounge or Case in Point book

### Job Search Strategy
- 5 quality applications > 50 spray & pray
- **Referrals** fill 40% of jobs — LinkedIn outreach works
- Set up job alerts: LinkedIn, Naukri, Instahyre, AngelList
- Track everything in a spreadsheet: company, role, stage, next action

**Timeline**: Most job searches take 6–16 weeks. Start before you're desperate.`,

    introvert_solo: () => {
      const soloFriendlyCareers = rankCareers(userVec, 5).filter(c => c.traits.independence > 0.6);
      const careerList = soloFriendlyCareers.map(c =>
        `- **${c.title}** (${Math.round(c.similarity * 100)}% match) — ${c.description}`
      ).join("\n");
      return `## Careers for Independent Thinkers & Introverts

Your preference for independent work is a strength, not a limitation. Many of the highest-paying careers are ideal for people who work best solo.

### Your Best-Fit Careers (independence-weighted)
${careerList}

### Why Introverts Excel in These Fields
- **Deep focus**: Solo technical work rewards sustained concentration
- **Analytical thinking**: Less social noise = more mental bandwidth for complex problems
- **Written communication**: Introverts often excel at clear, precise writing
- **Research**: Prefer depth over breadth — perfect for specialised roles

### Practical Tips for Your Job Search
- **Remote-first companies**: Gitlab, Automattic, Zapier, distributed teams at larger firms
- **Async communication**: Look for companies with strong writing culture
- **Avoid**: High-pressure sales, event management, customer-facing service roles (unless you want to stretch)
- **Leverage**: Your depth of expertise — become THE expert in a niche

### Interview Hack for Introverts
- Do mock interviews in writing first — then practice speaking
- Request written case studies or take-home assignments when possible
- Many companies offer asynchronous interview steps (record a video response)

You don't need to become an extrovert. You need to find an environment that values what you already are.`;
    },

    career_change: () => `## Career Change Strategy Guide

Career switching in your 20s-30s is not only normal — it's often the smartest move.

### The 4-Step Framework
**Step 1: Transferable Skill Audit**
List everything you're already good at:
- Hard skills: tools, technical knowledge, processes
- Soft skills: communication, analysis, leadership, organisation
- Domain knowledge: your current industry's problems and language

**Step 2: Identify the Gap** (based on your profile)
Your dominant traits — ${topTraits.join(", ")} — make you a natural fit for:
${rankCareers(userVec, 3).map(c => `• ${c.title} (${Math.round(c.similarity * 100)}% profile match)`).join("\n")}

**Step 3: Bridge the Gap**
- Don't quit your job yet — learn evenings and weekends first
- Build 2–3 portfolio projects in the target field
- Aim for adjacent roles (e.g., Marketing → Growth PM → Product Manager)
- Timeline: 6–18 months of committed effort

**Step 4: Network Into the Role**
- LinkedIn: connect with 20 people in your target role
- Ask: "I'm transitioning into [field]. Can I have 15 minutes to learn about your experience?"
- Most people say yes. This converts to referrals.

### What NOT to Do
- ❌ Quit before you have savings for 6+ months
- ❌ Get a degree when a portfolio will do
- ❌ Underestimate the learning curve — it takes longer than you think
- ❌ Target only top companies at first — build experience anywhere

Tell me what field you're moving from and to — I'll make this more specific!`,

    compare: () => {
      const topTwo = rankCareers(userVec, 2);
      return `## Career Comparison

Based on your profile, here are your top two matches compared:

### ${topTwo[0].title} vs ${topTwo[1].title}

| Dimension | ${topTwo[0].title} | ${topTwo[1].title} |
|-----------|${"─".repeat(topTwo[0].title.length)}|${"─".repeat(topTwo[1].title.length)}|
| Profile Match | ${Math.round(topTwo[0].similarity * 100)}% | ${Math.round(topTwo[1].similarity * 100)}% |
| Salary Range | ${topTwo[0].salaryRange} | ${topTwo[1].salaryRange} |
| Demand Level | ${topTwo[0].demandLevel} | ${topTwo[1].demandLevel} |
| Key Skills | ${topTwo[0].requiredSkills.slice(0,2).join(", ")} | ${topTwo[1].requiredSkills.slice(0,2).join(", ")} |

### Verdict Based on Your Traits
Your **${topTraits[0]}** dominance gives you an edge in **${topTwo[0].title}**.
Your **${topTraits[1]}** score also supports **${topTwo[1].title}** as a viable path.

**Choose ${topTwo[0].title} if**: You want to optimise for your natural strengths.
**Choose ${topTwo[1].title} if**: You want to develop a complementary skillset.

Tell me the two specific careers you want to compare and I'll give you a detailed side-by-side breakdown!`;
    },

    finance: () => `## Finance Career Guide

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="financial-analyst").traits) * 100)}%
Finance rewards structured, analytical thinkers with an eye for detail — ${userVec.analytical > 0.6 ? "which fits your profile well." : "a trait you'll need to develop."}

### Finance Career Tracks
| Track | Entry | Peak | Required |
|-------|-------|------|----------|
| Investment Banking | ₹6–10 LPA | ₹1–5 Cr LPA | IIM/IIT or CA |
| Equity Research | ₹5–8 LPA | ₹30–80 LPA | CFA helpful |
| Consulting (Finance) | ₹8–15 LPA | ₹60–200 LPA | Top MBA |
| Corporate Finance | ₹4–7 LPA | ₹25–60 LPA | CA or MBA |
| FinTech PM/Analyst | ₹8–18 LPA | ₹40–80 LPA | Tech + Finance |

### Key Certifications (prioritised)
1. **CA** — gold standard in India, brutal but opens every door
2. **CFA** — globally recognised for investment roles
3. **CPA** — if you want international accounting
4. **FRM** — risk management specialisation

### The 2024 Edge: Finance + Tech
FinTech is the fastest growing segment. SQL + Python + Finance domain = premium salary.`,

    marketing: () => `## Digital Marketing Career Path

**Your match**: ${Math.round(cosineSimilarity(userVec, CAREER_KB.find(c=>c.slug==="digital-marketer").traits) * 100)}%
${userVec.creative > 0.6 && userVec.communication > 0.6 ? "Your creative and communication strengths make you a natural marketer." : "Marketing blends creativity with data — a unique combination."}

### Digital Marketing Specialisations
- **SEO/Content**: Long-term brand building, writing + analytics
- **Paid Media (PPC)**: Google/Meta ads, data-driven, fast feedback
- **Social Media**: Brand voice, community, viral growth
- **Email Marketing**: Automation, copywriting, retention
- **Growth Hacking**: Cross-channel experiments, startup-favoured

### Certifications That Actually Help
- Google Analytics 4 (GA4) — free, essential
- Google Ads certifications — free, recognised by employers
- HubSpot Content Marketing — free, well-regarded
- Meta Blueprint — free for Facebook/Instagram ads

### The Portfolio Approach
- Run your own social media or blog (prove you can grow an audience)
- Volunteer to manage marketing for a local business or NGO
- Document all experiments with data: "Grew Instagram from 200 → 2,000 followers in 3 months using [strategy]"

Starting salary: ₹3–5 LPA fresher. With 2–3 years and strong portfolio: ₹10–20 LPA.`,
  };

  const handler = RESPONSES[intent];
  if (handler) return handler();

  // Default: profile-based recommendation
  return generateRecommendation(profile);
}

// ─── 6. Main Response Engine ──────────────────────────────────────────────────
function mlEngine(message, profile) {
  const { intent, score, allScores } = classifyIntent(message);
  const lowerMsg = message.toLowerCase();

  // Check if user is asking about a specific career by name
  const mentionedCareer = CAREER_KB.find(c =>
    lowerMsg.includes(c.title.toLowerCase()) ||
    lowerMsg.includes(c.slug.replace(/-/g, " "))
  );

  // If asking for deep dive on a specific career with low intent score
  if (mentionedCareer && score < 2) {
    return generateCareerDeepDive(mentionedCareer.title, profile);
  }

  // If asking to compare two specific careers
  if (intent === "compare" && mentionedCareer) {
    return generateCareerDeepDive(mentionedCareer.title, profile);
  }

  // Minimum score threshold for confident intent matching
  if (score >= 1) {
    return generateIntentResponse(intent, message, profile);
  }

  // Low-confidence fallback: show personalised recommendations
  const userVec = buildUserVector(profile);
  const top = rankCareers(userVec, 1)[0];
  return `I want to make sure I give you the most helpful answer! Could you be a bit more specific about what you're looking for?

Based on your profile, your top career match is **${top.title}** (${Math.round(top.similarity * 100)}% match). Here are some things I can help you with:

- 🎯 **"What career suits me?"** — personalised ML-powered recommendations
- 📊 **"What does a data scientist earn?"** — salary breakdowns
- 🔄 **"How do I break into [career]?"** — step-by-step roadmaps
- ⚖️ **"Compare software engineer vs product manager"** — side-by-side analysis
- 📚 **"What skills should I build?"** — personalised learning plan
- 🚀 **"How do I prepare for interviews?"** — proven strategies

What would you like to explore?`;
}

// ─── 7. Route Handlers ────────────────────────────────────────────────────────

// POST /api/ai/chat — main chatbot
router.post("/chat", async (req, res) => {
  const { message, profile, tests } = req.body;
  if (!message) return res.status(400).json({ content: "Message is required." });

  // Merge tests into profile for richer context
  const enrichedProfile = {
    ...profile,
    skills: { ...(profile?.skills || {}), ...(tests || {}) },
  };

  // 1. Try OpenAI
  if (openai) {
    try {
      const userVec = buildUserVector(enrichedProfile);
      const topCareers = rankCareers(userVec, 3).map(c => `${c.title} (${Math.round(c.similarity * 100)}% match)`).join(", ");
      const { intent } = classifyIntent(message);

      const systemPrompt = `You are CareerIQ, an expert AI career advisor for Indian students and professionals.

USER CONTEXT (from ML profile analysis):
- Detected intent: ${intent}
- Top career matches: ${topCareers}
- Dominant traits: ${dominantTraits(userVec, 3).join(", ")}
- Profile: ${JSON.stringify(enrichedProfile)}

INSTRUCTIONS:
- Give specific, actionable advice tailored to the user's detected traits and career matches
- Use markdown formatting with headers (##), bullet points, and tables where helpful
- Include Indian salary ranges (LPA), Indian companies, and India-specific career context
- Keep responses under 500 words
- If recommending careers, refer to their ML-calculated matches above
- Be encouraging but realistic`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 700,
        temperature: 0.7,
      });
      return res.json({ content: completion.choices[0].message.content, source: "openai" });
    } catch (err) {
      console.error("OpenAI /chat error:", err.message, "→ switching to ML engine");
    }
  }

  // 2. ML Engine fallback (always works)
  const response = mlEngine(message, enrichedProfile);
  res.json({ content: response, source: "ml-engine" });
});

// POST /api/ai/explain — match explanation
router.post("/explain", async (req, res) => {
  const { career, userProfile, scores } = req.body;
  const enrichedProfile = userProfile || {};

  if (openai) {
    try {
      const userVec = buildUserVector(enrichedProfile);
      const careerVec = CAREER_KB.find(c => c.title.toLowerCase() === career?.title?.toLowerCase())?.traits || {};
      const similarity = cosineSimilarity(userVec, careerVec);

      const prompt = `Explain in 3–4 flowing sentences why this user is a ${scores?.final ?? Math.round(similarity * 100)}% match for ${career?.title}. 
Personality match: ${scores?.personality}%, Skill match: ${scores?.skills}%, Lifestyle match: ${scores?.lifestyle}%.
Career traits needed: ${JSON.stringify(careerVec)}
User traits: ${JSON.stringify(userVec)}
Be specific, personal, and encouraging. No bullet points.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
      });
      return res.json({ explanation: completion.choices[0].message.content });
    } catch (err) {
      console.error("OpenAI /explain error:", err.message);
    }
  }

  // ML fallback explanation
  const userVec = buildUserVector(enrichedProfile);
  const careerData = CAREER_KB.find(c => c.title.toLowerCase().includes((career?.title || "").toLowerCase()));
  const sim = careerData ? cosineSimilarity(userVec, careerData.traits) : 0.5;
  const matchPct = scores?.final ?? Math.round(sim * 100);
  const topTrait = dominantTraits(userVec, 1)[0] || "analytical thinking";
  const traitMap = { analytical: "analytical mindset", creative: "creative thinking", leadership: "leadership potential", social: "interpersonal skills", technical: "technical aptitude", structured: "organised approach", entrepreneurial: "entrepreneurial drive", empathetic: "empathy and emotional intelligence", communication: "communication skills", independence: "independent work style" };

  const explanation = matchPct >= 75
    ? `Your profile is a strong ${matchPct}% match for ${career?.title ?? "this career"}. Your ${traitMap[topTrait] || topTrait} directly aligns with what this role demands day-to-day. The combination of your personality traits and skills creates a natural fit that suggests you'd not just enter this field, but thrive in it. This is one of your top recommended paths — consider taking concrete next steps like building relevant projects or connecting with professionals in this space.`
    : matchPct >= 50
    ? `You show a solid ${matchPct}% alignment with ${career?.title ?? "this career"}, with your ${traitMap[topTrait] || topTrait} being a genuine strength. While there are growth areas to develop, your core traits provide a strong foundation. With targeted skill-building over 6–12 months, this path becomes increasingly viable. Many successful professionals in this field had similar starting profiles.`
    : `You have a ${matchPct}% match with ${career?.title ?? "this career"}, meaning there's meaningful alignment in some areas — particularly your ${traitMap[topTrait] || topTrait}. However, this career requires significant development of skills and traits that aren't yet dominant in your profile. It's entirely achievable if you're passionate about it, but expect a longer runway and more deliberate preparation compared to your higher-matched careers.`;

  res.json({ explanation });
});

// POST /api/ai/strengths — strength & growth analysis
router.post("/strengths", async (req, res) => {
  const { personality, skills } = req.body;
  const profile = { personality, skills };
  const userVec = buildUserVector(profile);
  const topTraits = dominantTraits(userVec, 3);
  const bottomTraits = Object.entries(userVec).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => k);
  const topCareers = rankCareers(userVec, 3);

  if (openai) {
    try {
      const prompt = `Analyse this person's career assessment and provide a personalised strength & growth report.
ML-calculated trait vector: ${JSON.stringify(userVec)}
Top career matches: ${topCareers.map(c => c.title).join(", ")}
Dominant traits: ${topTraits.join(", ")}
Growth areas: ${bottomTraits.join(", ")}

Provide:
## TOP STRENGTHS
2–3 specific strengths with concrete career implications.
## GROWTH AREAS  
2–3 areas to develop with specific actions.
## CAREER DIRECTION
1–2 sentences on work type they'll thrive in.

Be specific, reference their actual scores, keep it under 300 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      });
      return res.json({ analysis: completion.choices[0].message.content });
    } catch (err) {
      console.error("OpenAI /strengths error:", err.message);
    }
  }

  // ML fallback
  const traitDesc = { analytical: "analytical thinking", creative: "creative innovation", leadership: "leadership", social: "interpersonal connection", technical: "technical problem-solving", structured: "structure and organisation", entrepreneurial: "entrepreneurial thinking", empathetic: "empathy", communication: "communication", independence: "autonomous work" };
  const analysis = `## TOP STRENGTHS
Your profile shows notable strength in **${traitDesc[topTraits[0]] || topTraits[0]}** (${Math.round(userVec[topTraits[0]] * 100)}/100), **${traitDesc[topTraits[1]] || topTraits[1]}** (${Math.round(userVec[topTraits[1]] * 100)}/100), and **${traitDesc[topTraits[2]] || topTraits[2]}** (${Math.round(userVec[topTraits[2]] * 100)}/100). These are directly valued in your top career matches: ${topCareers.slice(0,2).map(c=>c.title).join(" and ")}.

## GROWTH AREAS
Consider developing **${traitDesc[bottomTraits[0]] || bottomTraits[0]}** and **${traitDesc[bottomTraits[1]] || bottomTraits[1]}** — strengthening these will open a wider range of career paths and accelerate progression into senior roles. Practical steps: seek out projects requiring these skills, take on stretch assignments, or find a mentor in these areas.

## CAREER DIRECTION
Based on your trait profile, you are likely to thrive in **${topCareers[0].title}** or similar roles that reward ${topTraits.slice(0,2).map(t => traitDesc[t]).join(" and ")}. Your profile is ${Math.round(topCareers[0].similarity * 100)}% aligned with your top career match, suggesting a natural fit that typically leads to strong job satisfaction and performance.`;

  res.json({ analysis });
});

// POST /api/ai/gap — gap analysis
router.post("/gap", async (req, res) => {
  const { targetCareer, userProfile } = req.body;
  const userVec = buildUserVector(userProfile);
  const careerData = CAREER_KB.find(c =>
    c.title.toLowerCase().includes((targetCareer?.title || "").toLowerCase()) ||
    (targetCareer?.slug && c.slug === targetCareer.slug)
  );

  if (openai) {
    try {
      const sim = careerData ? cosineSimilarity(userVec, careerData.traits) : 0.5;
      const prompt = `Gap analysis for user targeting ${targetCareer?.title}.
User trait vector (ML-computed): ${JSON.stringify(userVec)}
Career trait requirements: ${JSON.stringify(careerData?.traits || targetCareer?.requiredTraits || {})}
Current cosine similarity: ${Math.round(sim * 100)}%

Provide:
1. CURRENT READINESS: X% with 1-line explanation
2. KEY GAPS: 2–3 specific trait/skill gaps with numbers
3. ACTION PLAN: Concrete steps, resources, timeline
Under 250 words. Be specific and practical.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 350,
      });
      return res.json({ gap: completion.choices[0].message.content });
    } catch (err) {
      console.error("OpenAI /gap error:", err.message);
    }
  }

  // ML fallback gap analysis
  const sim = careerData ? cosineSimilarity(userVec, careerData.traits) : 0.45;
  const readinessPct = Math.round(sim * 100);
  const title = targetCareer?.title ?? "this career";
  const gaps = careerData
    ? Object.entries(careerData.traits)
        .filter(([k, v]) => v > 0.7)
        .map(([k]) => ({ trait: k, required: careerData.traits[k], yours: userVec[k] || 0.3, gap: careerData.traits[k] - (userVec[k] || 0.3) }))
        .filter(g => g.gap > 0.1)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3)
    : [];

  const gapText = gaps.length
    ? gaps.map(g => `- **${g.trait}**: you're at ${Math.round(g.yours * 100)}, role needs ~${Math.round(g.required * 100)} (gap: ${Math.round(g.gap * 100)} points)`).join("\n")
    : "- Your profile aligns reasonably well — focus on domain-specific skills.";

  res.json({
    gap: `**CURRENT READINESS: ${readinessPct}%** — ${readinessPct >= 70 ? "Strong foundation, ready to apply with some preparation." : readinessPct >= 50 ? "Solid base, focused skill-building needed over 6–12 months." : "Significant development needed, but achievable with commitment."}

**KEY GAPS**
${gapText}

**ACTION PLAN**
1. Prioritise closing your biggest gap: invest 30–60 mins daily using free resources (Coursera, YouTube, fast.ai)
2. Build 2 portfolio projects demonstrating the skills required for ${title}
3. Connect with 5 professionals in this role on LinkedIn — ask about their biggest day-to-day challenges
4. Apply for internships or junior roles in 3–4 months to gain real-world exposure
5. Re-take the CareerIQ assessment after 3 months to track growth`
  });
});

export default router;

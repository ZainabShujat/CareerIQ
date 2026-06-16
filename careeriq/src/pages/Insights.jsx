// src/pages/Insights.jsx — Proper scoring: Personality(40%) + Skills(40%) + Lifestyle(20%)
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";
import { AuthContext } from "../contexts/AuthContext";
import Header from "../components/Header";
import { 
  Brain, Star, TrendingUp, AlertCircle, Award, Compass, 
  Map, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, 
  ListTodo, Layers, Landmark, ShieldCheck, UserCheck 
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

// ── Scoring helpers ───────────────────────────────────────────────────────────

function computeWeightedMatch(userVals, careerReqs) {
  const keys = Object.keys(careerReqs || {});
  if (!keys.length) return 50;

  let weightedSumSqDiff = 0;
  let sumWeights = 0;

  keys.forEach(k => {
    const u = userVals[k] ?? 50;
    const c = careerReqs[k] ?? 50;
    const w = 1.0 + (c / 100.0);

    let diff = 0;
    if (u < c) {
      diff = c - u;
    }

    weightedSumSqDiff += w * (diff * diff);
    sumWeights += w;
  });

  if (sumWeights === 0) return 100;

  let maxSqDiff = 0;
  keys.forEach(k => {
    const c = careerReqs[k] ?? 50;
    const w = 1.0 + (c / 100.0);
    maxSqDiff += w * (c * c);
  });

  if (maxSqDiff === 0) return 100;

  const ratio = Math.sqrt(weightedSumSqDiff / maxSqDiff);
  return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)));
}

function getDemographicBias(career, userProfile) {
  if (!userProfile) return 0;
  const profileText = [
    userProfile.headline,
    userProfile.education,
    userProfile.about
  ].filter(Boolean).join(" ").toLowerCase();

  if (!profileText) return 0;

  const tags = (career.tags || []).map(t => t.toLowerCase());
  const title = (career.title || "").toLowerCase();

  let bias = 0;

  if (profileText.match(/(computer|software|developer|code|programming|tech|it|ai|machine learning)/)) {
    if (tags.some(t => ["software", "engineering", "infrastructure", "ai", "data"].includes(t)) || title.includes("software") || title.includes("developer") || title.includes("data")) {
      bias += 10;
    }
  }

  if (profileText.match(/(medical|doctor|health|clinical|nurse|pharma|bio|hospital)/)) {
    if (tags.some(t => ["medical", "healthcare", "care", "pharmacy"].includes(t)) || title.includes("doctor") || title.includes("nurse")) {
      bias += 10;
    }
  }

  if (profileText.match(/(business|finance|management|mba|economics|consulting|marketing|sales)/)) {
    if (tags.some(t => ["business", "management", "finance", "marketing", "operations"].includes(t)) || title.includes("manager") || title.includes("analyst") || title.includes("consultant")) {
      bias += 10;
    }
  }

  if (profileText.match(/(design|ux|ui|creative|art|media|graphics|animation|writer)/)) {
    if (tags.some(t => ["design", "ux", "creative", "media"].includes(t)) || title.includes("designer") || title.includes("writer")) {
      bias += 10;
    }
  }

  return bias;
}

function getCareerCluster(career) {
  const tags = (career.tags || []).map(t => t.toLowerCase());
  const title = (career.title || "").toLowerCase();
  
  if (tags.some(t => ["software", "engineering", "infrastructure", "ai", "ml", "cloud", "robotics", "hardware", "mobile", "security", "qa", "devops"].includes(t)) || title.includes("developer") || title.includes("engineer") || title.includes("programmer")) {
    return "technology";
  }
  if (tags.some(t => ["medical", "healthcare", "clinical", "pharmacy", "care", "bio", "wellness"].includes(t)) || title.includes("doctor") || title.includes("nurse") || title.includes("dentist") || title.includes("therapist")) {
    return "healthcare";
  }
  if (tags.some(t => ["design", "ux", "ui", "creative", "media", "writing", "art", "content", "copywriter"].includes(t)) || title.includes("designer") || title.includes("writer") || title.includes("artist") || title.includes("animator") || title.includes("illustrator")) {
    return "creative";
  }
  if (tags.some(t => ["marketing", "sales", "branding", "advertising", "growth"].includes(t)) || title.includes("marketing") || title.includes("sales")) {
    return "marketing";
  }
  if (tags.some(t => ["research", "data", "economics", "analytics"].includes(t)) || title.includes("analyst") || title.includes("scientist") || title.includes("researcher")) {
    return "research";
  }
  if (tags.some(t => ["education", "teaching", "ngo", "social", "development", "training"].includes(t)) || title.includes("teacher") || title.includes("instructor") || title.includes("trainer") || title.includes("educator")) {
    return "education";
  }
  if (tags.some(t => ["legal", "law", "compliance", "policy", "governance", "admin"].includes(t)) || title.includes("lawyer") || title.includes("attorney") || title.includes("legal") || title.includes("judge")) {
    return "law";
  }
  if (tags.some(t => ["business", "management", "strategy", "operations", "consulting", "finance"].includes(t)) || title.includes("manager") || title.includes("consultant") || title.includes("finance") || title.includes("accountant")) {
    return "business";
  }
  return "business"; // fallback
}

function computeCareerScore(career, personality, skillScores, happiness, userProfile, orientation) {
  const personalityScore = personality?.scores
    ? computeWeightedMatch(personality.scores, career.requiredTraits || {})
    : 50;

  const skillScore = skillScores
    ? computeWeightedMatch(skillScores, career.requiredSkills || {})
    : 50;

  let lifestyleScore = 50;
  if (happiness && career.lifestyleProfile) {
    const lp = career.lifestyleProfile;
    const userLifestyle = {
      stressLevel: 100 - (happiness.stressTolerance ?? 50),
      salaryPotential: happiness.salaryPriority ?? 50,
      workLifeBalance: happiness.workLifeBalance ?? 50,
      jobSecurity: happiness.jobSecurity ?? 55,
      remoteWork: happiness.remoteWork ?? 50,
      leadershipOpportunity: happiness.leadershipAmbition ?? 50,
    };
    lifestyleScore = computeWeightedMatch(userLifestyle, lp);
  }

  const orientationScore = orientation ? (orientation[getCareerCluster(career)] ?? 50) : 50;

  const bias = getDemographicBias(career, userProfile);
  // Formula: (Personality × 30%) + (Skills × 30%) + (Lifestyle × 15%) + (Career Orientation × 25%)
  const finalScore = Math.min(100, Math.round(
    personalityScore * 0.30 +
    skillScore * 0.30 +
    lifestyleScore * 0.15 +
    orientationScore * 0.25 +
    bias
  ));
  return { finalScore, personalityScore, skillScore, lifestyleScore, orientationScore };
}

// ── Profile-Aware Helper Functions ───────────────────────────────────────────

const getArchetype = (scores) => {
  if (!scores) return { name: "The Explorer", icon: Compass, desc: "You are driven by discovery, questioning, and learning. You thrive in open-ended environments that reward investigation." };
  
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const topTrait = sorted[0][0];
  
  const archetypes = {
    curiosity: { name: "The Explorer", icon: Compass, desc: "Driven by discovery, questioning, and learning. You thrive in environments requiring continuous exploration and intellectual challenge." },
    creativity: { name: "The Innovator", icon: Brain, desc: "You see the world as a canvas for original solutions. You excel at turning abstract concepts into practical, creative designs or ideas." },
    structure: { name: "The Planner", icon: Landmark, desc: "Organised, methodological, and systematic. You thrive when building frameworks, schedules, and bringing order to complex situations." },
    leadership: { name: "The Director", icon: Star, desc: "A natural navigator who steps up to guide teams. You excel at decision-making, setting goals, and motivating others under pressure." },
    social: { name: "The Counselor", icon: UserCheck, desc: "Highly empathetic and collaborative. Your primary drive is to support, build relationships, and help others grow." },
    independence: { name: "The Soloist", icon: Compass, desc: "Autonomous and self-reliant. You do your best work set at your own pace, with minimal supervision and maximum creative control." },
    riskTolerance: { name: "The Pioneer", icon: TrendingUp, desc: "Comfortable with uncertainty and rapid changes. You love starting new initiatives and taking bold, calculated leaps." },
    collaboration: { name: "The Team Player", icon: Award, desc: "A cooperative facilitator who believes the best results come from unified teams. You bridge gaps and synthesize viewpoints." },
    analytical: { name: "The Strategist", icon: Map, desc: "Logical, objective, and data-driven. You solve problems by breaking them down into fundamental facts and analyzing evidence." }
  };
  return archetypes[topTrait] || archetypes.curiosity;
};

const getTopCareerFamilies = (rankedCareers) => {
  if (!rankedCareers || rankedCareers.length === 0) return [];
  const families = {};
  
  rankedCareers.forEach(r => {
    const tag = r.career.tags?.[0] || "general";
    const cleanTag = tag.toLowerCase();
    
    let family = "Technology";
    if (["software", "engineering", "tech", "infrastructure", "ai", "ml", "cloud", "robotics", "hardware", "mobile"].includes(cleanTag)) {
      family = "Technology & Data";
    } else if (["medical", "healthcare", "public-health", "pharmacy", "care", "lab", "bio"].includes(cleanTag)) {
      family = "Healthcare & Medicine";
    } else if (["culinary", "hospitality"].includes(cleanTag)) {
      family = "Culinary & Hospitality";
    } else if (["design", "creative", "media", "writing", "content", "art"].includes(cleanTag)) {
      family = "Design & Creative Arts";
    } else if (["teaching", "education"].includes(cleanTag)) {
      family = "Education & Training";
    } else if (["legal", "compliance"].includes(cleanTag)) {
      family = "Legal Services";
    } else if (["finance", "business", "management", "marketing", "sales", "consulting"].includes(cleanTag)) {
      family = "Business & Strategy";
    } else if (["logistics", "operations", "ops"].includes(cleanTag)) {
      family = "Operations & Logistics";
    } else if (["science", "environment", "research"].includes(cleanTag)) {
      family = "Scientific Research";
    } else {
      family = "Specialized Vocations";
    }

    if (!families[family]) {
      families[family] = { name: family, total: 0, count: 0 };
    }
    families[family].total += r.finalScore;
    families[family].count += 1;
  });

  return Object.values(families)
    .map(f => ({ name: f.name, avgScore: Math.round(f.total / f.count) }))
    .sort((a,b) => b.avgScore - a.avgScore)
    .slice(0, 3);
};

const getWhyItFits = (c, userPersonality, userSkills, userHappiness) => {
  const points = [];
  const traits = c.requiredTraits || {};
  const skills = c.requiredSkills || {};
  
  if (userPersonality?.scores) {
    const sortedRequired = Object.entries(traits).sort((a,b) => b[1] - a[1]);
    const topRequiredTrait = sortedRequired[0]?.[0];
    if (topRequiredTrait && userPersonality.scores[topRequiredTrait] >= 65) {
      points.push(`Matches your strong '${topRequiredTrait}' trait signature.`);
    }
  }
  
  if (userSkills) {
    const sortedSkills = Object.entries(skills).sort((a,b) => b[1] - a[1]);
    const topRequiredSkill = sortedSkills[0]?.[0];
    if (topRequiredSkill && userSkills[topRequiredSkill] >= 65) {
      points.push(`Aligns with your verified strength in '${topRequiredSkill}' skills.`);
    }
  }

  if (userHappiness && c.lifestyleProfile) {
    const lp = c.lifestyleProfile;
    if (userHappiness.workLifeBalance >= 70 && lp.workLifeBalance >= 60) {
      points.push("Meets your high work-life balance preferences.");
    } else if (userHappiness.salaryPriority >= 70 && lp.salaryPotential >= 60) {
      points.push("Aligns with your salary expectation targets.");
    }
  }

  if (points.length === 0) {
    points.push("Solid general alignment with your personality & lifestyle vectors.");
  }
  return points.slice(0, 2);
};

const getSkillGap = (c, userSkills) => {
  const required = c.requiredSkills || {};
  const gaps = [];
  
  Object.entries(required).forEach(([skill, val]) => {
    const userVal = userSkills ? (userSkills[skill] ?? 50) : 0;
    if (userVal < val) {
      const label = skill === "analytical" ? "Analytical Thinking" :
                    skill === "verbal" ? "Verbal & English" :
                    skill === "quantitative" ? "Quantitative Reasoning" :
                    skill === "attentionToDetail" ? "Attention to Detail" :
                    skill === "communication" ? "Communication" :
                    skill === "creativity" ? "Creative Thinking" :
                    skill === "technicalLiteracy" ? "Technical Literacy" : skill;
      gaps.push({ skill: label, diff: val - userVal });
    }
  });

  gaps.sort((a,b) => b.diff - a.diff);
  return gaps.slice(0, 3).map(g => g.skill);
};

const getStrengthsAndWeaknesses = (scores) => {
  if (!scores) {
    return {
      strengths: ["Curiosity", "Creativity"],
      weaknesses: ["Structure", "Risk Tolerance"]
    };
  }
  const labels = {
    curiosity: "Curiosity", creativity: "Creativity", structure: "Structure",
    leadership: "Leadership", social: "Social", independence: "Independence",
    riskTolerance: "Risk Tolerance", collaboration: "Collaboration", analytical: "Analytical"
  };
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  return {
    strengths: [labels[sorted[0][0]], labels[sorted[1][0]]],
    weaknesses: [labels[sorted[sorted.length - 1][0]], labels[sorted[sorted.length - 2][0]]]
  };
};

const generateLocalSummary = (archetype, strengths, topFamilies, topMatch) => {
  return `As ${archetype.name}, you excel at leveraging your dominant strengths in ${strengths.join(" and ")}. Your cognitive and personality vectors show exceptional alignment with ${topFamilies.map(f => f.name).join(", ")} careers, particularly leading roles like ${topMatch?.career?.title || "your top matches"}. Developing skills in your gap areas will further elevate your compatibility and prepare you for hiring trends with top Indian employers.`;
};

const TRAIT_LABELS = {
  curiosity: "Curiosity", creativity: "Creativity", structure: "Structure",
  leadership: "Leadership", social: "Social", independence: "Independence",
  riskTolerance: "Risk Tolerance", collaboration: "Collaboration", analytical: "Analytical"
};

const SKILL_LABELS = {
  analytical: "Analytical", verbal: "Verbal", quantitative: "Quantitative",
  attentionToDetail: "Attention to Detail", communication: "Communication",
  creativity: "Creativity", technicalLiteracy: "Tech Literacy"
};

const scoreColor = (s) => s >= 75 ? "#14632a" : s >= 50 ? "#9a6700" : "#8b1e1e";

export default function Insights() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const passedPersonality = location?.state?.personality || null;
  const personality = passedPersonality || user?.personality || (() => {
    try { return JSON.parse(localStorage.getItem("careerIQ_personality")) || null; } catch { return null; }
  })();

  const skillScores = user?.results?.length
    ? user.results.reduce((acc, r) => { acc[r.testId] = r.score * 10; return acc; }, {})
    : null;

  const passedOrientation = location?.state?.orientation || null;
  const orientation = passedOrientation || user?.careerOrientation || (() => {
    try { return JSON.parse(localStorage.getItem("careerIQ_orientation")) || null; } catch { return null; }
  })();

  const [happiness, setHappiness] = useState(() => {
    try { return JSON.parse(localStorage.getItem("careerIQ_happiness")) || null; } catch { return null; }
  });

  const [ranked, setRanked] = useState([]);
  const [explaining, setExplaining] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [showStrengths, setShowStrengths] = useState(false);
  const [strengthsText, setStrengthsText] = useState("");
  const [loadingStrengths, setLoadingStrengths] = useState(false);

  useEffect(() => {
    const results = careersData.map(c => {
      const { finalScore, personalityScore, skillScore, lifestyleScore, orientationScore } =
        computeCareerScore(c, personality, skillScores, happiness, user, orientation);
      return { career: c, finalScore, personalityScore, skillScore, lifestyleScore, orientationScore };
    });
    results.sort((a, b) => b.finalScore - a.finalScore);
    setRanked(results);
  }, [personality, skillScores, happiness, user, orientation]);

  const explainCareer = useCallback(async (career, scores) => {
    const key = career.slug;
    if (explanations[key]) return;
    setExplaining(key);
    try {
      const res = await fetch(`${API_BASE}/api/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          career: { title: career.title, requiredTraits: career.requiredTraits, requiredSkills: career.requiredSkills, lifestyleProfile: career.lifestyleProfile },
          userProfile: { personality: personality?.scores, skills: skillScores, happiness },
          scores
        })
      });
      const data = await res.json();
      setExplanations(prev => ({ ...prev, [key]: data.explanation }));
    } catch {
      setExplanations(prev => ({ ...prev, [key]: "Could not load explanation. Stale API key." }));
    } finally {
      setExplaining(null);
    }
  }, [explanations, personality, skillScores, happiness]);

  const analyseStrengths = async () => {
    if (!personality?.scores) return;
    setLoadingStrengths(true);
    setShowStrengths(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/strengths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: personality.scores, skills: skillScores })
      });
      const data = await res.json();
      setStrengthsText(data.analysis);
    } catch {
      setStrengthsText("Could not load analysis. Check your API key on Render.");
    } finally {
      setLoadingStrengths(false);
    }
  };

  // ── Compute custom profile metrics ─────────────────────────────────────────
  const hasTakenQuiz = !!personality?.scores;
  const archetype = getArchetype(personality?.scores);
  const topFamilies = getTopCareerFamilies(ranked);
  const topMatch = ranked[0] || null;
  const almostMatches = ranked.slice(5, 8);
  const { strengths, weaknesses } = getStrengthsAndWeaknesses(personality?.scores);
  const skillGaps = topMatch ? getSkillGap(topMatch.career, skillScores) : ["Technical Literacy", "Communication"];
  const clientSummary = generateLocalSummary(archetype, strengths, topFamilies, topMatch);

  const styles = {
    page: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px", fontFamily: "'Inter', sans-serif" },
    heading: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
    subtitle: { color: "#556b62", marginBottom: 24 },
    card: { padding: 22, borderRadius: 16, background: "#fff", border: "1px solid #eef5f1", boxShadow: "0 10px 30px rgba(6, 95, 75, 0.03)", marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: 800, color: "#072827", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 },
    bar: (pct, color) => ({ width: `${pct}%`, height: 8, background: color, borderRadius: 8, transition: "width 0.5s ease" }),
    barWrap: { height: 8, background: "#edf6ef", borderRadius: 8, overflow: "hidden" },
    badge: { display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, background: "#e6f9f1", color: "#065f4b" },
    bullet: { display: "flex", gap: 10, fontSize: 14, color: "#2f3b35", marginBottom: 8 }
  };

  if (!hasTakenQuiz) {
    return (
      <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
        <Header />
        <main className="ciq-main" style={{ paddingBottom: 60 }}>
          <div style={styles.page}>
            <div style={{ ...styles.card, textAlign: "center", padding: "60px 20px", marginTop: 40 }}>
              <AlertCircle size={48} style={{ color: "var(--accent)", marginBottom: 16 }} />
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#072827", margin: "0 0 10px" }}>Career Insights Locked</h2>
              <p style={{ color: "#5b6a67", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.6 }}>
                You haven't completed the personality assessment yet. Take our quick 5-minute quiz to map your trait vector and unlock a detailed career archetype, skill gaps, roadmaps, and custom matches!
              </p>
              <button onClick={() => navigate("/quiz")} className="ciq-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                Take Personality Quiz Now
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const ArchetypeIcon = archetype.icon;

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      <Header />
      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div style={styles.page}>
          <h1 style={styles.heading}>Your Career Insights</h1>
          <div style={styles.subtitle}>
            Scientific alignment analysis across **Personality**, **Skills**, and **Lifestyle** metrics.
          </div>

          <div className="ciq-grid-two">
            {/* LEFT COLUMN */}
            <div>
              {/* 1. PERSONALITY SNAPSHOT */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Brain size={20} style={{ color: "var(--accent)" }} />
                  <span>1. Personality Snapshot</span>
                </div>
                <p style={{ fontSize: 14, color: "#4a5a54", lineHeight: 1.6, margin: "0 0 16px" }}>
                  Your primary personality traits are highly developed. Here is the distribution of your trait scores from your assessment:
                </p>
                <div style={{ display: "grid", gap: 12 }}>
                  {Object.entries(personality.scores).map(([trait, val]) => (
                    <div key={trait}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                        <span>{TRAIT_LABELS[trait] || trait}</span>
                        <span style={{ color: scoreColor(val) }}>{val}/100</span>
                      </div>
                      <div style={styles.barWrap}>
                        <div style={styles.bar(val, "linear-gradient(90deg, var(--accent), var(--accent-light))")} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. CAREER ARCHETYPE */}
              <div style={{ ...styles.card, background: "linear-gradient(135deg, #072827, #0b4a47)", color: "#ffffff" }}>
                <div style={{ ...styles.cardTitle, color: "#ffffff" }}>
                  <ArchetypeIcon size={22} style={{ color: "var(--accent)" }} />
                  <span>2. Career Archetype</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 10 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: "rgba(6,167,125,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <ArchetypeIcon size={28} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 900, color: "#e8f0ec" }}>{archetype.name}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#a8d4bc", lineHeight: 1.5 }}>{archetype.desc}</p>
                  </div>
                </div>
              </div>

              {/* 3. TOP CAREER FAMILIES */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Layers size={20} style={{ color: "var(--accent)" }} />
                  <span>3. Top Career Families</span>
                </div>
                <p style={{ fontSize: 14, color: "#4a5a54", margin: "0 0 16px" }}>
                  We categorized all 100+ options by industry sectors to find where your profile matches strongest overall:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {topFamilies.map((fam, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8faf8", borderRadius: 8, border: "1px solid #edf2ee" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#072827" }}>{fam.name}</div>
                      <div style={{ fontWeight: 800, color: "var(--accent)", fontSize: 16 }}>{fam.avgScore}% Match</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. TOP CAREER MATCHES */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Compass size={20} style={{ color: "var(--accent)" }} />
                  <span>4. Top Career Matches</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {ranked.slice(0, 5).map((r, idx) => (
                    <div key={r.career.id} style={{ padding: 14, borderRadius: 12, background: "#fdfefe", border: "1.5px solid #edf6ef" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#072827" }}>{r.career.title}</div>
                          <div style={{ fontSize: 12, color: "#5b6a67" }}>{r.career.short}</div>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(r.finalScore) }}>{r.finalScore}%</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#6b7a70", marginBottom: 2 }}>Personality</div>
                          <div style={styles.barWrap}><div style={styles.bar(r.personalityScore, "#06a77d")} /></div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#6b7a70", marginBottom: 2 }}>Skills</div>
                          <div style={styles.barWrap}><div style={styles.bar(r.skillScore, "#0a6b55")} /></div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#6b7a70", marginBottom: 2 }}>Lifestyle</div>
                          <div style={styles.barWrap}><div style={styles.bar(r.lifestyleScore, "#4caf7d")} /></div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <a href={`/careers/${r.career.slug}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>View Role details →</a>
                        <button 
                          onClick={() => explainCareer(r.career, { personality: r.personalityScore, skills: r.skillScore, lifestyle: r.lifestyleScore, final: r.finalScore })}
                          style={{ background: "transparent", border: "none", color: "#065f4b", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                        >
                          {explaining === r.career.slug ? "Analysing..." : "✨ AI Insight"}
                        </button>
                      </div>
                      {explanations[r.career.slug] && (
                        <div style={{ marginTop: 10, padding: 10, background: "#f6fff9", border: "1px solid #c8efd8", borderRadius: 8, fontSize: 12.5, color: "#234c43", lineHeight: 1.5 }}>
                          {explanations[r.career.slug]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. WHY EACH MATCH FITS */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <CheckCircle2 size={20} style={{ color: "var(--accent)" }} />
                  <span>5. Why Each Match Fits</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ranked.slice(0, 3).map((r, idx) => (
                    <div key={idx} style={{ padding: "10px 14px", background: "#f8faf8", borderRadius: 10, border: "1px solid #edf2ee" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#072827", marginBottom: 6 }}>{r.career.title}</div>
                      {getWhyItFits(r.career, personality, skillScores, happiness).map((pt, i) => (
                        <div key={i} style={styles.bullet}>
                          <span style={{ color: "var(--accent)" }}>✓</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. CAREERS YOU ALMOST MATCHED */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <HelpCircle size={20} style={{ color: "var(--accent)" }} />
                  <span>6. Careers You Almost Matched</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#5b6a67", margin: "0 0 14px" }}>
                  These opportunities missed the top matches list slightly but still represent solid alternatives:
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  {almostMatches.map((r, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fbfcfb", borderRadius: 8, border: "1px solid #edf3ee" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#2f3b35" }}>{r.career.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7a70" }}>{r.career.short}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#5b6a67" }}>{r.finalScore}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* 10. AI SUMMARY (Moved to top right for prominent presentation) */}
              <div style={{ ...styles.card, background: "linear-gradient(180deg, #ffffff, #f7fcf9)", border: "1.5px solid #d4ece0" }}>
                <div style={styles.cardTitle}>
                  <Brain size={20} style={{ color: "var(--accent)" }} />
                  <span>10. AI Career Profile Summary</span>
                </div>
                <div style={{ fontStyle: "italic", fontSize: 14.5, color: "#065f4b", lineHeight: 1.7, background: "rgba(6,167,125,0.03)", padding: 16, borderRadius: 10, borderLeft: "4px solid var(--accent)" }}>
                  "{clientSummary}"
                </div>
              </div>

              {/* 7. SKILL GAP ANALYSIS */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <ShieldAlert size={20} style={{ color: "var(--accent)" }} />
                  <span>7. Skill Gap Analysis</span>
                </div>
                {topMatch && (
                  <div>
                    <p style={{ fontSize: 14, color: "#4a5a54", margin: "0 0 12px" }}>
                      Comparing your scores against requirements for **{topMatch.career.title}**:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {skillGaps.length === 0 ? (
                        <div style={{ display: "flex", gap: 8, color: "#14632a", fontSize: 13.5, fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Minimal skill gaps detected! You are fully qualified.
                        </div>
                      ) : (
                        skillGaps.map((gap, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fffefe", border: "1px solid #ffecec", borderRadius: 8 }}>
                            <ShieldAlert size={16} style={{ color: "#8b1e1e", flexShrink: 0 }} />
                            <span style={{ fontSize: 13.5, color: "#8b1e1e", fontWeight: 600 }}>{gap} development required</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 8. STRENGTHS & WEAKNESSES */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Star size={20} style={{ color: "var(--accent)" }} />
                  <span>8. Strengths & Weaknesses</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: 13, textTransform: "uppercase", color: "#14632a", fontWeight: 700 }}>Core Strengths</h4>
                    {strengths.map((s, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 6, fontSize: 13.5, color: "#14632a", marginBottom: 6, fontWeight: 600 }}>
                        <span>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: 13, textTransform: "uppercase", color: "#8b1e1e", fontWeight: 700 }}>Work Areas</h4>
                    {weaknesses.map((w, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 6, fontSize: 13.5, color: "#8b1e1e", marginBottom: 6, fontWeight: 600 }}>
                        <span>⚠</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 9. GROWTH ROADMAP */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Map size={20} style={{ color: "var(--accent)" }} />
                  <span>9. Growth Roadmap</span>
                </div>
                {topMatch && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>
                    <div style={{ borderLeft: "2px solid #edf2ee", paddingLeft: 14, position: "relative" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -7, top: 2 }} />
                      <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 1: Foundations</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#5b6a67" }}>
                        Close the skill gaps in **{skillGaps.join(" & ")}** by taking structured courses or completing validating skill tests.
                      </p>
                    </div>

                    <div style={{ borderLeft: "2px solid #edf2ee", paddingLeft: 14, position: "relative" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -7, top: 2 }} />
                      <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 2: Project Building</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#5b6a67" }}>
                        Develop a portfolio of 3 unique projects targeting **{topMatch.career.skills?.slice(0, 2).join(" & ") || "core competencies"}**.
                      </p>
                    </div>

                    <div style={{ paddingLeft: 14, position: "relative" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -5, top: 2 }} />
                      <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 3: Target Applications</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#5b6a67" }}>
                        Prepare applications for target employers like **{topMatch.career.title === "Baker" ? "Taj Hotels or Oberoi" : "top Indian companies"}**.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI STRENGTHS DETAIL TOGGLE */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Brain size={20} style={{ color: "var(--accent)" }} />
                  <span>Deep AI Personality Analysis</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#5b6a67", margin: "0 0 12px" }}>
                  Unlock a personalized breakdown of your top strengths and areas for growth.
                </p>
                <button style={styles.aiBtn || { padding: "10px 18px", borderRadius: 8, background: "#1a3c34", color: "#fff", border: "none", cursor: "pointer", fontSize: 13.5 }} onClick={analyseStrengths} disabled={loadingStrengths}>
                  {loadingStrengths ? "Analysing..." : "✨ Analyse Top Strengths"}
                </button>
                {showStrengths && strengthsText && (
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "#f4fff8", border: "1px solid #b6e9c8", fontSize: 13, color: "#1a3c34", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {strengthsText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

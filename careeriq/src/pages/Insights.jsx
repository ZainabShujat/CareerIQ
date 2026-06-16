// src/pages/Insights.jsx — Guided Storytelling Layout with Human Model Matchmaking
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";
import { AuthContext } from "../contexts/AuthContext";
import Header from "../components/Header";
import { 
  Brain, Star, TrendingUp, AlertCircle, Award, Compass, 
  Map, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, 
  Layers, Landmark, ShieldCheck, UserCheck, Eye, EyeOff
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const TRAIT_LABELS = {
  analyticalThinking: "Analytical Thinking",
  systemsThinking: "Systems Thinking",
  empathy: "Empathy",
  persuasion: "Persuasion",
  communication: "Communication",
  collaboration: "Collaboration",
  leadership: "Leadership",
  curiosity: "Curiosity",
  serviceOrientation: "Service Orientation",
  wealthOrientation: "Wealth Orientation",
  structurePreference: "Structure Preference",
  riskTolerance: "Risk Tolerance",
  independence: "Independence",
  attentionToDetail: "Attention to Detail",
  creativity: "Creativity",
  designThinking: "Design Thinking"
};

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
    if (tags.some(t => ["design", "ux", "ui", "creative", "media"].includes(t)) || title.includes("designer") || title.includes("writer")) {
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
  if (tags.some(t => ["medical", "healthcare", "clinical", "pharmacy", "care", "bio", "wellness"].includes(t)) || title.includes("doctor") || title.includes("nurse") || title.includes("dentist") || title.includes("therapist") || title.includes("physician") || title.includes("radiologist")) {
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
  if (tags.some(t => ["education", "teaching", "ngo", "social", "development", "training"].includes(t)) || title.includes("teacher") || title.includes("instructor") || title.includes("trainer") || title.includes("educator") || title.includes("counsellor") || title.includes("counselor")) {
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

function getCareer16Traits(career) {
  return {
    analyticalThinking: career.requiredTraits?.analytical ?? 50,
    systemsThinking: career.requiredSkills?.technicalLiteracy ?? 50,
    empathy: career.requiredTraits?.social ?? 50,
    persuasion: career.requiredSkills?.communication ?? 50,
    communication: career.requiredSkills?.communication ?? 50,
    collaboration: career.requiredTraits?.collaboration ?? 50,
    leadership: career.requiredTraits?.leadership ?? 50,
    curiosity: career.requiredTraits?.curiosity ?? 50,
    serviceOrientation: career.requiredTraits?.social ?? 50,
    wealthOrientation: (career.lifestyleProfile?.salaryPotential || 12) * 4, // scale 1-25 -> 4-100
    structurePreference: career.requiredTraits?.structure ?? 50,
    riskTolerance: career.requiredTraits?.riskTolerance ?? 50,
    independence: career.requiredTraits?.independence ?? 50,
    attentionToDetail: career.requiredSkills?.attentionToDetail ?? 50,
    creativity: career.requiredTraits?.creativity ?? 50,
    designThinking: career.requiredSkills?.creativity ?? 50
  };
}

function scoreColor(score) {
  return score >= 75 ? "#14632a" : score >= 50 ? "#9a6700" : "#8b1e1e";
}

function computeCareerScore(career, userTraits, happiness, userProfile) {
  if (!userTraits) return { finalScore: 50, traitsScore: 50, lifestyleScore: 50 };

  const careerTraits = getCareer16Traits(career);
  const traitsScore = computeWeightedMatch(userTraits, careerTraits);

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

  const bias = getDemographicBias(career, userProfile);
  // Match score is 85% human profile compatibility + 15% lifestyle priority + bias
  const finalScore = Math.min(100, Math.round(traitsScore * 0.85 + lifestyleScore * 0.15 + bias));
  
  return { finalScore, traitsScore, lifestyleScore };
}

// ── Profile-Aware Helper Functions ───────────────────────────────────────────

const getArchetype = (scores) => {
  if (!scores) return { name: "The Explorer", icon: Compass, desc: "You are driven by discovery, questioning, and learning. You thrive in open-ended environments that reward investigation." };
  
  // Use mapping to standard traits for archetype extraction
  const curVal = scores.curiosity ?? 50;
  const creVal = scores.creativity ?? 50;
  const strVal = scores.structurePreference ?? 50;
  const leaVal = scores.leadership ?? 50;
  const empVal = scores.empathy ?? 50;
  const indVal = scores.independence ?? 50;
  const rskVal = scores.riskTolerance ?? 50;
  const colVal = scores.collaboration ?? 50;
  const anaVal = scores.analyticalThinking ?? 50;

  const standardScores = {
    curiosity: curVal, creativity: creVal, structure: strVal,
    leadership: leaVal, social: empVal, independence: indVal,
    riskTolerance: rskVal, collaboration: colVal, analytical: anaVal
  };

  const sorted = Object.entries(standardScores).sort((a,b) => b[1] - a[1]);
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
    .slice(0, 4);
};

const getWhyItFits = (c, userTraits) => {
  const title = (c.title || "").toLowerCase();
  const tags = (c.tags || []).map(t => t.toLowerCase());

  if (title.includes("market") || title.includes("sales") || title.includes("brand") || title.includes("success")) {
    return [
      "You appear energized by influencing ideas and understanding how people think.",
      "Your responses suggest a combination of curiosity, communication strength, and comfort working with both people and strategy.",
      "You enjoy exploring patterns in human behavior while still wanting measurable outcomes.",
      "Driven primarily by your social influence and persuasive tendencies rather than technical coding."
    ];
  }

  if (tags.some(t => ["medical", "healthcare", "public-health", "pharmacy", "care", "lab", "bio"].includes(t)) || title.includes("physician") || title.includes("nurse") || title.includes("radiologist")) {
    return [
      "Your profile indicates deep service orientation and clinical attention to detail.",
      "You demonstrate the structured persistence, emotional stability, and empathy required to navigate high-stakes healthcare scenarios.",
      "Your attraction to patient wellness and medical diagnosis suggests a highly dedicated clinical footprint.",
      "Driven by your structural precision and service mindset under critical pressure."
    ];
  }

  if (title.includes("counsellor") || title.includes("counselor") || title.includes("therapist") || title.includes("behavioural") || title.includes("hr")) {
    return [
      "You appear motivated by active listening, human counseling, and understanding behavioral motivations.",
      "Your responses indicate strong empathy, social intelligence, and patience when addressing interpersonal concerns.",
      "You are naturally drawn to helping individuals unpack complex emotional or behavioral challenges.",
      "Driven by your relational support capacity and curiosity about human motives."
    ];
  }

  if (tags.some(t => ["software", "engineering", "infrastructure", "ai", "ml", "cloud", "robotics", "hardware", "mobile", "security", "qa", "devops"].includes(t)) || title.includes("developer") || title.includes("engineer") || title.includes("programmer")) {
    return [
      "You appear motivated by logical construction, systems thinking, and structured programming paradigms.",
      "Your profile highlights a preference for independent problem-solving, cognitive reasoning, and attention to detail.",
      "You enjoy breaking down complex technical loops into organized, scalable codebases.",
      "Driven by your system design skills and logical analytical execution."
    ];
  }

  if (tags.some(t => ["design", "ux", "ui", "creative", "media", "writing", "art", "content"].includes(t)) || title.includes("designer") || title.includes("writer") || title.includes("artist")) {
    return [
      "You appear energized by translating abstract ideas into intuitive visual designs or expressive stories.",
      "Your responses suggest a balance of design thinking, empathy for human experience, and creative innovation.",
      "You enjoy structuring original templates to capture attention and communicate message flows.",
      "Driven by your aesthetic creativity and user-centered conceptualization."
    ];
  }

  if (tags.some(t => ["education", "teaching", "ngo", "social", "development", "training"].includes(t)) || title.includes("teacher") || title.includes("instructor") || title.includes("trainer") || title.includes("educator")) {
    return [
      "You appear motivated by sharing insights, guiding progress, and seeing others grow.",
      "Your profile demonstrates strong verbal communication, collaboration, and high service orientation.",
      "You enjoy structuring learning roadmaps to break down complex topics for students or teams.",
      "Driven by your instructional passion and community growth mindset."
    ];
  }

  if (tags.some(t => ["legal", "law", "compliance", "policy", "governance", "admin"].includes(t)) || title.includes("lawyer") || title.includes("attorney") || title.includes("legal") || title.includes("judge")) {
    return [
      "You appear energized by analytical precision, rules interpretation, and principles-based advocacy.",
      "Your responses suggest a combination of structure preference, verbal persuasion, and detailed reading agility.",
      "You enjoy resolving conflicts by navigating policy frameworks and protecting individual rights.",
      "Driven by your rule-based structure and logical argument competencies."
    ];
  }

  if (tags.some(t => ["business", "management", "strategy", "operations", "consulting", "finance"].includes(t)) || title.includes("manager") || title.includes("consultant") || title.includes("finance") || title.includes("accountant") || title.includes("entrepreneur") || title.includes("founder")) {
    return [
      "You appear energized by corporate orchestration, organizational systems, and strategic leadership.",
      "Your profile indicates a combination of achievement orientation, persuasion, and systems thinking.",
      "You enjoy setting operational goals, analyzing market gaps, and guiding teams toward commercial outcomes.",
      "Driven by strategic business acumen and leadership ambition."
    ];
  }

  return [
    "Your profile matches the specialized workflow requirements and responsibilities of this role.",
    "Your cognitive traits and work style values show solid alignment with the daily tasks of the profession.",
    "The role matches your lifestyle preferences (work-life balance, stress levels, and remote possibilities).",
    "Driven by balanced general compatibility across your overall human profile."
  ];
};

const getSkillGap = (c, userTraits) => {
  const careerTraits = getCareer16Traits(c);
  const gaps = [];
  
  const skillKeys = [
    "analyticalThinking",
    "systemsThinking",
    "persuasion",
    "communication",
    "attentionToDetail",
    "creativity",
    "designThinking"
  ];
  
  skillKeys.forEach(k => {
    const reqVal = careerTraits[k];
    const userVal = userTraits ? (userTraits[k] ?? 50) : 50;
    if (userVal < reqVal) {
      gaps.push({ skill: TRAIT_LABELS[k], diff: reqVal - userVal });
    }
  });

  gaps.sort((a,b) => b.diff - a.diff);
  return gaps.slice(0, 3).map(g => g.skill);
};

const getStrengthsAndWeaknesses = (scores) => {
  if (!scores) {
    return {
      strengths: ["Curiosity", "Empathy", "Analytical Thinking"],
      weaknesses: ["Structure Preference", "Risk Tolerance"]
    };
  }
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  return {
    strengths: [TRAIT_LABELS[sorted[0][0]], TRAIT_LABELS[sorted[1][0]], TRAIT_LABELS[sorted[2][0]]],
    weaknesses: [TRAIT_LABELS[sorted[sorted.length - 1][0]], TRAIT_LABELS[sorted[sorted.length - 2][0]]]
  };
};

const generateLocalSummary = (archetype, strengths, scores) => {
  if (!scores) return `As ${archetype.name}, you excel at leveraging your dominant strengths.`;
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const primaryTrait = sorted[0][0];

  let summary = `As ${archetype.name}, you are primarily driven by your highly developed trait of ${strengths[0]}.`;

  if (primaryTrait === "empathy" || primaryTrait === "serviceOrientation") {
    summary += ` You show a natural ability to connect with others' experiences and motivations, making you exceptionally well-suited for counseling, patient care, or coaching pathways.`;
  } else if (primaryTrait === "analyticalThinking" || primaryTrait === "systemsThinking") {
    summary += ` Your cognitive profile excels at logical architectures, pattern investigation, and detail-oriented problem-solving.`;
  } else if (primaryTrait === "creativity" || primaryTrait === "designThinking") {
    summary += ` You approach the world with a user-centered creative eye, enjoying the translation of abstract themes into innovative concepts.`;
  } else if (primaryTrait === "persuasion" || primaryTrait === "communication") {
    summary += ` You are energized by influencing ideas, strategic dialogue, and navigating organizational relationships.`;
  } else {
    summary += ` You thrive in environments that challenge your intellect, valuing team synergy while keeping your outputs authentic.`;
  }
  return summary;
};

export default function Insights() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State: "who" | "what" | "matches" | "why" | "roadmap"
  const [activeTab, setActiveTab] = useState("who");

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
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveText, setDeepDiveText] = useState("");
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  useEffect(() => {
    if (personality?.scores) {
      const results = careersData.map(c => {
        const { finalScore, traitsScore, lifestyleScore } =
          computeCareerScore(c, personality.scores, happiness, user);
        return { career: c, finalScore, traitsScore, lifestyleScore };
      });
      results.sort((a, b) => b.finalScore - a.finalScore);
      setRanked(results);
    }
  }, [personality, happiness, user]);

  const fetchDeepDive = async () => {
    if (deepDiveText || loadingDeepDive) {
      setShowDeepDive(!showDeepDive);
      return;
    }
    setLoadingDeepDive(true);
    setShowDeepDive(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/strengths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: personality?.scores, skills: skillScores })
      });
      const data = await res.json();
      setDeepDiveText(data.analysis || "Deep analysis generated successfully.");
    } catch {
      setDeepDiveText("Could not connect to live AI insights. Please check API settings or try again later.");
    } finally {
      setLoadingDeepDive(false);
    }
  };

  const hasTakenQuiz = !!personality?.scores;
  const archetype = getArchetype(personality?.scores);
  const topFamilies = getTopCareerFamilies(ranked);
  const topMatch = ranked[0] || null;
  const { strengths, weaknesses } = getStrengthsAndWeaknesses(personality?.scores);
  const skillGaps = topMatch ? getSkillGap(topMatch.career, personality.scores) : ["Technical Literacy", "Communication"];
  const clientSummary = generateLocalSummary(archetype, strengths, personality?.scores);

  const styles = {
    page: { maxWidth: 840, margin: "0 auto", padding: "30px 20px", fontFamily: "'Inter', sans-serif" },
    heading: { fontSize: 30, fontWeight: 800, color: "#072827", marginBottom: 6, textAlign: "center" },
    subtitle: { color: "#556b62", marginBottom: 30, textAlign: "center", fontSize: 14.5 },
    tabsContainer: { display: "flex", borderBottom: "2px solid #eef5f1", marginBottom: 24, overflowX: "auto", gap: 6, scrollbarWidth: "none" },
    tabButton: (active) => ({
      padding: "12px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14.5, fontWeight: active ? 700 : 500,
      color: active ? "var(--accent)" : "#5b6a67", borderBottom: active ? "3px solid var(--accent)" : "3px solid transparent",
      transition: "all 0.2s ease", whiteSpace: "nowrap"
    }),
    card: { padding: 26, borderRadius: 16, background: "#fff", border: "1px solid #eef5f1", boxShadow: "0 8px 25px rgba(6, 95, 75, 0.03)", marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: 800, color: "#072827", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
    barWrap: { height: 8, background: "#edf6ef", borderRadius: 8, overflow: "hidden", marginTop: 4 },
    barFill: (pct, color) => ({ width: `${pct}%`, height: "100%", background: color, borderRadius: 8, transition: "width 0.5s ease" }),
    badge: { display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, background: "#e6f9f1", color: "#065f4b" },
    bullet: { display: "flex", gap: 10, fontSize: 14.5, color: "#2f3b35", marginBottom: 8 }
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
                You haven't completed the assessment yet. Take our quick guided quiz to map your traits and career orientation to unlock a personalized career story.
              </p>
              <button onClick={() => navigate("/quiz")} className="ciq-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                Start Guided Assessment
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
          <h1 style={styles.heading}>Your Career Story</h1>
          <div style={styles.subtitle}>
            Explore who you are, what fields align with you, and how to reach them.
          </div>

          {/* Navigation Tabs */}
          <div style={styles.tabsContainer}>
            <button style={styles.tabButton(activeTab === "who")} onClick={() => setActiveTab("who")}>1. Who You Are</button>
            <button style={styles.tabButton(activeTab === "what")} onClick={() => setActiveTab("what")}>2. What Fits You</button>
            <button style={styles.tabButton(activeTab === "matches")} onClick={() => setActiveTab("matches")}>3. Career Matches</button>
            <button style={styles.tabButton(activeTab === "why")} onClick={() => setActiveTab("why")}>4. Why They Fit</button>
            <button style={styles.tabButton(activeTab === "roadmap")} onClick={() => setActiveTab("roadmap")}>5. Growth Roadmap</button>
          </div>

          {/* TAB CONTENT: 1. WHO YOU ARE */}
          {activeTab === "who" && (
            <div>
              {/* Archetype Summary Card */}
              <div style={{ ...styles.card, background: "linear-gradient(135deg, #072827, #0b4a47)", color: "#ffffff" }}>
                <div style={{ ...styles.cardTitle, color: "#ffffff", marginBottom: 12 }}>
                  <ArchetypeIcon size={24} style={{ color: "var(--accent)" }} />
                  <span>Your Archetype</span>
                </div>
                <h3 style={{ fontSize: 24, margin: "0 0 6px", fontWeight: 900, color: "#fff" }}>{archetype.name}</h3>
                <p style={{ margin: 0, fontSize: 15, color: "#a8d4bc", lineHeight: 1.6 }}>{archetype.desc}</p>
              </div>

              {/* Strengths & Growth Areas */}
              <div style={styles.card}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <h4 style={{ margin: "0 0 12px", fontSize: 13, textTransform: "uppercase", color: "#14632a", fontWeight: 700 }}>Core Strengths</h4>
                    {strengths.map((s, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 8, fontSize: 14.5, color: "#14632a", marginBottom: 8, fontWeight: 600 }}>
                        <span>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 12px", fontSize: 13, textTransform: "uppercase", color: "#8b1e1e", fontWeight: 700 }}>Growth Areas</h4>
                    {weaknesses.map((w, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 8, fontSize: 14.5, color: "#8b1e1e", marginBottom: 8, fontWeight: 600 }}>
                        <span>•</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Brief Summary */}
              <div style={{ ...styles.card, borderLeft: "4px solid var(--accent)", background: "#fcfdfe" }}>
                <div style={styles.cardTitle}>
                  <Brain size={18} style={{ color: "var(--accent)" }} />
                  <span>Profile Overview</span>
                </div>
                <p style={{ fontStyle: "italic", fontSize: 15, color: "#065f4b", lineHeight: 1.6, margin: 0 }}>
                  "{clientSummary}"
                </p>
              </div>

              {/* Deep Analysis Expandable */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button 
                  onClick={fetchDeepDive}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 20,
                    background: "#072827", color: "#fff", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600
                  }}
                >
                  {showDeepDive ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showDeepDive ? "Hide Full Profile" : "View Full Profile"}</span>
                </button>

                {showDeepDive && (
                  <div style={{
                    marginTop: 18, textAlign: "left", padding: 22, borderRadius: 12, background: "#f8faf9",
                    border: "1px solid #c8ebd7", fontSize: 14, color: "#1a3c34", lineHeight: 1.6
                  }}>
                    {loadingDeepDive ? (
                      "Loading detailed analysis..."
                    ) : (
                      <div>
                        <div style={{ fontWeight: 800, marginBottom: 12, color: "#072827" }}>Detailed 16-Dimensional Human Profile:</div>
                        <div style={{ display: "grid", gap: 10 }}>
                          {Object.entries(personality.scores).map(([t, val]) => (
                            <div key={t}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
                                <span>{TRAIT_LABELS[t] || t}</span>
                                <span>{val}/100</span>
                              </div>
                              <div style={styles.barWrap}>
                                <div style={styles.barFill(val, "linear-gradient(90deg, var(--accent), var(--accent-light))")} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {deepDiveText && <div style={{ marginTop: 16, borderTop: "1px solid #b6e9c8", paddingTop: 12, fontStyle: "italic" }}>{deepDiveText}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. WHAT FITS YOU */}
          {activeTab === "what" && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <Layers size={20} style={{ color: "var(--accent)" }} />
                <span>Broad Sectors Alignment</span>
              </div>
              <p style={{ fontSize: 14.5, color: "#4a5a54", lineHeight: 1.6, marginBottom: 20 }}>
                Based on your interest domains, here are the sectors that align strongest with your overall tendencies:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {topFamilies.map((fam, idx) => (
                  <div key={idx} style={{ padding: "14px 18px", background: "#f8faf8", borderRadius: 10, border: "1px solid #edf2ee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, fontWeight: 700, color: "#072827", marginBottom: 6 }}>
                      <span>{fam.name}</span>
                      <span style={{ color: "var(--accent)" }}>{fam.avgScore}% Match</span>
                    </div>
                    <div style={styles.barWrap}>
                      <div style={styles.barFill(fam.avgScore, "linear-gradient(90deg, var(--accent), var(--accent-light))")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. CAREER MATCHES */}
          {activeTab === "matches" && (
            <div>
              <div style={{ marginBottom: 18, fontSize: 14.5, color: "#5b6a67" }}>
                Here are the specific job matches customized for your profile:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ranked.slice(0, 5).map((r) => (
                  <div key={r.career.id} style={{ ...styles.card, marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#072827", margin: "0 0 4px" }}>{r.career.title}</h3>
                        <p style={{ margin: 0, fontSize: 13.5, color: "#5b6a67" }}>{r.career.short}</p>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(r.finalScore), flexShrink: 0, marginLeft: 16 }}>
                        {r.finalScore}%
                      </div>
                    </div>
                    <div style={{ marginTop: 12, textAlign: "right" }}>
                      <a href={`/careers/${r.career.slug}`} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>View Role details →</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. WHY THEY FIT */}
          {activeTab === "why" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ranked.slice(0, 3).map((r, idx) => {
                const whyItFitsNarratives = getWhyItFits(r.career, personality.scores);
                return (
                  <div key={idx} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: "#072827", margin: 0 }}>{r.career.title}</h3>
                      <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(r.finalScore) }}>{r.finalScore}% Alignment</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 14.5, color: "#123326", lineHeight: 1.6 }}>{whyItFitsNarratives[0]}</p>
                      <p style={{ margin: 0, fontSize: 14.5, color: "#1a3c34", lineHeight: 1.6 }}>{whyItFitsNarratives[1]}</p>
                      <p style={{ margin: 0, fontSize: 14.5, color: "#1a3c34", lineHeight: 1.6 }}>{whyItFitsNarratives[2]}</p>
                      <p style={{ margin: 0, fontSize: 13.5, color: "#6b7a70", fontStyle: "italic", marginTop: 4 }}>{whyItFitsNarratives[3]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB CONTENT: 5. GROWTH ROADMAP */}
          {activeTab === "roadmap" && topMatch && (
            <div>
              {/* Readiness Score Card */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
                  <span>Readiness Indicator</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>{topMatch.finalScore}%</div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#072827" }}>Current Job Readiness</div>
                    <div style={{ fontSize: 12.5, color: "#5b6a67" }}>Weighted average across cognitive traits, skills, and lifestyle priorities.</div>
                  </div>
                </div>
              </div>

              {/* Roadmap Phases */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <Map size={20} style={{ color: "var(--accent)" }} />
                  <span>Suggested Action Roadmap</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 10 }}>
                  <div style={{ borderLeft: "2px solid #edf2ee", paddingLeft: 14, position: "relative" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -7, top: 2 }} />
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 1: Build Skills</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#5b6a67" }}>
                      Focus on improving: **{skillGaps.join(", ")}** through structured online resources or validation tests.
                    </p>
                  </div>

                  <div style={{ borderLeft: "2px solid #edf2ee", paddingLeft: 14, position: "relative" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -7, top: 2 }} />
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 2: Project Work</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#5b6a67" }}>
                      Construct a portfolio containing 2-3 unique projects showcasing key qualifications.
                    </p>
                  </div>

                  <div style={{ paddingLeft: 14, position: "relative" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--accent)", position: "absolute", left: -5, top: 2 }} />
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#072827", fontWeight: 700 }}>Phase 3: Industry Reach</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#5b6a67" }}>
                      Target applications at prominent sector employers matching your profile criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

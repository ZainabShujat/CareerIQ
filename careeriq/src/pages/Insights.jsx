// src/pages/Insights.jsx — Proper scoring: Personality(40%) + Skills(40%) + Lifestyle(20%)
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";
import { AuthContext } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

const API_BASE = import.meta.env.VITE_API_BASE || "";

// ── Scoring helpers ───────────────────────────────────────────────────────────

// Compute 0-100 match score using Weighted Directional Euclidean Distance
// - Exceeding requirements has NO penalty.
// - Deficits are penalized.
// - Dimensions are weighted proportionally to career requirements.
function computeWeightedMatch(userVals, careerReqs) {
  const keys = Object.keys(careerReqs || {});
  if (!keys.length) return 50;

  let weightedSumSqDiff = 0;
  let sumWeights = 0;

  keys.forEach(k => {
    const u = userVals[k] ?? 50;
    const c = careerReqs[k] ?? 50;

    // Weight proportional to importance (requirement c)
    const w = 1.0 + (c / 100.0);

    let diff = 0;
    if (u < c) {
      diff = c - u; // deficit
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

// Compute demographic matching boost from profile bio & education
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

function computeCareerScore(career, personality, skillScores, happiness, userProfile) {
  // Personality match (40%)
  const personalityScore = personality?.scores
    ? computeWeightedMatch(personality.scores, career.requiredTraits || {})
    : 50;

  // Skill match (40%)
  const skillScore = skillScores
    ? computeWeightedMatch(skillScores, career.requiredSkills || {})
    : 50;

  // Lifestyle match (20%) — compare happiness prefs to career's lifestyleProfile
  let lifestyleScore = 50;
  if (happiness && career.lifestyleProfile) {
    const lp = career.lifestyleProfile;
    // Map happiness slider keys to career lifestyle profile
    const userLifestyle = {
      stressLevel: 100 - (happiness.stressTolerance ?? 50), // inverse: high tolerance prefers stressful
      salaryPotential: happiness.salaryPriority ?? 50,
      workLifeBalance: happiness.workLifeBalance ?? 50,
      jobSecurity: happiness.jobSecurity ?? 55,
      remoteWork: happiness.remoteWork ?? 50,
      leadershipOpportunity: happiness.leadershipAmbition ?? 50,
    };
    lifestyleScore = computeWeightedMatch(userLifestyle, lp);
  }

  const bias = getDemographicBias(career, userProfile);
  const finalScore = Math.min(100, Math.round(personalityScore * 0.4 + skillScore * 0.4 + lifestyleScore * 0.2 + bias));
  return { finalScore, personalityScore, skillScore, lifestyleScore };
}

// ── Trait labels for display ──────────────────────────────────────────────────
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
  const personality = passedPersonality || user?.personality || null;

  // Build skill scores object from user.results [{testId, score}] - scale 0-10 to 0-100
  const skillScores = user?.results?.length
    ? user.results.reduce((acc, r) => { acc[r.testId] = r.score * 10; return acc; }, {})
    : null;

  // Happiness from localStorage or state
  const [happiness, setHappiness] = useState(() => {
    try { return JSON.parse(localStorage.getItem("careerIQ_happiness")) || null; } catch { return null; }
  });

  const [ranked, setRanked] = useState([]);
  const [explaining, setExplaining] = useState(null); // career id being explained
  const [explanations, setExplanations] = useState({}); // { careerSlug: text }
  const [showStrengths, setShowStrengths] = useState(false);
  const [strengthsText, setStrengthsText] = useState("");
  const [loadingStrengths, setLoadingStrengths] = useState(false);

  // ── Rank careers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const results = careersData.map(c => {
      const { finalScore, personalityScore, skillScore, lifestyleScore } =
        computeCareerScore(c, personality, skillScores, happiness, user);
      return { career: c, finalScore, personalityScore, skillScore, lifestyleScore };
    });
    results.sort((a, b) => b.finalScore - a.finalScore);
    setRanked(results);
  }, [personality, skillScores, happiness, user]);

  // ── AI Explain ────────────────────────────────────────────────────────────
  const explainCareer = useCallback(async (career, scores) => {
    const key = career.slug;
    if (explanations[key]) return; // already fetched
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
      setExplanations(prev => ({ ...prev, [key]: "Could not load explanation. Check your API key on Render." }));
    } finally {
      setExplaining(null);
    }
  }, [explanations, personality, skillScores, happiness]);

  // ── AI Strengths ──────────────────────────────────────────────────────────
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

  const styles = {
    page: { maxWidth: 1100, margin: "0 auto", padding: 28, fontFamily: "'Inter', sans-serif" },
    heading: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
    subtitle: { color: "#556b62", marginBottom: 20 },
    grid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 },
    card: { padding: 16, borderRadius: 12, background: "#fff", border: "1px solid #e6efe9", marginBottom: 12 },
    careerCard: (score) => ({
      padding: 14, borderRadius: 10,
      background: score >= 70 ? "#f4fff8" : "#f8fbf7",
      border: `1px solid ${score >= 70 ? "#b6e9c8" : "#e6efe9"}`,
      marginBottom: 10, transition: "all 0.2s ease"
    }),
    bar: (pct, color) => ({ width: `${pct}%`, height: 6, background: color, borderRadius: 8, transition: "width 0.5s ease" }),
    traitRow: { marginBottom: 10 },
    traitLabel: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 },
    barWrap: { height: 6, background: "#edf6ef", borderRadius: 8 },
    explainBtn: {
      marginTop: 10, padding: "6px 14px", borderRadius: 8, fontSize: 13,
      border: "1px solid #1a3c34", background: "#fff", color: "#1a3c34", cursor: "pointer"
    },
    explainBox: {
      marginTop: 10, padding: 12, borderRadius: 8, background: "#f6fff9",
      border: "1px solid #c8efd8", fontSize: 13, color: "#234c43", lineHeight: 1.6
    },
    aiBtn: {
      padding: "10px 20px", borderRadius: 8, background: "#1a3c34", color: "#fff",
      border: "none", cursor: "pointer", marginTop: 8, fontSize: 14
    },
    strengthsBox: {
      marginTop: 12, padding: 16, borderRadius: 10, background: "#f4fff8",
      border: "1px solid #b6e9c8", fontSize: 14, color: "#1a3c34", lineHeight: 1.7,
      whiteSpace: "pre-wrap"
    }
  };

  return (
    <div style={styles.page}>
      <BackButton />
      <h1 style={styles.heading}>Your Career Insights</h1>
      <div style={styles.subtitle}>
        Scored using the formula: <strong>Personality (40%) + Skills (40%) + Lifestyle (20%)</strong>
      </div>

      <div style={styles.grid}>
        {/* LEFT — Career recommendations */}
        <div>
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Top career matches</div>
              <div style={{ fontSize: 13, color: "#355a4f" }}>{ranked.length} roles scored</div>
            </div>

            <div style={{ marginTop: 12 }}>
              {ranked.slice(0, 10).map(r => (
                <div key={r.career.id} style={styles.careerCard(r.finalScore)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.career.title}</div>
                      <div style={{ color: "#516a61", fontSize: 13, marginTop: 3 }}>{r.career.short}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <div style={{ fontWeight: 700, color: "#1a3c34" }}>{r.career.salary}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(r.finalScore) }}>{r.finalScore}%</div>
                    </div>
                  </div>

                  {/* Score breakdown bars */}
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Personality", val: r.personalityScore, color: "#1a3c34" },
                      { label: "Skills", val: r.skillScore, color: "#0a6b55" },
                      { label: "Lifestyle", val: r.lifestyleScore, color: "#4caf7d" },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: "#6b8a7a", marginBottom: 3 }}>{label} {val}%</div>
                        <div style={styles.barWrap}><div style={styles.bar(val, color)} /></div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                    <a href={`/careers/${r.career.slug}`} style={{ fontSize: 13, color: "#1a3c34", fontWeight: 600, textDecoration: "none" }}>
                      View role →
                    </a>
                    <button
                      style={styles.explainBtn}
                      onClick={() => explainCareer(r.career, { personality: r.personalityScore, skills: r.skillScore, lifestyle: r.lifestyleScore, final: r.finalScore })}
                      disabled={explaining === r.career.slug}
                    >
                      {explaining === r.career.slug ? "Generating..." : "✨ Why this matches me"}
                    </button>
                  </div>

                  {explanations[r.career.slug] && (
                    <div style={styles.explainBox}>{explanations[r.career.slug]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Strengths panel */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>AI Strength Analysis</div>
            <div style={{ marginTop: 6, color: "#4b6b60", fontSize: 14 }}>
              Get a personalised breakdown of your top strengths and areas for growth based on your assessment results.
            </div>
            {personality?.scores ? (
              <>
                <button style={styles.aiBtn} onClick={analyseStrengths} disabled={loadingStrengths}>
                  {loadingStrengths ? "Analysing..." : "✨ Analyse my strengths"}
                </button>
                {showStrengths && strengthsText && (
                  <div style={styles.strengthsBox}>{strengthsText}</div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7a70", fontSize: 13 }}>
                Complete the personality quiz first to unlock this.
                <br /><button style={{ ...styles.explainBtn, marginTop: 8 }} onClick={() => navigate("/quiz")}>Take quiz →</button>
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>How scoring works</div>
            <div style={{ marginTop: 8, color: "#4b6b60", fontSize: 14, lineHeight: 1.6 }}>
              Each career has defined trait requirements, skill requirements and lifestyle profiles.
              Your assessment scores are compared against these requirements using a distance formula.
              <br /><br />
              <strong>Formula:</strong> Personality (40%) + Skills (40%) + Lifestyle (20%)
              <br />
              Higher score = closer match. 70%+ is a strong match.
            </div>
          </div>
        </div>

        {/* RIGHT — Profile summary */}
        <div>
          {/* Personality summary */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Personality profile</div>
            {personality?.scores ? (
              Object.entries(personality.scores).map(([trait, val]) => (
                <div key={trait} style={styles.traitRow}>
                  <div style={styles.traitLabel}>
                    <span>{TRAIT_LABELS[trait] || trait}</span>
                    <span style={{ color: scoreColor(val) }}>{val}/100</span>
                  </div>
                  <div style={styles.barWrap}>
                    <div style={styles.bar(val, "#1a3c34")} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#6b7a70", fontSize: 13 }}>
                No personality results yet.
                <br /><button style={{ ...styles.explainBtn, marginTop: 8 }} onClick={() => navigate("/quiz")}>Take quiz →</button>
              </div>
            )}
          </div>

          {/* Skill scores */}
          <div style={{ ...styles.card, marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Skill scores</div>
            {skillScores ? (
              Object.entries(skillScores).map(([testId, val]) => (
                <div key={testId} style={styles.traitRow}>
                  <div style={styles.traitLabel}>
                    <span>{SKILL_LABELS[testId] || testId}</span>
                    <span style={{ color: scoreColor(val) }}>{val}/10</span>
                  </div>
                  <div style={styles.barWrap}>
                    <div style={styles.bar(val * 10, "#0a6b55")} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#6b7a70", fontSize: 13 }}>
                No skill tests taken yet.
                <br /><button style={{ ...styles.explainBtn, marginTop: 8 }} onClick={() => navigate("/skill-tests")}>Take skill tests →</button>
              </div>
            )}
          </div>

          {/* Happiness preferences */}
          <div style={{ ...styles.card, marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Lifestyle preferences</div>
            {happiness ? (
              Object.entries(happiness).map(([k, v]) => {
                const labels = { salaryPriority:"Salary Priority", workLifeBalance:"Work-Life Balance", stressTolerance:"Stress Tolerance", jobSecurity:"Job Security", remoteWork:"Remote Work", leadershipAmbition:"Leadership Ambition" };
                return (
                  <div key={k} style={styles.traitRow}>
                    <div style={styles.traitLabel}><span>{labels[k] || k}</span><span>{v}</span></div>
                    <div style={styles.barWrap}><div style={styles.bar(v, "#4caf7d")} /></div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "#6b7a70", fontSize: 13 }}>
                Set your preferences in the Happiness Index.
                <br /><button style={{ ...styles.explainBtn, marginTop: 8 }} onClick={() => navigate("/happiness-index")}>Set preferences →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

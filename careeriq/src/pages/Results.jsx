// src/pages/Results.jsx — Happiness Index with 6 dimensions
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";
import BackButton from "../components/BackButton";

const SLIDERS = [
  { key: "salaryPriority",     label: "Salary Priority",      desc: "How important is high earnings to you?",           color: "#1a3c34" },
  { key: "workLifeBalance",    label: "Work-Life Balance",     desc: "How important is time outside of work?",           color: "#0a6b55" },
  { key: "stressTolerance",    label: "Stress Tolerance",      desc: "How well do you handle high-pressure environments?", color: "#4caf7d" },
  { key: "jobSecurity",        label: "Job Security",          desc: "How important is a stable, long-term role?",       color: "#2e7d32" },
  { key: "remoteWork",         label: "Remote Work Preference", desc: "How much do you prefer working from home?",        color: "#388e3c" },
  { key: "leadershipAmbition", label: "Leadership Ambition",   desc: "How much do you want to manage or lead others?",   color: "#1b5e20" },
];

const DEFAULT_VALUES = {
  salaryPriority: 70, workLifeBalance: 60, stressTolerance: 50,
  jobSecurity: 60, remoteWork: 50, leadershipAmbition: 50
};

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

function matchScore(career, prefs) {
  const lp = career.lifestyleProfile;
  if (!lp) {
    // Fallback to old method for careers without lifestyleProfile
    const salaryNum = (() => {
      const m = String(career.salary || "0").match(/(\d+(?:\.\d+)?)/);
      return m ? Math.min(100, Math.round((Number(m[1]) / 40) * 100)) : 50;
    })();
    const stress = career.stress ?? 50;
    const worklife = career.worklife ?? 50;
    const ds = Math.abs(salaryNum - prefs.salaryPriority);
    const dt = Math.abs(stress - (100 - prefs.stressTolerance));
    const dw = Math.abs(worklife - prefs.workLifeBalance);
    return Math.max(0, Math.round(((300 - ds - dt - dw) / 300) * 100));
  }

  // Use all 6 dimensions against lifestyleProfile
  const userLP = {
    salaryPotential: prefs.salaryPriority,
    workLifeBalance: prefs.workLifeBalance,
    stressLevel: 100 - prefs.stressTolerance, // invert: high tolerance prefers high stress
    jobSecurity: prefs.jobSecurity,
    remoteWork: prefs.remoteWork,
    leadershipOpportunity: prefs.leadershipAmbition,
  };

  return computeWeightedMatch(userLP, lp);
}

export default function Results() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("careerIQ_happiness")) || DEFAULT_VALUES; }
    catch { return DEFAULT_VALUES; }
  });
  const [sorted, setSorted] = useState([]);
  const [hovered, setHovered] = useState(null);

  const careers = Array.isArray(careersData) ? careersData : [];

  useEffect(() => {
    const with_score = careers.map(c => ({ ...c, match: matchScore(c, prefs) }));
    with_score.sort((a, b) => b.match - a.match);
    setSorted(with_score);
  }, [prefs]);

  const savePrefs = () => {
    localStorage.setItem("careerIQ_happiness", JSON.stringify(prefs));
    navigate("/insights");
  };

  const s = {
    container: { padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    panel: { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 4px rgba(10,20,15,0.04)", border: "1px solid #eef7f2" },
    sliderLabel: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 },
    sliderDesc: { fontSize: 12, color: "#7b8b82", marginBottom: 8 },
    value: (v) => ({ fontWeight: 700, color: v >= 70 ? "#14632a" : v >= 40 ? "#9a6700" : "#8b1e1e" }),
  };

  return (
    <div className="ciq-root">
      <div style={s.container}>
        <BackButton />
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Happiness Index</h1>
        <p style={{ color: "#556b62", marginBottom: 20 }}>
          Adjust sliders to reflect your life priorities. Career matches update live. Click "Save & See Insights" to apply these to your recommendations.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
          {/* LEFT: 6 sliders */}
          <aside style={s.panel}>
            <h3 style={{ marginTop: 0 }}>Your Preferences</h3>

            {SLIDERS.map(({ key, label, desc, color }) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <div style={s.sliderLabel}>
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span style={s.value(prefs[key])}>{prefs[key]}</span>
                </div>
                <div style={s.sliderDesc}>{desc}</div>
                <input
                  type="range" min="0" max="100" value={prefs[key]}
                  onChange={e => setPrefs(p => ({ ...p, [key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: color }}
                />
              </div>
            ))}

            <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: "#f6fff9", border: "1px solid #c8efd8", fontSize: 13, color: "#234c43" }}>
              <strong>Top match:</strong> {sorted[0]?.title || "—"}
            </div>

            <button
              onClick={savePrefs}
              style={{ marginTop: 14, width: "100%", padding: "12px 0", borderRadius: 10, background: "#1a3c34", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
            >
              Save & See Insights →
            </button>
          </aside>

          {/* RIGHT: matches */}
          <main>
            <h2 style={{ margin: "0 0 12px 0" }}>Career Happiness Matches</h2>
            <p style={{ color: "#556b62", margin: "0 0 14px 0" }}>Results ranked by how well each career's typical lifestyle aligns with your preferences.</p>

            <div style={{ display: "grid", gap: 10 }}>
              {sorted.slice(0, 25).map((c, idx) => (
                <div
                  key={c.id}
                  style={{ animation: `slideInUp 0.4s ease-out ${idx * 0.04}s both` }}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div style={{
                    background: "#fff", borderRadius: 14, padding: 18,
                    boxShadow: hovered === c.id ? "0 16px 48px rgba(6,95,75,0.12)" : "0 4px 14px rgba(6,10,12,0.04)",
                    transform: hovered === c.id ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.25s ease",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
                      <div style={{ color: "#556b62", fontSize: 13, marginTop: 3 }}>{c.short}</div>
                      <div style={{ fontSize: 12, color: "#7b8b82", marginTop: 4 }}>{(c.tags || []).join(", ")}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 100, flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontWeight: 700, color: "#1a3c34" }}>{c.salary}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c.match >= 75 ? "#14632a" : c.match >= 50 ? "#9a6700" : "#8b1e1e", marginTop: 4 }}>{c.match}%</div>
                      <a href={`/careers/${c.slug}`} style={{ fontSize: 13, color: "#065f4b", textDecoration: "none" }}>View →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: "#888" }}>
          Tip: Use keyboard arrows to move sliders. Matches update instantly. Saving persists preferences to your Insights page.
        </div>
      </div>
    </div>
  );
}

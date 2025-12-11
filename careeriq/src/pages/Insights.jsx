// src/pages/Insights.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom"; // <-- NEW
import careersData from "../data/careers.json";
import { AuthContext } from "../contexts/AuthContext";
import backbutton from "../components/BackButton";

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 28, fontFamily: "'Inter', sans-serif" },
  heading: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: "#556b62", marginBottom: 20 },
  resultsGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 },
  main: { background: "transparent" },
  card: { padding: 16, borderRadius: 12, background: "#fff", border: "1px solid #e6efe9", marginBottom: 12 },
  careerCard: { padding: 12, borderRadius: 10, background: "#f8fbf7", border: "1px solid #e6efe9", marginBottom: 10 }
};

// Keywords used for personality scoring
const traitKeywords = {
  Analytical: ["data", "analyst", "quant", "research", "ml", "scientist", "analytics", "engineer"],
  Social: ["teacher", "counsel", "therap", "mentor", "care", "social", "community", "hr"],
  Structured: ["project", "manager", "operations", "qa", "account", "engineer", "risk", "admin"],
  Creative: ["design", "ux", "creative", "artist", "designer", "product", "ux", "visual"]
};

// Keywords used for skill test mapping
const skillKeywords = {
  analytical: ["data", "analysis", "analytics", "ml", "research"],
  verbal: ["communication", "content", "writing", "teacher", "trainer"],
  logical: ["algorithm", "qa", "testing", "research", "devops"],
  domain: ["hospitality", "medical", "culinary", "civil", "teaching", "finance"]
};

function normalize(v, max = 10) {
  if (!v) return 0;
  return Math.min(Math.max(v / max, 0), 1); // now skills are scored 0–10
}

export default function Insights() {
  const { user } = useContext(AuthContext);
  const location = useLocation(); // <-- NEW

  // prefer personality passed via navigation state (freshly POSTed), then user.personality, then null
  const passedPersonality = location?.state?.personality || null;
  const personality = passedPersonality || user?.personality || null; // <-- REPLACED

  const [ranked, setRanked] = useState([]);

  // Convert backend results → skills object
  const skills = user?.results?.length
    ? {
        scores: user.results.reduce((acc, r) => {
          acc[r.testId] = r.score;
          return acc;
        }, {})
      }
    : null;

  // Compute rankings
  useEffect(() => {
    if (!careersData) return;

    const careerItems = careersData.map(c => {
      const title = (c.title || "").toLowerCase();
      const tags = (c.tags || []).join(" ").toLowerCase();
      const text = title + " " + tags + " " + (c.short || "").toLowerCase();
      return { ...c, _text: text };
    });

    const computeForCareer = (c) => {
      // Personality scoring
      let personalityScore = 0;
      if (personality?.scores) {
        for (const trait of Object.keys(personality.scores)) {
          const kw = traitKeywords[trait] || [];
          const present = kw.some(k => c._text.includes(k)) ? 1 : 0;
          personalityScore += (personality.scores[trait] / 5) * present;
        }
        personalityScore /= Object.keys(personality.scores).length || 1;
      }

      // Skill scoring
      let skillScore = 0;
      if (skills?.scores) {
        for (const [skillKey, val] of Object.entries(skills.scores)) {
          const kw = skillKeywords[skillKey] || [];
          const present = kw.some(k => c._text.includes(k)) ? 1 : 0;
          skillScore += normalize(val) * present;
        }
        skillScore /= Object.keys(skills.scores).length || 1;
      }

      const finalFit = 0.4 * personalityScore + 0.6 * skillScore;

      return { career: c, personalityScore, skillScore, fit: finalFit };
    };

    const results = careerItems.map(computeForCareer);
    results.sort((a, b) => b.fit - a.fit);

    setRanked(results);
  }, [personality, skills]);

  return (
    <div style={styles.page}>
      <BackButton />
      <h1 style={styles.heading}>Your Insights</h1>
      <div style={styles.subtitle}>
        Combined view of your personality test and skill tests. Results update as you take more tests.
      </div>

      <div style={styles.resultsGrid}>
        {/* LEFT SIDE — CAREER RECOMMENDATIONS */}
        <div style={styles.main}>
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>Top career matches</div>
              <div style={{ fontWeight: 700, color: "#355a4f" }}>{ranked.length} roles scored</div>
            </div>

            <div style={{ marginTop: 12 }}>
              {ranked.slice(0, 8).map(r => (
                <div key={r.career.id} style={styles.careerCard}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{r.career.title}</div>
                    <div style={{ fontWeight: 700, color: "#2f5547" }}>{r.career.salary}</div>
                  </div>

                  <div style={{ marginTop: 6, color: "#516a61" }}>{r.career.short}</div>

                  <div style={{ marginTop: 8, fontSize: 13, color: "#3b5a50" }}>
                    Fit {Math.round(r.fit * 100)}% • Personality {Math.round(r.personalityScore * 100)}% • Skills {Math.round(r.skillScore * 100)}%
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <a href={`/careers/${r.career.slug}`} style={{ fontWeight: 700, color: "#1a3c34", textDecoration: "none" }}>
                      View role →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Card */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>How the ranking works</div>
            <div style={{ marginTop: 8, color: "#4b6b60" }}>
              We compare your personality strengths and skill test performance with keywords in career descriptions.
              Skills have higher weight than personality. This is an MVP — we can later upgrade to vector models or embeddings.
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — PERSONALITY + SKILL SUMMARY */}
        <div>
          {/* Personality Summary */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>Personality summary</div>
            {personality ? (
              <div style={{ marginTop: 10 }}>
                {Object.entries(personality.scores).map(([trait, val]) => (
                  <div key={trait} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700 }}>{trait}</div>
                      <div>{val}/5</div>
                    </div>
                    <div style={{ height: 8, background: "#edf6ef", borderRadius: 8 }}>
                      <div style={{ width: `${(val / 5) * 100}%`, height: 8, background: "#1a3c34", borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7a70" }}>No personality results yet.</div>
            )}
          </div>

          {/* Skill Summary */}
          <div style={{ ...styles.card, marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Skill scores</div>

            {skills?.scores ? (
              <div style={{ marginTop: 10 }}>
                {Object.entries(skills.scores).map(([test, val]) => (
                  <div key={test} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700 }}>{test}</div>
                      <div>{val}/10</div>
                    </div>
                    <div style={{ height: 8, background: "#edf6ef", borderRadius: 8 }}>
                      <div style={{ width: `${(val / 10) * 100}%`, height: 8, background: "#1a3c34", borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7a70" }}>No skill tests taken yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Insights.jsx
import React, { useEffect, useState } from "react";
import careersData from "../data/careers.json";

/*
Upgraded Insights:
- Reads careerIQ_personality and careerIQ_skills from localStorage
- Computes a simple combined "fit" score for each career:
    fit = weighted_sum( personality_match * personality_weight, skill_match * skill_weight )
  where matches are computed via keyword overlap and normalized scores.
- Ranks careers by fit and shows the top matches with explanation.
*/

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 28, fontFamily: "'Inter', sans-serif" },
  heading: { fontSize: 32, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: "#556b62", marginBottom: 20 },
  resultsGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 },
  main: { background: "transparent" },
  card: { padding: 16, borderRadius: 12, background: "#fff", border: "1px solid #e6efe9", marginBottom: 12 },
  careerCard: { padding: 12, borderRadius: 10, background: "#f8fbf7", border: "1px solid #e6efe9", marginBottom: 10 }
};

// trait -> keywords (same as before, but slightly expanded)
const traitKeywords = {
  Analytical: ["data", "analyst", "quant", "research", "ml", "scientist", "analytics", "engineer"],
  Social: ["teacher", "counsel", "therap", "mentor", "care", "social", "community", "hr"],
  Structured: ["project", "manager", "operations", "qa", "account", "engineer", "risk", "admin"],
  Creative: ["design", "ux", "creative", "artist", "designer", "product", "ux", "visual"]
};

// skill -> keywords to match career tags/titles (basic)
const skillKeywords = {
  analytical: ["data", "analysis", "analytics", "ml", "research"],
  verbal: ["communication", "content", "writing", "teacher", "trainer"],
  logical: ["algorithm", "qa", "testing", "research", "devops"],
  domain: ["hospitality", "medical", "culinary", "civil", "teaching", "finance"]
};

function normalize(v, max = 5) {
  if (!v) return 0;
  return Math.min(Math.max(v / max, 0), 1);
}

export default function Insights() {
  const [personality, setPersonality] = useState(null);
  const [skills, setSkills] = useState(null);
  const [ranked, setRanked] = useState([]);

  useEffect(() => {
    // load personality & skills
    try {
      const rawP = localStorage.getItem("careerIQ_personality");
      if (rawP) setPersonality(JSON.parse(rawP));
    } catch (e) { console.warn(e); }

    try {
      const rawS = localStorage.getItem("careerIQ_skills");
      if (rawS) setSkills(JSON.parse(rawS));
    } catch (e) { console.warn(e); }
  }, []);

  useEffect(() => {
    if (!careersData) return;
    // build vectorized career keywords
    const careerItems = careersData.map(c => {
      const title = (c.title || "").toLowerCase();
      const tags = (c.tags || []).join(" ").toLowerCase();
      const text = title + " " + tags + " " + (c.short || "");
      return { ...c, _text: text };
    });

    // compute match score for each career
    const computeForCareer = (c) => {
      // personality match: sum of (trait score normalized * presence of trait keywords)
      let personalityScore = 0;
      if (personality && personality.scores) {
        for (const trait of Object.keys(personality.scores)) {
          const ks = traitKeywords[trait] || [];
          const present = ks.some(k => c._text.includes(k)) ? 1 : 0;
          personalityScore += normalize(personality.scores[trait]) * present;
        }
        // normalize by number of traits so it's 0..1-ish
        personalityScore = personalityScore / Object.keys(personality.scores).length;
      }

      // skills match: for each skill that exists in skills.scores, check keywords
      let skillScore = 0;
      if (skills && skills.scores) {
        // map skill keys to our skillKeywords mapping
        for (const [skillKey, val] of Object.entries(skills.scores)) {
          const keywords = skillKeywords[skillKey] || [];
          const present = keywords.some(k => c._text.includes(k)) ? 1 : 0;
          skillScore += normalize(val) * present;
        }
        skillScore = skillScore / (Object.keys(skills.scores).length || 1);
      }

      // final fit: weigh personality 40%, skills 60% (tweakable)
      const finalFit = (0.4 * personalityScore) + (0.6 * skillScore);
      return { career: c, personalityScore, skillScore, fit: finalFit };
    };

    const results = careerItems.map(computeForCareer);
    // sort descending
    results.sort((a, b) => b.fit - a.fit);
    setRanked(results);
  }, [personality, skills]);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Your Insights</h1>
      <div style={styles.subtitle}>
        Combined view of your personality test and skill tests. Results update as you take more tests.
      </div>

      <div style={styles.resultsGrid}>
        <div style={styles.main}>
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Top career matches</div>
              <div style={{ color: "#355a4f", fontWeight: 700 }}>{ranked.length} roles scored</div>
            </div>

            <div style={{ marginTop: 12 }}>
              {ranked.slice(0, 8).map(r => (
                <div key={r.career.id} style={{ marginBottom: 10 }}>
                  <div style={styles.careerCard}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700 }}>{r.career.title}</div>
                      <div style={{ color: "#2f5547", fontWeight: 700 }}>{(r.career.salary || "")}</div>
                    </div>
                    <div style={{ color: "#516a61", marginTop: 6 }}>{r.career.short}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: "#3b5a50" }}>
                      Fit: {(r.fit * 100).toFixed(0)}% • personality {(r.personalityScore*100).toFixed(0)}% • skills {(r.skillScore*100).toFixed(0)}%
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <a href={`/careers/${encodeURIComponent(r.career.slug)}`} style={{ color: "#1a3c34", fontWeight: 700, textDecoration: "none" }}>View role →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>How the ranking works</div>
            <div style={{ marginTop: 8, color: "#4b6b60" }}>
              We look at keywords in career titles & tags and compare them to:
              <ul>
                <li>Which traits you scored high on (personality)</li>
                <li>Which tests you scored well on (skills)</li>
              </ul>
              Then we compute a simple weighted fit score (skills weighted higher). This is an MVP — we can make it smarter (TF-IDF, vector embeddings, user preferences).
            </div>
          </div>
        </div>

        <div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700 }}>Personality summary</div>
            {personality ? (
              <div style={{ marginTop: 10 }}>
                {Object.entries(personality.scores).map(([k,v]) => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700 }}>{k}</div>
                      <div>{v}</div>
                    </div>
                    <div style={{ height: 8, background: "#edf6ef", borderRadius: 8, marginTop: 6 }}>
                      <div style={{ width: `${(v/5)*100}%`, height: 8, background: "#1a3c34", borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7a70" }}>No personality results saved. Take the personality test first.</div>
            )}
          </div>

          <div style={{ ...styles.card, marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Skill scores</div>
            {skills ? (
              <div style={{ marginTop: 10 }}>
                {Object.entries(skills.scores).map(([k,v]) => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700 }}>{k}</div>
                      <div>{v}</div>
                    </div>
                    <div style={{ height: 8, background: "#edf6ef", borderRadius: 8, marginTop: 6 }}>
                      <div style={{ width: `${(v/5)*100}%`, height: 8, background: "#1a3c34", borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7a70" }}>No skill tests taken yet. Try the Skill Tests page.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

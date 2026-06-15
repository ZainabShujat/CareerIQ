// src/pages/Quiz.jsx  — 9-trait personality assessment
import React, { useState, useMemo, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/*
 * 27-question Likert quiz — 3 questions per trait.
 * Traits: curiosity, creativity, structure, leadership, social,
 *         independence, riskTolerance, collaboration, analytical
 */

const TRAIT_QUESTIONS = [
  // curiosity (0-2)
  { q: "I enjoy learning about topics outside my field of study.", trait: "curiosity" },
  { q: "I often wonder how things work and dig deeper to find out.", trait: "curiosity" },
  { q: "I find new ideas exciting, even when I don't know where they'll lead.", trait: "curiosity" },
  // creativity (3-5)
  { q: "I come up with original solutions rather than following standard approaches.", trait: "creativity" },
  { q: "I enjoy making things — art, code, writing, music, or anything expressive.", trait: "creativity" },
  { q: "I often think of multiple ways to solve the same problem.", trait: "creativity" },
  // structure (6-8)
  { q: "I prefer having a clear plan before starting a task.", trait: "structure" },
  { q: "I feel uncomfortable when there are no clear rules or processes.", trait: "structure" },
  { q: "I like to keep my workspace and schedule well-organised.", trait: "structure" },
  // leadership (9-11)
  { q: "I naturally step up to guide a group when no leader is present.", trait: "leadership" },
  { q: "I enjoy making decisions that affect others, even under pressure.", trait: "leadership" },
  { q: "I find it easy to motivate people around me.", trait: "leadership" },
  // social (12-14)
  { q: "I feel energised after spending time with groups of people.", trait: "social" },
  { q: "I find it easy to build rapport with people I've just met.", trait: "social" },
  { q: "I genuinely enjoy helping or supporting other people.", trait: "social" },
  // independence (15-17)
  { q: "I prefer working alone rather than in a group.", trait: "independence" },
  { q: "I do my best work when I can set my own schedule and pace.", trait: "independence" },
  { q: "I don't need much external validation to feel confident in my decisions.", trait: "independence" },
  // riskTolerance (18-20)
  { q: "I am comfortable starting something without knowing exactly how it will turn out.", trait: "riskTolerance" },
  { q: "I would rather try something new with uncertain outcomes than stick with the safe option.", trait: "riskTolerance" },
  { q: "I handle sudden changes or unexpected challenges well.", trait: "riskTolerance" },
  // collaboration (21-23)
  { q: "I find that working with others usually produces better results than working alone.", trait: "collaboration" },
  { q: "I actively listen and incorporate others' feedback into my work.", trait: "collaboration" },
  { q: "I feel responsible for the success of my team, not just my own tasks.", trait: "collaboration" },
  // analytical (24-26)
  { q: "I enjoy analysing data or breaking down complex problems into smaller parts.", trait: "analytical" },
  { q: "I tend to look for evidence before forming an opinion.", trait: "analytical" },
  { q: "I prefer making decisions based on logic and data rather than gut feeling.", trait: "analytical" },
];

const OPTION_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const TRAITS = ["curiosity","creativity","structure","leadership","social","independence","riskTolerance","collaboration","analytical"];

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 28, fontFamily: "'Inter', sans-serif" },
  stickyHeader: {
    position: "sticky", top: 12, zIndex: 30,
    background: "#f6fbf7", padding: "12px 0", marginBottom: 8,
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
  },
  leftHeader: { display: "flex", gap: 12, alignItems: "center" },
  title: { fontSize: 26, fontWeight: 700, margin: 0 },
  subtitle: { color: "#556b62", marginTop: 6, fontSize: 14 },
  progressBlock: { textAlign: "right" },
  progressBar: { height: 6, background: "#e6efe9", borderRadius: 8, marginTop: 6, overflow: "hidden" },
  progressFill: (pct) => ({ width: `${pct}%`, height: 6, background: "#1a3c34", borderRadius: 8, transition: "width 0.3s ease" }),
  tableWrap: { overflowX: "auto", marginTop: 8, borderRadius: 12, border: "1px solid #e6efe9", background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "minmax(260px, 1fr) repeat(5, 72px)", gap: 8, alignItems: "center" },
  headerCell: { padding: "18px 8px", textAlign: "center", fontWeight: 700, color: "#234c43", fontSize: 12 },
  questionCell: { padding: "16px 18px", fontSize: 15, color: "#123326" },
  radioCell: { display: "flex", justifyContent: "center", alignItems: "center" },
  radioInput: { width: 18, height: 18, cursor: "pointer" },
  rowSeparator: { gridColumn: "1 / -1", height: 1, background: "#edf6ef", margin: "4px 0" },
  buttonsRow: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 18, alignItems: "center" },
  submitBtn: { padding: "10px 22px", borderRadius: 8, background: "#1a3c34", color: "#fff", border: "none", cursor: "pointer", fontSize: 15 },
  resetBtn: { padding: "9px 16px", borderRadius: 8, background: "#fff", color: "#1a3c34", border: "1px solid #cfd8d4", cursor: "pointer" },
  helpText: { marginTop: 12, color: "#4b6b60", fontSize: 13 },
  traitBadge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 12,
    background: "#e6f9f1", color: "#0a6b55", fontSize: 11, fontWeight: 600, marginLeft: 8
  }
};

// Trait → friendly label
const TRAIT_LABELS = {
  curiosity: "Curiosity", creativity: "Creativity", structure: "Structure",
  leadership: "Leadership", social: "Social", independence: "Independence",
  riskTolerance: "Risk Tolerance", collaboration: "Collaboration", analytical: "Analytical"
};

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const API_BASE = import.meta.env.VITE_API_BASE || "";

  const [answers, setAnswers] = useState(() => TRAIT_QUESTIONS.map(() => 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const rowRefs = useRef([]);

  const answeredCount = answers.filter(a => a > 0).length;
  const progress = Math.round((answeredCount / TRAIT_QUESTIONS.length) * 100);

  const scrollToRow = (i) => {
    setTimeout(() => {
      rowRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const setAnswer = (qi, value) => {
    const updated = [...answers];
    updated[qi] = Number(value);
    setAnswers(updated);
    const next = Math.min(qi + 1, TRAIT_QUESTIONS.length - 1);
    setActiveIndex(next);
    scrollToRow(next);
  };

  const reset = () => {
    setAnswers(TRAIT_QUESTIONS.map(() => 0));
    setActiveIndex(0);
    scrollToRow(0);
  };

  const computeScores = (ans) => {
    const scores = {};
    TRAITS.forEach(trait => {
      const indices = TRAIT_QUESTIONS.map((q, i) => q.trait === trait ? i : -1).filter(i => i >= 0);
      const vals = indices.map(i => Number(ans[i] || 0)).filter(v => v > 0);
      // Scale 1-5 → 0-100
      scores[trait] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length - 1) * 25) : 50;
    });
    return scores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.includes(0)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const scores = computeScores(answers);
    const payload = { scores, answers, timestamp: new Date().toISOString() };

    localStorage.setItem("careerIQ_personality", JSON.stringify(payload));

    const token = localStorage.getItem("ciq_token");
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/personality`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          return navigate("/insights", { state: { personality: json.personality || payload } });
        }
      } catch (err) {
        console.error("Network error saving personality:", err);
      }
    }
    navigate("/insights", { state: { personality: payload } });
  };

  return (
    <div style={styles.page}>
      {/* Sticky header */}
      <div style={styles.stickyHeader}>
        <div style={styles.leftHeader}>
          <button style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cfd8d4", background: "#fff", cursor: "pointer" }}
            onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1 style={styles.title}>Personality Assessment</h1>
            <div style={styles.subtitle}>27 questions · Measures 9 career-relevant traits · ~5 min</div>
          </div>
        </div>
        <div style={styles.progressBlock}>
          <div style={{ fontSize: 14, color: "#2f5547", fontWeight: 700 }}>{answeredCount} / {TRAIT_QUESTIONS.length}</div>
          <div style={styles.progressBar}><div style={styles.progressFill(progress)} /></div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#6b7a70" }}>{progress}% complete</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.tableWrap}>
          <div style={{ padding: "12px 12px 0" }}>
            <div style={styles.grid}>
              <div style={{ paddingLeft: 8, fontWeight: 700, fontSize: 14 }}>Statement</div>
              {OPTION_LABELS.map((label, i) => (
                <div key={i} style={styles.headerCell}>{label}</div>
              ))}
            </div>
          </div>

          <div style={{ padding: 12 }}>
            {TRAIT_QUESTIONS.map((item, qi) => {
              const isActive = qi === activeIndex;
              const isAnswered = answers[qi] > 0;
              return (
                <React.Fragment key={qi}>
                  <div style={styles.grid}>
                    <div
                      ref={el => (rowRefs.current[qi] = el)}
                      style={{
                        ...styles.questionCell,
                        background: isActive ? "#f0faf4" : isAnswered ? "#fafffe" : "white",
                        borderRadius: isActive ? 8 : 4,
                        cursor: "pointer",
                        borderLeft: isActive ? "3px solid #1a3c34" : "3px solid transparent",
                        transition: "all 0.2s ease"
                      }}
                      onClick={() => { setActiveIndex(qi); scrollToRow(qi); }}
                    >
                      <div style={{ fontSize: 11, color: "#6b8a7a", marginBottom: 3 }}>
                        {qi + 1}. <span style={styles.traitBadge}>{TRAIT_LABELS[item.trait]}</span>
                      </div>
                      <div style={{ fontWeight: isActive ? 600 : 400 }}>{item.q}</div>
                    </div>
                    {[1,2,3,4,5].map(val => (
                      <div key={val} style={styles.radioCell}>
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          value={val}
                          checked={answers[qi] === val}
                          onChange={e => setAnswer(qi, e.target.value)}
                          style={styles.radioInput}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={styles.rowSeparator} />
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={styles.helpText}>
          Trait badges show which career trait each question measures. Your scores will be used to match careers.
        </div>

        <div style={styles.buttonsRow}>
          <button type="button" onClick={reset} style={styles.resetBtn}>Reset</button>
          <button type="submit" style={styles.submitBtn} disabled={answeredCount < TRAIT_QUESTIONS.length}>
            {answeredCount < TRAIT_QUESTIONS.length ? `Answer all (${TRAIT_QUESTIONS.length - answeredCount} left)` : "Submit & See Results →"}
          </button>
        </div>
      </form>
    </div>
  );
}

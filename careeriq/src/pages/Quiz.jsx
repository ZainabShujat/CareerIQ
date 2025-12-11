// src/pages/Quiz.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/*
Matrix-style quiz — wired to save a personality summary into localStorage
Key: careerIQ_personality
Structure saved: { scores: {Analytical, Social, Structured, Creative}, answers: [...], timestamp }
*/

const questions = [
  "I enjoy meeting new people",
  "I like helping people",
  "I prefer structured tasks",
  "I enjoy solving logical puzzles",
  "I feel energized after social events",
  "I am careful about details",
  "I like taking creative risks",
  "I prefer routine over change",
  "I easily adapt to new tech",
  "I enjoy public speaking",
  "I prefer working alone",
  "I like planning long-term goals",
  "I enjoy hands-on projects",
  "I find it easy to empathize with others",
  "I prefer clear rules at work",
  "I like exploring abstract ideas",
  "I enjoy mentoring/teaching",
  "I make decisions quickly",
  "I value accuracy over speed",
  "I enjoy managing people",
  "I like analysing data",
  "I appreciate aesthetics and design",
  "I follow through on commitments",
  "I feel comfortable with ambiguity"
];

const optionLabels = [
  "Strongly Disagree",
  "Disagree",
  "Unsure",
  "Agree",
  "Strongly Agree"
];

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 28, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial" },
  stickyHeader: {
    position: "sticky",
    top: 12,
    zIndex: 30,
    background: "#f6fbf7",
    padding: "12px 0",
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  leftHeader: { display: "flex", gap: 12, alignItems: "center" },
  backBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #cfd8d4", background: "#fff", cursor: "pointer" },
  titleBlock: { lineHeight: 1 },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  subtitle: { color: "#556b62", marginTop: 6, fontSize: 14 },
  progressBlock: { textAlign: "right" },
  topBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #cfd8d4", background: "#fff", cursor: "pointer" },

  tableWrap: { overflowX: "auto", marginTop: 8, borderRadius: 12, border: "1px solid #e6efe9", background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "minmax(260px, 1fr) repeat(5, 72px)", gap: 8, alignItems: "center" },

  headerCell: { padding: "18px 8px", textAlign: "center", fontWeight: 700, color: "#234c43" },
  headerLabelSmall: { fontSize: 12, color: "#3b5a50" },

  questionCell: { padding: "16px 18px", fontSize: 15, color: "#123326" },
  radioCell: { display: "flex", justifyContent: "center", alignItems: "center" },
  radioInput: { width: 18, height: 18, cursor: "pointer" },
  rowSeparator: { gridColumn: "1 / -1", height: 1, background: "#edf6ef", margin: "6px 0" },

  buttonsRow: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 18, alignItems: "center" },
  submitBtn: { padding: "10px 18px", borderRadius: 8, background: "#1a3c34", color: "#fff", border: "none", cursor: "pointer" },
  resetBtn: { padding: "9px 16px", borderRadius: 8, background: "#fff", color: "#1a3c34", border: "1px solid #cfd8d4", cursor: "pointer" },
  helpText: { marginTop: 12, color: "#4b6b60", fontSize: 14 }
};

export default function Quiz() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(() => questions.map(() => 0)); // 0 = unanswered
  const [activeIndex, setActiveIndex] = useState(0);

  const answeredCount = useMemo(() => answers.filter(a => a > 0).length, [answers]);

  const setAnswer = (qIndex, value) => {
    const copy = [...answers];
    copy[qIndex] = Number(value);
    setAnswers(copy);
  };

  const reset = () => {
    setAnswers(questions.map(() => 0));
    setActiveIndex(0);
  };

  /* keyboard shortcuts */
  React.useEffect(() => {
    const handleKey = (e) => {
      if (["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (e.key >= "1" && e.key <= "5") {
        setAnswer(activeIndex, Number(e.key));
        setActiveIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }
      if (e.key === "ArrowDown") setActiveIndex((i) => Math.min(i + 1, questions.length - 1));
      if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex]);

  /* Trait mapping:
     Analytical: Q4 (idx 3), Q21 (idx 20), Q11 (idx 10)
     Social: Q1 (0), Q2 (1), Q5 (4), Q17 (16)
     Structured: Q3 (2), Q8 (7), Q15 (14), Q23 (22)
     Creative: Q7 (6), Q13 (12), Q16 (15), Q22 (21)
  */
  const computeTraits = (answersArr) => {
    const groups = {
      Analytical: [3, 20, 10],
      Social: [0, 1, 4, 16],
      Structured: [2, 7, 14, 22],
      Creative: [6, 12, 15, 21]
    };

    const scores = {};
    for (const key in groups) {
      const idxs = groups[key];
      const vals = idxs.map(i => Number(answersArr[i] || 0)).filter(v => v > 0);
      const avg = vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
      scores[key] = Number(avg.toFixed(2));
    }
    return scores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // compute trait scores
    const scores = computeTraits(answers);
    const payload = {
      scores,
      answers,
      timestamp: new Date().toISOString()
    };
    // save to localStorage
    try {
      localStorage.setItem("careerIQ_personality", JSON.stringify(payload));
    } catch (err) {
      console.warn("localStorage failed", err);
    }
    // navigate to insights
    navigate("/insights");
  };

  return (
    <div style={styles.page}>
      <div style={styles.stickyHeader}>
        <div style={styles.leftHeader}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <div style={styles.titleBlock}>
            <h1 style={styles.title}>Personality / Likert Matrix</h1>
            <div style={styles.subtitle}>Answer quickly: press 1–5 or click options</div>
          </div>
        </div>

        <div style={styles.progressBlock}>
          <div style={{ fontSize: 14, color: "#2f5547", fontWeight: 700 }}>{answeredCount} / {questions.length} answered</div>
          <div style={{ marginTop: 8 }}>
            <button style={styles.topBtn} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.tableWrap}>
          <div style={{ padding: 12 }}>
            <div style={styles.grid}>
              <div style={{ paddingLeft: 8, fontWeight: 700, color: "#123326" }}>Statements</div>
              {optionLabels.map((label, i) => (
                <div key={i} style={styles.headerCell}>
                  <div style={styles.headerLabelSmall}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 12 }}>
            <div style={styles.grid}>
              {questions.map((q, qi) => (
                <React.Fragment key={qi}>
                  <div
                    style={{
                      ...styles.questionCell,
                      background: qi === activeIndex ? "#f6fbf7" : "white",
                      borderRadius: qi === activeIndex ? 8 : 0,
                      cursor: "pointer"
                    }}
                    onClick={() => setActiveIndex(qi)}
                  >
                    <div style={{ fontWeight: 600 }}>{qi + 1}. {q}</div>
                  </div>

                  {Array.from({ length: 5 }).map((_, oi) => (
                    <div key={oi} style={styles.radioCell}>
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        value={oi + 1}
                        checked={answers[qi] === (oi + 1)}
                        onChange={(e) => setAnswer(qi, e.target.value)}
                        style={styles.radioInput}
                        aria-label={`${q} — ${optionLabels[oi]}`}
                      />
                    </div>
                  ))}

                  <div style={styles.rowSeparator} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.helpText}>
          Keyboard shortcuts: press 1–5 to answer the active row; use ↑ / ↓ to move rows.
        </div>

        <div style={styles.buttonsRow}>
          <button type="button" onClick={reset} style={styles.resetBtn}>Reset</button>
          <button type="submit" style={styles.submitBtn}>Submit</button>
        </div>
      </form>
    </div>
  );
}

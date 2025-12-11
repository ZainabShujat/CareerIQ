// src/pages/Quiz.jsx
import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // ⭐ needed for backend save
import { useContext } from "react";

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
  page: { maxWidth: 1100, margin: "0 auto", padding: 28 },
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
  const { user } = useContext(AuthContext); // ⭐ detects logged-in user

  const [answers, setAnswers] = useState(() => questions.map(() => 0));
  const [activeIndex, setActiveIndex] = useState(0);

  const rowRefs = useRef([]); // ⭐ For autoscroll

  const answeredCount = useMemo(() => answers.filter(a => a > 0).length, [answers]);

  // ⭐ Smooth scroll to next question
  const scrollToRow = (i) => {
    setTimeout(() => {
      rowRefs.current[i]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 120);
  };

  const setAnswer = (qIndex, value) => {
    const updated = [...answers];
    updated[qIndex] = Number(value);
    setAnswers(updated);

    const next = Math.min(qIndex + 1, questions.length - 1);
    setActiveIndex(next);
    scrollToRow(next);
  };

  const reset = () => {
    setAnswers(questions.map(() => 0));
    setActiveIndex(0);
    scrollToRow(0);
  };

  // Your original trait mapping remains untouched
  const computeTraits = (ans) => {
    const groups = {
      Analytical: [3, 20, 10],
      Social: [0, 1, 4, 16],
      Structured: [2, 7, 14, 22],
      Creative: [6, 12, 15, 21]
    };

    const scores = {};
    for (const key in groups) {
      const values = groups[key].map(i => Number(ans[i] || 0)).filter(v => v > 0);
      scores[key] = values.length ? Number((values.reduce((a, b) => a + b) / values.length).toFixed(2)) : 0;
    }
    return scores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ⭐ require all questions answered
    if (answers.includes(0)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const scores = computeTraits(answers);

    const payload = {
      scores,
      answers,
      timestamp: new Date().toISOString()
    };

    // ⭐ Save locally ALWAYS
    localStorage.setItem("careerIQ_personality", JSON.stringify(payload));

    // ⭐ Save to backend IF logged in
    if (user) {
      try {
        const token = localStorage.getItem("ciq_token");

        const res = await fetch("/api/personality", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          console.error("Backend error");
        }
      } catch (err) {
        console.error("Network error", err);
      }
    }

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
          <div style={{ fontSize: 14, color: "#2f5547", fontWeight: 700 }}>
            {answeredCount} / {questions.length} answered
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.tableWrap}>
          <div style={{ padding: 12 }}>
            <div style={styles.grid}>
              <div style={{ paddingLeft: 8, fontWeight: 700 }}>Statements</div>
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
                    ref={(el) => (rowRefs.current[qi] = el)}
                    style={{
                      ...styles.questionCell,
                      background: qi === activeIndex ? "#f6fbf7" : "white",
                      borderRadius: qi === activeIndex ? 8 : 0,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setActiveIndex(qi);
                      scrollToRow(qi);
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{qi + 1}. {q}</div>
                  </div>

                  {[1, 2, 3, 4, 5].map((opt) => (
                    <div key={opt} style={styles.radioCell}>
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        value={opt}
                        checked={answers[qi] === opt}
                        onChange={() => setAnswer(qi, opt)}
                        style={styles.radioInput}
                      />
                    </div>
                  ))}

                  <div style={styles.rowSeparator} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        

        <div style={styles.buttonsRow}>
          <button type="button" onClick={reset} style={styles.resetBtn}>Reset</button>
          <button type="submit" style={styles.submitBtn}>Submit</button>
        </div>
      </form>
    </div>
  );
}

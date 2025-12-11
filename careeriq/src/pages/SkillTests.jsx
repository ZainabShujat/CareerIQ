// src/pages/SkillTests.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
SkillTests:
- Provides four short tests (Analytical, Verbal, Logical, Domain)
- Each test is 5 quick MCQs (sample questions); you can replace them with real questions later
- On submit the component computes a normalized score (0..5) for each test
- Saves payload to localStorage under key: "careerIQ_skills"
- Navigates to /insights after submit
*/

const TEST_DEFS = [
  { id: "analytical", title: "Analytical Reasoning", short: "Data, patterns, logic" },
  { id: "verbal", title: "Verbal Reasoning", short: "Language & comprehension" },
  { id: "logical", title: "Logical Reasoning", short: "Puzzles & sequences" },
  { id: "domain", title: "Domain Knowledge", short: "Practical / field knowledge" }
];

// simple sample questions (5 per test) — replace with real content later
const makeSampleQs = (testId) => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `${testId}-q${i+1}`,
    text: `(${testId}) Sample Q${i+1}: Pick the best answer.`,
    options: ["A", "B", "C", "D"],
    // for now we mark option 0 as correct for scoring demo — change as needed
    correct: 0
  }));
};

export default function SkillTests() {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!activeTest) return;
    // generate sample questions for the selected test
    setQuestions(makeSampleQs(activeTest));
    setAnswers({});
  }, [activeTest]);

  function startTest(id) {
    setActiveTest(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pick(qid, idx) {
    setAnswers(a => ({ ...a, [qid]: idx }));
  }

  function scoreAndSave() {
    // score: count equals to correct (demo); produce 0..5 normalized value
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correctCount++;
    });
    const score = Number((correctCount).toFixed(2)); // 0..5 integer
    // load existing saved skills if any
    const raw = localStorage.getItem("careerIQ_skills");
    const previous = raw ? JSON.parse(raw) : { scores: {}, history: [] };

    // update
    previous.scores = { ...previous.scores, [activeTest]: score };
    previous.history = previous.history || [];
    previous.history.unshift({
      testId: activeTest,
      score,
      total: questions.length,
      answers,
      takenAt: new Date().toISOString()
    });

    try {
      localStorage.setItem("careerIQ_skills", JSON.stringify(previous));
    } catch (e) {
      console.warn("save failed", e);
    }
    // done
    alert(`Saved ${activeTest} — score ${score}/${questions.length}`);
    setActiveTest(null);
  }

  function submitAllAndFinish() {
    // compute current test score if active
    if (activeTest) scoreAndSave();
    // after saving, go to insights
    navigate("/insights");
  }

  // quick UI
  return (
    <div className="ciq-container" style={{ padding: 28, maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12, padding: "8px 12px" }}>← Back</button>
      <h1 style={{ marginTop: 0 }}>Skill Tests</h1>
      <p style={{ color: "#556b62" }}>Complete short skill tests to get domain scores. You can take tests in any order. Results will be combined with your personality profile in Insights.</p>

      {!activeTest ? (
        <>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 18 }}>
            {TEST_DEFS.map(t => (
              <div key={t.id} style={{ padding: 16, borderRadius: 12, background: "#fff", border: "1px solid #e6efe9" }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ color: "#6b7a70", marginTop: 6 }}>{t.short}</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#768a83" }}>5 questions</div>
                  <div>
                    <button onClick={() => startTest(t.id)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>Start</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => navigate("/insights")} style={{ padding: "10px 14px", borderRadius: 10, background: "#1a3c34", color: "white", border: "none", cursor: "pointer" }}>
              View insights (without taking tests)
            </button>
          </div>
        </>
      ) : (
        // runner
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setActiveTest(null)} style={{ padding: "8px 12px" }}>← Back</button>
          <h2 style={{ marginTop: 12 }}>{TEST_DEFS.find(t => t.id === activeTest).title}</h2>

          {questions.map((q, i) => (
            <div key={q.id} style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #e6efe9" }}>
              <div style={{ fontWeight: 700 }}>{i + 1}. {q.text}</div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, idx) => (
                  <label key={idx} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => pick(q.id, idx)}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button onClick={scoreAndSave} style={{ padding: "10px 14px", borderRadius: 10, background: "#1a3c34", color: "white", border: "none", cursor: "pointer" }}>
              Save test
            </button>
            <button onClick={submitAllAndFinish} style={{ padding: "10px 14px", borderRadius: 10, background: "#fff", border: "1px solid #cfd8d4", cursor: "pointer" }}>
              Save & go to Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

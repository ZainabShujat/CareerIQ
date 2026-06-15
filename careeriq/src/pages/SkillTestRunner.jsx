import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import testsBank from "../data/questions.json";
import Header from "../components/Header";
import { Check, ArrowLeft, RefreshCw, Award, BarChart2 } from "lucide-react";

export default function SkillTestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserResults } = useContext(AuthContext);

  const testsArray = (testsBank && testsBank.tests) || [];

  const test = useMemo(
    () => testsArray.find((t) => String(t.id) === String(testId)),
    [testsArray, testId]
  );

  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const questionRefs = useMemo(
    () => (test ? test.questions.map(() => React.createRef()) : []),
    [test]
  );

  if (!test) {
    return (
      <div style={{ padding: 28 }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Test not found</h2>
      </div>
    );
  }

  if (!user) {
    navigate("/skill-tests");
    return null;
  }

  const getQuestionText = (q) =>
    q.text || q.question || q.prompt || "Untitled question";

  const getOptions = (q) => q.options || q.choices || [];

  const handleSingle = (qid, idx, questionIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));

    const nextIndex = questionIndex + 1;

    if (questionRefs[nextIndex]) {
      setTimeout(() => {
        questionRefs[nextIndex].current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < test.questions.length) {
      alert(`Please answer all ${test.questions.length} questions before submitting.`);
      return;
    }

    setSubmitting(true);

    // Calculate score
    let correctCount = 0;
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / test.questions.length) * 100);
    setFinalScore(scorePct);

    // Send result to the backend
    const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
    const token = localStorage.getItem("ciq_token");

    try {
      const res = await fetch(`${API_BASE}/api/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          testId: test.id,
          score: scorePct,
          details: { answers, correctCount, totalQuestions: test.questions.length }
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update results in context if helper exists
        if (updateUserResults) {
          updateUserResults(data.results);
        } else if (user) {
          user.results = data.results; // local fallback update
        }
        setCompleted(true);
      } else {
        alert("Failed to save result to backend. Showing local completion.");
        setCompleted(true);
      }
    } catch (err) {
      console.error("Failed to sync score:", err);
      setCompleted(true); // Fallback to local completed display
    } finally {
      setSubmitting(false);
    }
  };

  // Completion diagnostic messages
  const getFeedbackMessage = (sc) => {
    if (sc >= 85) return { title: "Superb Job! 🌟", text: "You demonstrated outstanding mastery in this domain. These results will positively reinforce your matching vector." };
    if (sc >= 60) return { title: "Good Performance! 👍", text: "Solid understanding! Continue refining your skills and building projects to improve further." };
    return { title: "Keep Learning! 📚", text: "An excellent opportunity to grow! Try reviewing references and online resources to level up in this area." };
  };

  if (completed) {
    const feedback = getFeedbackMessage(finalScore);
    return (
      <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
        <Header />
        <main className="ciq-main" style={{ paddingBottom: 80 }}>
          <div className="ciq-container" style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: "40px 32px",
              border: "1px solid rgba(6, 160, 120, 0.08)",
              boxShadow: "0 10px 30px rgba(6, 95, 75, 0.06)",
              textAlign: "center"
            }}>
              
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #06a77d, #04c48a)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", boxShadow: "0 6px 20px rgba(6,167,125,0.3)"
              }}>
                <Award size={40} />
              </div>

              <h2 style={{ fontSize: 28, color: "#072827", margin: "0 0 8px 0", fontWeight: 800 }}>{feedback.title}</h2>
              <div style={{ fontSize: 13, color: "#6b7a70", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                {test.title} Score
              </div>

              {/* Large circular score gauge */}
              <div style={{
                display: "inline-block",
                padding: "24px 36px",
                borderRadius: 20,
                background: "#f3fbf8",
                border: "1px solid #c3ebd5",
                fontSize: 48,
                fontWeight: 900,
                color: "#06a77d",
                marginBottom: 24,
                fontFamily: "monospace"
              }}>
                {finalScore}%
              </div>

              <p style={{ color: "#5b6a67", fontSize: 14.5, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
                {feedback.text}
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate("/insights")}
                  className="ciq-cta"
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #06a77d, #04c48a)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <BarChart2 size={16} /> View Insights
                </button>
                <button
                  onClick={() => navigate("/skill-tests")}
                  style={{
                    padding: "12px 24px",
                    background: "#f0f5f2",
                    color: "#0a6b55",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <RefreshCw size={16} /> Other Tests
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30, marginBottom: 16 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, border: "1px solid #cfd8d4",
                background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
                color: "#5b6a67"
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#072827", margin: "0 0 6px 0" }}>{test.title}</h1>
            <p style={{ color: "#5b6a67", fontSize: 14.5, margin: 0, lineHeight: 1.5 }}>
              {test.description || "Complete the questions below. Correct answers will immediately synchronize with your skill scores."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: "12px 24px",
              border: "1px solid rgba(6, 160, 120, 0.08)",
              boxShadow: "0 8px 20px rgba(6, 95, 75, 0.03)"
            }}>
              {test.questions.map((q, i) => {
                const qText = getQuestionText(q);
                const opts = getOptions(q);
                const qType = q.type || "mcq";

                return (
                  <div
                    key={q.id || i}
                    ref={questionRefs[i]}
                    style={{
                      padding: "20px 0",
                      borderBottom: i === test.questions.length - 1 ? "none" : "1px solid #eef6f1",
                    }}
                  >
                    <div style={{ marginBottom: 12, fontWeight: 700, color: "#072827", fontSize: 15 }}>
                      {i + 1}. {qText}
                    </div>

                    {qType === "mcq" && opts.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                        {opts.map((opt, oi) => {
                          const isChecked = answers[q.id] === oi;
                          return (
                            <label
                              key={oi}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 14px",
                                borderRadius: 8,
                                border: isChecked ? "1.5px solid #06a77d" : "1px solid #eef6f1",
                                background: isChecked ? "#f3fbf8" : "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                                color: isChecked ? "#065f4b" : "#4a5a56",
                                transition: "all 0.15s"
                              }}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={isChecked}
                                onChange={() => handleSingle(q.id, oi, i)}
                                style={{
                                  accentColor: "#06a77d",
                                  cursor: "pointer",
                                  width: 16,
                                  height: 16
                                }}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting || Object.keys(answers).length < test.questions.length}
                style={{
                  padding: "12px 28px",
                  background: submitting || Object.keys(answers).length < test.questions.length
                    ? "rgba(6, 160, 120, 0.2)"
                    : "linear-gradient(135deg, #06a77d, #04c48a)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: submitting || Object.keys(answers).length < test.questions.length ? "default" : "pointer",
                  boxShadow: submitting || Object.keys(answers).length < test.questions.length ? "none" : "0 4px 14px rgba(6,167,125,0.3)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
              >
                {submitting ? (
                  <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                ) : <Check size={16} />}
                {submitting ? "Submitting..." : "Submit Answers"}
              </button>
            </div>
          </form>

        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

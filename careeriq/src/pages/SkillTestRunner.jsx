// SkillTestRunner.jsx (FINAL FIXED VERSION)
import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import testsBank from "../data/questions.json";
import BackButton from "../components/BackButton"


export default function SkillTestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const testsArray = (testsBank && testsBank.tests) || [];

  const test = useMemo(
    () => testsArray.find((t) => String(t.id) === String(testId)),
    [testsArray, testId]
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

  const [answers, setAnswers] = useState({});
  const [hoveredOption, setHoveredOption] = useState(null); // NEW: for hover effects

  const questionRefs = useMemo(
    () => test.questions.map(() => React.createRef()),
    [test]
  );

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
  
    // 1️⃣ Compute score
    let score = 0;
    test.questions.forEach((q, i) => {
      const answer = answers[q.id];
      if (answer !== undefined && q.correct !== undefined) {
        if (answer === q.correct) score += 1;
      }
    });
  
    const token = localStorage.getItem("ciq_token");
  
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          testId: test.id,
          score,
          details: answers
        })
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save results");
  
      // Redirect to insights now
      navigate("/insights");
  
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };


  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9, #eaf9f4)" }}>
      {/* ...keep existing header... */}

      <main className="ciq-main" style={{ paddingTop: 20 }}>
        <div className="ciq-container" style={{ maxWidth: 800, paddingBottom: 40 }}>
          {/* Sticky Header with animation */}
          <div style={{
            position: "sticky",
            top: 12,
            zIndex: 30,
            background: "linear-gradient(180deg, #f6fbf9, rgba(246, 251, 249, 0.9))",
            backdropFilter: "blur(8px)",
            padding: "16px 0",
            marginBottom: 12,
            animation: "slideInDown 0.6s ease-out"
          }}>
            <button
              onClick={() => navigate("/skill-tests")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(6, 95, 75, 0.12)",
                background: "#fff",
                cursor: "pointer",
                color: "#5b6a67",
                fontWeight: 600,
                transition: "all 0.2s ease",
                marginBottom: 12
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(6, 95, 75, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ← Back to Tests
            </button>

            <div>
              <h1 style={{
                fontSize: 24,
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(135deg, #072827, #06a77d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {test.title}
              </h1>
              <p style={{ color: "#5b6a67", margin: "6px 0 0 0", fontSize: 14 }}>
                Question {currentIdx + 1} of {questions.length}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: "100%",
              height: 6,
              background: "rgba(6, 95, 75, 0.08)",
              borderRadius: 999,
              marginTop: 14,
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: `${((currentIdx + 1) / questions.length) * 100}%`,
                background: "linear-gradient(90deg, #06a77d, #12b886)",
                transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                borderRadius: 999
              }} />
            </div>
          </div>

          {/* Question Card */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(6, 10, 12, 0.06)",
            border: "1px solid rgba(6, 95, 75, 0.04)",
            marginTop: 16,
            animation: "slideInUp 0.5s ease-out",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Shimmer effect */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "shimmer 3s infinite",
              pointerEvents: "none"
            }} />

            <h2 style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#072827",
              margin: "0 0 22px 0",
              lineHeight: 1.4
            }}>
              {currentIdx + 1}. {getQuestionText(test.questions[currentIdx])}
            </h2>

            {/* Options with hover animation */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {getOptions(test.questions[currentIdx]).map((option, idx) => {
                const isSelected = answers[currentIdx] === option;
                const isHovered = hoveredOption === idx;

                return (
                  <label
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(6, 160, 120, 0.12), rgba(11, 127, 103, 0.06))"
                        : isHovered
                        ? "rgba(6, 160, 120, 0.06)"
                        : "#f8fbfa",
                      border: isSelected
                        ? "2px solid #06a77d"
                        : "1px solid rgba(6, 95, 75, 0.08)",
                      cursor: "pointer",
                      transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isHovered ? "translateX(8px) scale(1.02)" : "translateX(0) scale(1)",
                      animation: `slideInUp 0.4s ease-out ${idx * 0.08}s both`
                    }}
                    onMouseEnter={() => setHoveredOption(idx)}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleSingle(currentIdx, option, idx)} // KEEP YOUR HANDLER
                      style={{
                        width: 18,
                        height: 18,
                        cursor: "pointer",
                        accentColor: "#06a77d"
                      }}
                    />
                    <span style={{
                      fontSize: 15,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "#06a77d" : "#234c43",
                      transition: "color 0.2s ease"
                    }}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons with hover */}
          <div style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            marginTop: 22,
            animation: "slideInUp 0.6s ease-out 0.2s both"
          }}>
            <button
              onClick={() => {/* KEEP YOUR PREV HANDLER */}}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid rgba(6, 95, 75, 0.12)",
                color: "#234c43",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(6, 95, 75, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ← Previous
            </button>

            <button
              onClick={() => {/* KEEP YOUR NEXT/SUBMIT HANDLER */}}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #06a77d, #058a68)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 6px 16px rgba(6, 95, 75, 0.12)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px) scale(1.05)";
                e.target.style.boxShadow = "0 10px 24px rgba(6, 95, 75, 0.16)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 6px 16px rgba(6, 95, 75, 0.12)";
              }}
            >
              {/* KEEP YOUR BUTTON TEXT LOGIC */}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

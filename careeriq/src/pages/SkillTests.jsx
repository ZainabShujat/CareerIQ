import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; 
import testsBank from "../data/questions.json";
import Header from "../components/Header";
import { BookOpen, CheckCircle, Play, AlertCircle } from "lucide-react";

export default function SkillTests() {
  const { user, openAuth } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const tests = Array.isArray(testsBank?.tests) ? testsBank.tests : [];

  // Auto-close login modal when user logs in and redirect to test
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false);
      if (selectedTestId) navigate(`/skill-tests/${selectedTestId}`);
    }
  }, [user, showLoginModal, selectedTestId, navigate]);

  function onStartClick(testId) {
    if (user) {
      navigate(`/skill-tests/${testId}`);
      return;
    }
    setSelectedTestId(testId);
    setShowLoginModal(true);
  }

  // Get user result for a specific test
  const getTestResult = (testId) => {
    if (!user || !user.results) return null;
    // Find the highest score for this test
    const matches = user.results.filter(r => r.testId === testId);
    if (matches.length === 0) return null;
    return matches.reduce((highest, current) => current.score > highest.score ? current : highest, matches[0]);
  };

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      {/* Icon Navigation Header */}
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Header Title Section */}
          <div style={{ marginTop: 40, marginBottom: 30 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#072827", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
              Practical Skill Tests
            </h1>
            <p style={{ color: "#5b6a67", fontSize: 15, lineHeight: 1.6, maxWidth: 700, margin: 0 }}>
              Complete short domain-specific quizzes to evaluate your strengths. The scores are synced and mapped directly into your Career Recommender profile.
            </p>
          </div>

          {/* Test Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {tests.length === 0 && (
              <div style={{ padding: 30, background: "#fff", borderRadius: 12, border: "1px solid #e2efe8", color: "#6b7a70", gridColumn: "1/-1", textAlign: "center" }}>
                No tests found in questions.json.
              </div>
            )}

            {tests.map((t) => {
              const result = getTestResult(t.id);
              const isCompleted = !!result;

              return (
                <div
                  key={t.id}
                  style={{
                    background: "#ffffff",
                    padding: 24,
                    borderRadius: 14,
                    border: isCompleted ? "1px solid #c3ebd5" : "1px solid rgba(6, 160, 120, 0.08)",
                    boxShadow: "0 8px 20px rgba(6, 95, 75, 0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 180,
                    transition: "all 0.25s ease-in-out",
                    position: "relative"
                  }}
                  className="ciq-card"
                >
                  <div>
                    {/* Header badge / Category name */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8,
                        color: isCompleted ? "#06a77d" : "#5b6a67"
                      }}>
                        {t.id}
                      </span>
                      {isCompleted && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 700, color: "#06a77d",
                          background: "#eefaf3", padding: "3px 8px", borderRadius: 12
                        }}>
                          <CheckCircle size={12} /> {result.score}%
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#072827", fontWeight: 700 }}>{t.title}</h3>
                    <p style={{ color: "#6b7a70", fontSize: 13.5, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <BookOpen size={14} /> {Array.isArray(t.questions) ? t.questions.length : "—"} questions
                    </p>
                  </div>

                  <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => onStartClick(t.id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: isCompleted ? "rgba(6, 167, 125, 0.1)" : "linear-gradient(135deg, #06a77d, #04c48a)",
                        color: isCompleted ? "#06a77d" : "#ffffff",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={e => {
                        if (!isCompleted) e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,167,125,0.3)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Play size={13} fill="currentColor" /> {isCompleted ? "Retake" : "Start"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LOGIN MODAL */}
          {showLoginModal && (
            <div style={modalOverlay}>
              <div style={modalCard}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: "#fdf3f3",
                    color: "#d93838", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "#072827" }}>Authentication Required</h3>
                    <p style={{ color: "#5b6a67", fontSize: 13.5, margin: "4px 0 0 0", lineHeight: 1.4 }}>
                      Please sign in to save test scores. Results will be synced into your profile matching details.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      setSelectedTestId(null);
                    }}
                    style={{
                      background: "transparent", border: "1px solid #cfd8d4", padding: "8px 16px",
                      borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#5b6a67"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => openAuth({ tab: "login" })}
                    style={{
                      background: "linear-gradient(135deg, #06a77d, #04c48a)", color: "#fff",
                      border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                      fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(6,167,125,0.2)"
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* --- inline modal styles --- */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.45)",
  zIndex: 1200,
  backdropFilter: "blur(4px)"
};

const modalCard = {
  width: 440,
  background: "#fff",
  padding: 24,
  borderRadius: 14,
  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
};

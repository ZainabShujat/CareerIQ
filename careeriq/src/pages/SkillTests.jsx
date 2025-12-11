// src/pages/SkillTests.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; 
import testsBank from "../data/questions.json";

export default function SkillTests() {
  const { user, openAuth } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const tests = Array.isArray(testsBank?.tests) ? testsBank.tests : [];

  // ⭐ AUTO-CLOSE LOGIN MODAL WHEN USER LOGS IN
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false);
      // After closing, redirect if test was selected
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

  return (
    <div className="ciq-container" style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back</button>

      <h1 style={{ fontSize: 42, margin: "6px 0 12px 0" }}>Skill Tests</h1>
      <p style={{ color: "#556b62", maxWidth: 880, marginBottom: 20 }}>
        Complete short skill tests to get domain scores. Results will be combined with your personality profile in Insights.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
        }}
      >
        {tests.length === 0 && (
          <div style={{ gridColumn: "1/-1", color: "#6b7a70" }}>
            No tests found in questions.json.
          </div>
        )}

        {tests.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              padding: 18,
              borderRadius: 12,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>{t.title}</h3>
              <p style={{ color: "#6b7a70", marginTop: 0 }}>
                {Array.isArray(t.questions) ? t.questions.length : "—"} questions
              </p>
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => onStartClick(t.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Start
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ marginTop: 0 }}>Sign in to save your score</h3>
            <p style={{ color: "#556b62" }}>
              Skill test results are saved to your profile and used in Insights.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                onClick={() => openAuth({ tab: "login" })}
                style={primaryBtnStyle}
              >
                Sign in / create account
              </button>

              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setSelectedTestId(null);
                }}
                style={secondaryBtnStyle}
              >
                Cancel
              </button>
            </div>

            <div style={{ marginTop: 14, color: "#7b8b82", fontSize: 13 }}>
              After signing in you'll be redirected to your test.
            </div>
          </div>
        </div>
      )}
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
  background: "rgba(0,0,0,0.35)",
  zIndex: 1200,
};

const modalCard = {
  width: 420,
  background: "#fff",
  padding: 22,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const primaryBtnStyle = {
  background: "#0a6b55",
  color: "#fff",
  padding: "14px 34px",
  borderRadius: 28,
  border: "none",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#f0f5f2",
  color: "#083",
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

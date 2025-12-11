// src/pages/SkillTests.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // adjust path if needed
import testsBank from "../data/questions.json"; // your uploaded bank (contains .tests array)

/**
 * SkillTests page
 *
 * - Shows the grid of available skill tests (using testsBank.tests).
 * - When a user clicks "Start":
 *    - if logged in -> navigate to the test route: /skill-tests/:testId
 *    - if NOT logged in -> open a modal prompting sign-in (with redirect after login)
 *
 * Notes:
 * - This file intentionally does NOT force full-page gating; it keeps the list visible
 *   and only prompts for login when the user attempts to start a test (this is what
 *   you asked for: personality test stays open-to-all; skill tests require login).
 * - If you *do* want the whole page gated instead, replace the main return with the
 *   commented-out early-return block near the top (see comment).
 */

export default function SkillTests() {
  const { user, openAuth } = useContext(AuthContext);
// null if not logged in
  const navigate = useNavigate();

  // modal state when trying to start a test while not logged in
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  // safe guard for data shape
  const tests = Array.isArray(testsBank?.tests) ? testsBank.tests : [];

  // If you wanted the *entire page* to be visible only when logged in,
  // you could use this early-return pattern (uncomment to use):
  //
  // if (!user) {
  //   return (
  //     <div className="ciq-container" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
  //       <h1>Skill Tests</h1>
  //       <p style={{ color: "#556b62" }}>
  //         Skill tests need you to sign in so we can save your results to your profile.
  //       </p>
  //       <div style={{ display: "flex", gap: 12 }}>
  //         <Link to="/login"><button style={{ padding: "10px 14px" }}>Sign in / Create account</button></Link>
  //         <button onClick={() => navigate("/")} style={{ padding: "10px 14px" }}>Back to home</button>
  //       </div>
  //       <div style={{ marginTop: 18, color: "#6b7a70" }}>
  //         (Personality test remains available without login.)
  //       </div>
  //     </div>
  //   );
  // }
  //
  // I left it commented because you asked: "don't make it ask to login no matter what" -> we only ask when starting a test.

  function onStartClick(testId) {
    if (user) {
      // logged in => go straight to the test page
      navigate(`/skill-tests/${testId}`);
      return;
    }
    // not logged in => prompt sign-in modal with test id stored
    setSelectedTestId(testId);
    setShowLoginModal(true);
  }

  // Navigate to login page and forward the intended test route as next param
  function handleGoToLogin() {
    const next = selectedTestId ? `/skill-tests/${selectedTestId}` : "/skill-tests";
    navigate(`/login?next=${encodeURIComponent(next)}`);
  }

  // If you prefer a "continue as guest" option, implement it here.
  // For now we gate skill tests behind login (only modal is shown).

  return (
    <div className="ciq-container" style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back</button>

      <h1 style={{ fontSize: 42, margin: "6px 0 12px 0" }}>Skill Tests</h1>
      <p style={{ color: "#556b62", maxWidth: 880, marginBottom: 20 }}>
        Complete short skill tests to get domain scores. You can take tests in any order.
        Results will be combined with your personality profile in Insights.
        (Skill tests are saved to your profile — sign in to store results.)
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
            No tests found in the data file. Make sure data/questions.json exports {"{ tests: [...] }"}.
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

      {/* Login modal shown only when user tries to start while not logged in */}
      {showLoginModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ marginTop: 0 }}>Sign in to save your score</h3>
            <p style={{ color: "#556b62" }}>
              Skill test results are saved to your profile and used in Insights.
              Please sign in or create an account to continue.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
              onClick={() => openAuth({ tab: "login" })}
              className="ciq-primary"
              style={{ padding: "14px 34px", borderRadius: 28 }}
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
              After signing in you'll be redirected to the test you tried to start.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- inline modal styles (move to CSS if you prefer) --- */
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
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
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

import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; 
import testsBank from "../data/questions.json";
import Header from "../components/Header";
import { 
  BarChart2, Cpu, Languages, Calculator, Compass, Eye, Zap, 
  Lightbulb, Heart, MessageSquare, Code, Database, TrendingUp, 
  Users, ShieldCheck, CheckCircle2, Trophy, BookOpen,
  Play, CheckCircle, AlertCircle, Sparkles, Award, Layers
} from "lucide-react";

// Maps test categories to custom icons representing each skill domain
const getTestIcon = (testId) => {
  const map = {
    analytical: BarChart2,
    logical: Cpu,
    verbal: Languages,
    quantitative: Calculator,
    spatial: Compass,
    attention: Eye,
    decision_speed: Zap,
    creativity: Lightbulb,
    emotional: Heart,
    communication: MessageSquare,
    tech: Code,
    data: Database,
    business: TrendingUp,
    customer: Users,
    situational: ShieldCheck
  };
  return map[testId] || BookOpen;
};

export default function SkillTests() {
  const { user, openAuth } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'completed', 'pending'

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
    const matches = user.results.filter(r => r.testId === testId);
    if (matches.length === 0) return null;
    return matches.reduce((highest, current) => current.score > highest.score ? current : highest, matches[0]);
  };

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    if (!user || !user.results) return { completed: 0, avgScore: 0 };
    const uniqueTestsCompleted = new Set(user.results.map(r => r.testId));
    
    // Find best score for each unique completed test
    let totalScore = 0;
    uniqueTestsCompleted.forEach(id => {
      const best = getTestResult(id);
      if (best) totalScore += best.score;
    });

    const count = uniqueTestsCompleted.size;
    return {
      completed: count,
      avgScore: count > 0 ? Math.round(totalScore / count) : 0
    };
  }, [user]);

  // Filtering Logic
  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      const result = getTestResult(t.id);
      if (filterStatus === "completed") return !!result;
      if (filterStatus === "pending") return !result;
      return true;
    });
  }, [tests, filterStatus, user]);

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      {/* Navigation Header */}
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          {/* Header Title Section */}
          <div style={{ marginTop: 40, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ background: "rgba(6, 167, 125, 0.1)", padding: "6px 10px", borderRadius: 8, color: "#06a77d" }}>
                <Award size={18} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#06a77d" }}>
                Skills Mapping
              </span>
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: "#072827", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
              Practical Skill Verification Tests
            </h1>
            <p style={{ color: "#5b6a67", fontSize: 14.5, lineHeight: 1.6, maxWidth: 720, margin: 0 }}>
              Validate your strengths and discover growth areas. Complete these 5-minute quizzes to automatically calibrate your recommendation profile and align with optimal careers.
            </p>
          </div>

          {/* User Progress Stats Banner (If Logged In) */}
          {user && (
            <div 
              style={{
                background: "linear-gradient(135deg, #072827, #0b3d3a)",
                borderRadius: 16,
                padding: "20px 24px",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
                marginBottom: 30,
                boxShadow: "0 10px 24px rgba(7, 40, 39, 0.08)"
              }}
            >
              <div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "#9eb2ae", fontWeight: 700 }}>
                  Logged in as {user.name}
                </div>
                <h2 style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
                  Your Skills Profile Dashboard
                </h2>
              </div>

              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {/* Stats 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(6, 167, 125, 0.2)", color: "#06a77d", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9eb2ae", fontWeight: 700, textTransform: "uppercase" }}>Completed</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff" }}>{stats.completed} / {tests.length} Tests</div>
                  </div>
                </div>

                {/* Stats 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(6, 167, 125, 0.2)", color: "#06a77d", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center" }}>
                    <Trophy size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9eb2ae", fontWeight: 700, textTransform: "uppercase" }}>Average Score</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff" }}>{stats.avgScore}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Filters Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => setFilterStatus("all")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: filterStatus === "all" ? "1px solid #06a77d" : "1px solid #e2efe8",
                  background: filterStatus === "all" ? "linear-gradient(135deg, #eefbf7, #e2f7ef)" : "#ffffff",
                  color: filterStatus === "all" ? "#06a77d" : "#5b6a67",
                  transition: "all 0.15s"
                }}
              >
                All Tests ({tests.length})
              </button>
              <button 
                onClick={() => setFilterStatus("completed")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: filterStatus === "completed" ? "1px solid #06a77d" : "1px solid #e2efe8",
                  background: filterStatus === "completed" ? "linear-gradient(135deg, #eefbf7, #e2f7ef)" : "#ffffff",
                  color: filterStatus === "completed" ? "#06a77d" : "#5b6a67",
                  transition: "all 0.15s"
                }}
              >
                Completed ({stats.completed})
              </button>
              <button 
                onClick={() => setFilterStatus("pending")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: filterStatus === "pending" ? "1px solid #06a77d" : "1px solid #e2efe8",
                  background: filterStatus === "pending" ? "linear-gradient(135deg, #eefbf7, #e2f7ef)" : "#ffffff",
                  color: filterStatus === "pending" ? "#06a77d" : "#5b6a67",
                  transition: "all 0.15s"
                }}
              >
                Pending ({tests.length - stats.completed})
              </button>
            </div>
            
            <div style={{ fontSize: 13, color: "#5b6a67", fontWeight: 600 }}>
              Showing {filteredTests.length} of {tests.length} verification tests
            </div>
          </div>

          {/* Test Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {filteredTests.length === 0 && (
              <div style={{ padding: 40, background: "#ffffff", borderRadius: 16, border: "1px solid #e2efe8", color: "#6b7a70", gridColumn: "1/-1", textAlign: "center" }}>
                No skill tests match your filter selection.
              </div>
            )}

            {filteredTests.map((t) => {
              const result = getTestResult(t.id);
              const isCompleted = !!result;
              const TestIcon = getTestIcon(t.id);

              return (
                <div
                  key={t.id}
                  style={{
                    background: "#ffffff",
                    padding: 24,
                    borderRadius: 16,
                    border: isCompleted ? "1.5px solid #a3ebd5" : "1.5px solid rgba(6, 160, 120, 0.05)",
                    boxShadow: "0 8px 20px rgba(6, 95, 75, 0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 200,
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    position: "relative"
                  }}
                  className="ciq-card"
                >
                  <div>
                    {/* Badge header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2,
                        color: isCompleted ? "#06a77d" : "#5b6a67"
                      }}>
                        {t.id.replace("_", " ")}
                      </span>
                      {isCompleted ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 800, color: "#06a77d",
                          background: "#eefaf3", padding: "4px 10px", borderRadius: 8
                        }}>
                          <CheckCircle size={12} /> {result.score * 20}% Done
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#7a8c88",
                          background: "#f1f5f4", padding: "4px 10px", borderRadius: 8
                        }}>
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Test Title with Dynamic Icon */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                      <div 
                        style={{ 
                          width: 38, 
                          height: 38, 
                          borderRadius: 8, 
                          background: isCompleted ? "rgba(6, 167, 125, 0.08)" : "#f6fbf9",
                          color: isCompleted ? "#06a77d" : "#5b6a67",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <TestIcon size={18} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 17, color: "#072827", fontWeight: 700, lineHeight: 1.3 }}>
                        {t.title}
                      </h3>
                    </div>

                    <p style={{ color: "#6b7a70", fontSize: 13, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <BookOpen size={13} color="#9eb2ae" /> {Array.isArray(t.questions) ? t.questions.length : "—"} multiple-choice questions
                    </p>
                  </div>

                  <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => onStartClick(t.id)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: isCompleted ? "#f1faf6" : "linear-gradient(135deg, #06a77d, #04c48a)",
                        color: isCompleted ? "#06a77d" : "#ffffff",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        boxShadow: isCompleted ? "none" : "0 4px 12px rgba(6, 167, 125, 0.15)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        if (!isCompleted) {
                          e.currentTarget.style.boxShadow = "0 6px 16px rgba(6,167,125,0.3)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        } else {
                          e.currentTarget.style.background = "#e5f7ee";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isCompleted) {
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(6, 167, 125, 0.15)";
                          e.currentTarget.style.transform = "none";
                        } else {
                          e.currentTarget.style.background = "#f1faf6";
                        }
                      }}
                    >
                      <Play size={12} fill={isCompleted ? "none" : "currentColor"} /> 
                      {isCompleted ? "Retake Test" : "Start Test"}
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


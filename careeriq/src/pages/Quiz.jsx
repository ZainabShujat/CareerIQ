// src/pages/Quiz.jsx — Guided multi-step assessment
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Header from "../components/Header";
import { Brain, Compass, Sparkles, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

// 12-question Career Orientation questions
const ORIENTATION_QUESTIONS = [
  {
    q: "Which type of problem sounds more interesting to tackle?",
    optionA: "Fixing a technical bug or optimization issue in a software app",
    optionB: "Negotiating a deal, pitch, or convincing people of an innovative idea",
    mapA: { technology: 10 },
    mapB: { marketing: 10, business: 5 }
  },
  {
    q: "Which project would you rather work on?",
    optionA: "Analyzing statistical trends, charts, or financial numbers in detail",
    optionB: "Designing a marketing launch campaign or visual branding concepts",
    mapA: { research: 10 },
    mapB: { marketing: 10, creative: 5 }
  },
  {
    q: "Which work setting feels more appealing to you?",
    optionA: "A quiet, focused laboratory or database environment",
    optionB: "A dynamic, collaborative startup office or corporate boardroom",
    mapA: { research: 10 },
    mapB: { business: 10 }
  },
  {
    q: "How would you prefer to spend your day working?",
    optionA: "Writing code, configuring systems, or designing physical structures",
    optionB: "Coaching people, resolving personal queries, or advising clients",
    mapA: { technology: 10 },
    mapB: { education: 10, healthcare: 5 }
  },
  {
    q: "Which professional assignment sounds more satisfying?",
    optionA: "Resolving a legal policy debate or writing compliance standards",
    optionB: "Sketching interface screens, storyboard designs, or creating digital art",
    mapA: { law: 10 },
    mapB: { creative: 10 }
  },
  {
    q: "Where would you feel most accomplished making an impact?",
    optionA: "Improving public health and helping patients in a clinical setting",
    optionB: "Building secure networks, databases, and cybersecurity firewalls",
    mapA: { healthcare: 10 },
    mapB: { technology: 10 }
  },
  {
    q: "Which project sounds most exciting to lead?",
    optionA: "Creating visual branding assets, logos, and UI layout grids",
    optionB: "Developing curriculum plans or orchestrating social impact NGO projects",
    mapA: { creative: 10 },
    mapB: { education: 10 }
  },
  {
    q: "What would capture your attention more?",
    optionA: "Launching a business model, tracking sales, and optimizing systems",
    optionB: "Investigating biological mechanisms, genomics, or medical research",
    mapA: { business: 10 },
    mapB: { healthcare: 10, research: 5 }
  },
  {
    q: "Which subject would you prefer to read about?",
    optionA: "Constitutional governance, case law, and public administration",
    optionB: "Branding methodologies, SEO marketing, and target user psychology",
    mapA: { law: 10 },
    mapB: { marketing: 10 }
  },
  {
    q: "If you had to write a newsletter, which topic appeals to you?",
    optionA: "Reviewing market metrics, mathematical datasets, or research studies",
    optionB: "Sharing educational tips, learning strategies, or human interest stories",
    mapA: { research: 10 },
    mapB: { education: 10 }
  },
  {
    q: "Which corporate task would you rather own?",
    optionA: "Crafting business strategies and operations plans for expansion",
    optionB: "Representing clients in legal contracts and corporate governance",
    mapA: { business: 10, marketing: 5 },
    mapB: { law: 10 }
  },
  {
    q: "Which role is more aligned with your default contribution style?",
    optionA: "Building, programming, or designing the product architecture",
    optionB: "Providing empathy, teaching instructions, or caring for client needs",
    mapA: { technology: 10, creative: 5 },
    mapB: { healthcare: 5, education: 10 }
  }
];

// 27-question Likert scale Personality Questions (3 per trait)
const PERSONALITY_QUESTIONS = [
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

const LIKERT_OPTIONS = [
  { val: 1, label: "Strongly Disagree" },
  { val: 2, label: "Disagree" },
  { val: 3, label: "Neutral" },
  { val: 4, label: "Agree" },
  { val: 5, label: "Strongly Agree" }
];

const DOMAIN_MAX_POINTS = {
  technology: 40,
  business: 35,
  marketing: 35,
  research: 35,
  healthcare: 30,
  creative: 30,
  education: 40,
  law: 30
};

const TRAITS = ["curiosity", "creativity", "structure", "leadership", "social", "independence", "riskTolerance", "collaboration", "analytical"];

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

  // Guided Steps (0 to 11 = Orientation Questions, 12 to 38 = Personality Questions)
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("careerIQ_quiz_current_step");
    return saved ? Math.max(0, Math.min(38, Number(saved))) : 0;
  });

  const [orientationAnswers, setOrientationAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem("careerIQ_orientation_answers");
      return saved ? JSON.parse(saved) : Array(12).fill(0);
    } catch {
      return Array(12).fill(0);
    }
  });

  const [personalityAnswers, setPersonalityAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem("careerIQ_personality_answers");
      return saved ? JSON.parse(saved) : Array(27).fill(0);
    } catch {
      return Array(27).fill(0);
    }
  });

  // Submission Animation Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingSteps, setSubmittingSteps] = useState([
    { label: "Processing personality results", completed: false },
    { label: "Mapping career orientation", completed: false },
    { label: "Comparing against 150+ careers", completed: false },
    { label: "Generating recommendations", completed: false },
  ]);

  // Sync answers & step to localStorage
  useEffect(() => {
    localStorage.setItem("careerIQ_quiz_current_step", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("careerIQ_orientation_answers", JSON.stringify(orientationAnswers));
  }, [orientationAnswers]);

  useEffect(() => {
    localStorage.setItem("careerIQ_personality_answers", JSON.stringify(personalityAnswers));
  }, [personalityAnswers]);

  const handleOrientationSelect = (val) => {
    const updated = [...orientationAnswers];
    updated[currentStep] = val;
    setOrientationAnswers(updated);
    
    // Auto-advance with small delay for visual feedback
    setTimeout(() => {
      setCurrentStep(prev => Math.min(38, prev + 1));
    }, 150);
  };

  const handlePersonalitySelect = (val) => {
    const pIndex = currentStep - 12;
    const updated = [...personalityAnswers];
    updated[pIndex] = val;
    setPersonalityAnswers(updated);
    
    // Auto-advance with small delay
    if (currentStep < 38) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(38, prev + 1));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all progress?")) {
      setOrientationAnswers(Array(12).fill(0));
      setPersonalityAnswers(Array(27).fill(0));
      setCurrentStep(0);
      localStorage.removeItem("careerIQ_quiz_current_step");
      localStorage.removeItem("careerIQ_orientation_answers");
      localStorage.removeItem("careerIQ_personality_answers");
    }
  };

  const handleAutoFill = () => {
    // Fill Orientation
    const simOrientation = ORIENTATION_QUESTIONS.map(() => Math.floor(Math.random() * 2) + 1);
    setOrientationAnswers(simOrientation);

    // Fill Personality (positive responses mostly to keep recommendation engine happy)
    const simPersonality = PERSONALITY_QUESTIONS.map(() => Math.floor(Math.random() * 3) + 3);
    setPersonalityAnswers(simPersonality);

    // Skip to last question to allow immediate submission
    setCurrentStep(38);
  };

  // Compute final scores
  const computeScores = () => {
    // 1. Personality
    const pScores = {};
    TRAITS.forEach(trait => {
      const indices = PERSONALITY_QUESTIONS.map((q, i) => q.trait === trait ? i : -1).filter(i => i >= 0);
      const vals = indices.map(i => Number(personalityAnswers[i] || 0)).filter(v => v > 0);
      // Scale 1-5 to 0-100
      pScores[trait] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length - 1) * 25) : 50;
    });

    // 2. Career Orientation
    const oPoints = { technology: 0, business: 0, marketing: 0, research: 0, healthcare: 0, creative: 0, education: 0, law: 0 };
    orientationAnswers.forEach((ans, index) => {
      const q = ORIENTATION_QUESTIONS[index];
      if (ans === 1 && q.mapA) {
        Object.entries(q.mapA).forEach(([c, pts]) => { oPoints[c] = (oPoints[c] || 0) + pts; });
      } else if (ans === 2 && q.mapB) {
        Object.entries(q.mapB).forEach(([c, pts]) => { oPoints[c] = (oPoints[c] || 0) + pts; });
      }
    });

    const oScores = {};
    Object.keys(DOMAIN_MAX_POINTS).forEach(cluster => {
      const pts = oPoints[cluster] || 0;
      const maxPts = DOMAIN_MAX_POINTS[cluster];
      oScores[cluster] = Math.max(20, Math.round((pts / maxPts) * 100)); // base minimum score of 20%
    });

    return { personalityScores: pScores, orientationScores: oScores };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orientationAnswers.includes(0) || personalityAnswers.includes(0)) {
      alert("Please make sure you have answered all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    const { personalityScores, orientationScores } = computeScores();
    const payload = {
      scores: personalityScores,
      answers: personalityAnswers,
      careerOrientation: orientationScores,
      orientationAnswers: orientationAnswers,
      timestamp: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem("careerIQ_personality", JSON.stringify({ scores: personalityScores, answers: personalityAnswers, timestamp: payload.timestamp }));
    localStorage.setItem("careerIQ_orientation", JSON.stringify(orientationScores));

    // Clear progress persistence
    localStorage.removeItem("careerIQ_quiz_current_step");
    localStorage.removeItem("careerIQ_orientation_answers");
    localStorage.removeItem("careerIQ_personality_answers");

    // Sequence checks
    setTimeout(() => {
      setSubmittingSteps(prev => prev.map((s, i) => i === 0 ? { ...s, completed: true } : s));
    }, 600);

    setTimeout(() => {
      setSubmittingSteps(prev => prev.map((s, i) => i === 1 ? { ...s, completed: true } : s));
    }, 1200);

    setTimeout(() => {
      setSubmittingSteps(prev => prev.map((s, i) => i === 2 ? { ...s, completed: true } : s));
    }, 1800);

    setTimeout(() => {
      setSubmittingSteps(prev => prev.map((s, i) => i === 3 ? { ...s, completed: true } : s));
    }, 2400);

    // Call backend API if user is authenticated
    const token = localStorage.getItem("ciq_token");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/personality`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Failed to sync assessments to backend:", err);
      }
    }

    setTimeout(() => {
      navigate("/insights", { state: { personality: { scores: personalityScores }, orientation: orientationScores } });
    }, 2900);
  };

  // UI calculations
  const totalQuestions = 39;
  const isOrientation = currentStep < 12;
  const activeQuestionText = isOrientation
    ? ORIENTATION_QUESTIONS[currentStep].q
    : PERSONALITY_QUESTIONS[currentStep - 12].q;

  const currentProgressPercent = Math.round((currentStep / totalQuestions) * 100);

  // Styling
  const styles = {
    container: { maxWidth: 680, margin: "0 auto", padding: "40px 20px", fontFamily: "'Inter', sans-serif" },
    headerPanel: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    progressLabel: { fontSize: 13, fontWeight: 700, color: "var(--muted)" },
    progressBar: { height: 8, background: "#e6efe9", borderRadius: 8, overflow: "hidden", margin: "10px 0 24px" },
    progressFill: { width: `${currentProgressPercent}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-light))", transition: "width 0.3s ease" },
    card: { background: "#fff", padding: "36px 30px", borderRadius: 16, border: "1px solid #eef5f1", boxShadow: "0 15px 35px rgba(6, 95, 75, 0.04)" },
    sectionBadge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "#e6f9f1", color: "#065f4b", marginBottom: 20 },
    questionText: { fontSize: 21, fontWeight: 800, color: "#072827", lineHeight: 1.4, marginBottom: 28 },
    optionButton: (selected) => ({
      width: "100%", padding: "18px 22px", borderRadius: 12, border: selected ? "2.5px solid var(--accent)" : "1.5px solid #edf6ef",
      background: selected ? "#f0faf5" : "#fff", color: "#072827", textAlign: "left", fontSize: 15.5, fontWeight: selected ? 700 : 500,
      cursor: "pointer", transition: "all 0.2s ease", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
      boxShadow: selected ? "0 4px 12px rgba(6, 167, 125, 0.08)" : "none"
    }),
    bottomBar: { display: "flex", justifyContent: "space-between", marginTop: 28, alignItems: "center" },
    btnBack: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, background: "transparent", border: "1px solid #cfd8d4", color: "#2f5547", fontWeight: 600, cursor: "pointer" },
    btnNext: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" },
    submittingOverlay: {
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#f6fbf9", zIndex: 1000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20
    },
    tickItem: (completed) => ({
      display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600, color: completed ? "#0a6b55" : "#8ca89a",
      margin: "10px 0", transition: "color 0.3s ease"
    })
  };

  if (isSubmitting) {
    return (
      <div style={styles.submittingOverlay}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 450, width: "100%" }}>
          <div className="spinner" style={{
            width: 50, height: 50, border: "4px solid #e6efe9", borderTop: "4px solid var(--accent)",
            borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 32
          }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#072827", marginBottom: 24 }}>Analyzing Your Profile...</h2>
          <div style={{ alignSelf: "flex-start", width: "100%", padding: 20, background: "#fff", borderRadius: 12, border: "1px solid #eef5f1" }}>
            {submittingSteps.map((step, idx) => (
              <div key={idx} style={styles.tickItem(step.completed)}>
                {step.completed ? (
                  <CheckCircle size={20} style={{ color: "var(--accent)" }} />
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px dashed #cfd8d4" }} />
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      <Header />
      <main className="ciq-main" style={{ paddingBottom: 60 }}>
        <div style={styles.container}>
          {/* Top Info Bar */}
          <div style={styles.headerPanel}>
            <div style={styles.progressLabel}>
              {isOrientation ? (
                <span>Part 1: Career Orientation (Question {currentStep + 1} of 12)</span>
              ) : (
                <span>Part 2: Personality Assessment (Question {currentStep - 11} of 27)</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={handleAutoFill}
                style={{ background: "linear-gradient(135deg, #06a77d, #04c48a)", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                ⚡ Auto-Fill
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{ background: "#fff", border: "1px solid #cfd8d4", padding: "3px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", color: "#5b6a67" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.card}>
              {isOrientation ? (
                <div style={styles.sectionBadge}>
                  <Compass size={14} />
                  <span>Career Orientation</span>
                </div>
              ) : (
                <div style={styles.sectionBadge}>
                  <Brain size={14} />
                  <span>Personality Profile</span>
                </div>
              )}

              <h2 style={styles.questionText}>{activeQuestionText}</h2>

              {/* Options */}
              <div style={{ minHeight: 260 }}>
                {isOrientation ? (
                  <div>
                    <button
                      type="button"
                      style={styles.optionButton(orientationAnswers[currentStep] === 1)}
                      onClick={() => handleOrientationSelect(1)}
                    >
                      <span>{ORIENTATION_QUESTIONS[currentStep].optionA}</span>
                      {orientationAnswers[currentStep] === 1 && <Sparkles size={16} style={{ color: "var(--accent)" }} />}
                    </button>
                    <button
                      type="button"
                      style={styles.optionButton(orientationAnswers[currentStep] === 2)}
                      onClick={() => handleOrientationSelect(2)}
                    >
                      <span>{ORIENTATION_QUESTIONS[currentStep].optionB}</span>
                      {orientationAnswers[currentStep] === 2 && <Sparkles size={16} style={{ color: "var(--accent)" }} />}
                    </button>
                  </div>
                ) : (
                  <div>
                    {LIKERT_OPTIONS.map((opt) => {
                      const pIndex = currentStep - 12;
                      const isSelected = personalityAnswers[pIndex] === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          style={styles.optionButton(isSelected)}
                          onClick={() => handlePersonalitySelect(opt.val)}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Sparkles size={16} style={{ color: "var(--accent)" }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Nav Row */}
              <div style={styles.bottomBar}>
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  style={{ ...styles.btnBack, opacity: currentStep === 0 ? 0.4 : 1, cursor: currentStep === 0 ? "not-allowed" : "pointer" }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                {currentStep === 38 ? (
                  <button
                    type="submit"
                    disabled={orientationAnswers.includes(0) || personalityAnswers.includes(0)}
                    style={{
                      ...styles.btnNext,
                      background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                      boxShadow: "0 4px 15px rgba(6,167,125,0.25)"
                    }}
                  >
                    <span>Submit & See Results →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (isOrientation && orientationAnswers[currentStep] === 0) ||
                      (!isOrientation && personalityAnswers[currentStep - 12] === 0)
                    }
                    style={{
                      ...styles.btnNext,
                      opacity: (isOrientation && orientationAnswers[currentStep] === 0) ||
                               (!isOrientation && personalityAnswers[currentStep - 12] === 0) ? 0.5 : 1,
                      cursor: (isOrientation && orientationAnswers[currentStep] === 0) ||
                              (!isOrientation && personalityAnswers[currentStep - 12] === 0) ? "not-allowed" : "pointer"
                    }}
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Inline styles for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

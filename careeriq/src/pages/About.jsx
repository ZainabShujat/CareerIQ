import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      {/* Icon Navigation Header */}
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Header Title section */}
          <div style={{
            animation: "slideInDown 0.6s ease-out",
            textAlign: "center",
            marginTop: 40,
            marginBottom: 40
          }}>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 900,
                margin: "0 0 12px 0",
                background: "linear-gradient(135deg, #072827, #06a77d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-1px"
              }}
            >
              About CareerIQ
            </h1>
            <p
              className="muted"
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "#4a5a56",
                maxWidth: 680,
                margin: "0 auto"
              }}
            >
              An evidence-driven career recommendation engine matching your personality, skills, and life priorities using mathematical trait-vector alignment.
            </p>
          </div>

          {/* Staggered Content Area */}
          <div style={{ animation: "slideInUp 0.6s ease-out 0.1s both", display: "flex", flexDirection: "column", gap: 30 }}>
            
            {/* Core Card Section */}
            <section style={{
              background: "#ffffff",
              padding: 32,
              borderRadius: 16,
              border: "1px solid rgba(6, 160, 120, 0.08)",
              boxShadow: "0 10px 30px rgba(6, 95, 75, 0.04)"
            }}>
              <h3 style={{ marginTop: 0, fontSize: 22, color: "#072827", fontWeight: 800, marginBottom: 16 }}>Platform Workflow</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { step: "1", title: "Take the Assessment", desc: "A 27-item Likert personality questionnaire measuring 9 core work-preference and style traits." },
                  { step: "2", title: "Take Practical Skill Tests", desc: "Assess specific domains (analytical, tech, decision speed, emotional IQ) to map quantitative scores." },
                  { step: "3", title: "View Weighted Matches", desc: "The Weighted Directional Matching algorithm ranks careers without penalizing over-qualification." },
                  { step: "4", title: "Explore AI Insights & Paths", desc: "Get real-time Indian salary estimations, job market demand, emerging tool lists, and custom project roadmaps." }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg, #06a77d, #04c48a)",
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 16, flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(6,167,125,0.3)"
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: 16, color: "#072827", fontWeight: 700 }}>{item.title}</h4>
                      <p style={{ margin: 0, color: "#5b6a67", fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Methodology & Parameters */}
            <section style={{
              background: "#ffffff",
              padding: 32,
              borderRadius: 16,
              border: "1px solid rgba(6, 160, 120, 0.08)",
              boxShadow: "0 10px 30px rgba(6, 95, 75, 0.04)"
            }}>
              <h3 style={{ marginTop: 0, fontSize: 22, color: "#072827", fontWeight: 800, marginBottom: 8 }}>Methodology</h3>
              <p style={{ color: "#5b6a67", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>
                CareerIQ models careers as multidimensional trait vectors. We align user personality profiles, skill scores, and lifestyle values to rank jobs using a custom cosine similarity and distance matrix.
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16
              }}>
                <div style={{ padding: 18, borderRadius: 10, background: "#f8fffb", border: "1px solid #e2efe8" }}>
                  <strong style={{ display: "block", color: "#065f4b", marginBottom: 6 }}>No Over-qualification Penalty</strong>
                  <span style={{ fontSize: 13, color: "#5b6a67", lineHeight: 1.5, display: "block" }}>
                    exceeding a career's trait benchmark results in positive reinforcement, not a scoring penalty.
                  </span>
                </div>

                <div style={{ padding: 18, borderRadius: 10, background: "#f5f9ff", border: "1px solid #e2ebf8" }}>
                  <strong style={{ display: "block", color: "#1b4d8a", marginBottom: 6 }}>India-Specific Context</strong>
                  <span style={{ fontSize: 13, color: "#5b6a67", lineHeight: 1.5, display: "block" }}>
                    Salaries, employers, and hiring outlooks are mapped specifically to the Indian job market (LPA ranges).
                  </span>
                </div>
              </div>
            </section>

            {/* Actions / Exploration CTA */}
            <section style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "linear-gradient(135deg, #072827 0%, #051d1c 100%)",
              borderRadius: 16,
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ marginTop: 0, fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Ready to Explore Your Career Path?</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 500, margin: "0 auto 24px", fontSize: 14.5, lineHeight: 1.6 }}>
                Take the assessment or start testing specific skills to unlock personalized matching indices.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/quiz")}
                  className="ciq-cta"
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #06a77d, #04c48a)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(6,167,125,0.3)"
                  }}
                >
                  Start Assessment
                </button>
                <button
                  onClick={() => navigate("/careers")}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#e8f0ec",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  Browse Careers
                </button>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

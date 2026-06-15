// src/pages/Home.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import CategoriesGrid from "../components/CategoriesGrid";

/* Modern inline SVG icons */
const IconLaptop = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconDoctor = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const IconChef = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 18H18" />
    <path d="M6 14H18" />
    <path d="M3 10H21" />
    <path d="M12 2C8.13 2 5 5.13 5 9v1H19V9c0-3.87-3.13-7-7-7z" />
  </svg>
);

const IconElectrician = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06a77d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function ProfileButton() {
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);

  return (
    <button
      className="ciq-cta"
      onClick={() => {
        try {
          navigate("/profile");
        } catch (err) {
          console.warn("Router not available:", err);
          alert("Router not ready — try again");
        }
      }}
    >
      {ctx?.user ? ctx.user.name : "You"}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Scroll to "how it works" section
  const handleLearnMore = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="ciq-root">
      {/* Header */}
      <header className="ciq-header">
        <div className="ciq-container">
          <div className="ciq-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="ciq-title">CareerIQ</div>
            <div className="ciq-sub">career predictor & recommender</div>
          </div>

          <nav className="ciq-nav" role="navigation" aria-label="Main navigation">
            <Link to="/careers" className="ciq-link">Careers</Link>
            <Link to="/insights" className="ciq-link">Insights</Link>
            <Link to="/skill-tests" className="ciq-link">Skill Tests</Link>
            <Link to="/personality-test" className="ciq-link">Personality Test</Link>
            <Link to="/happiness-index" className="ciq-link">Happiness Index</Link>
            <Link to="/chatbot" className="ciq-link">AI Chatbot</Link>
            <Link to="/about" className="ciq-link">About</Link>
            <ProfileButton />
            <button
              className="mobile-toggle"
              aria-label="Toggle navigation"
              onClick={() => document.body.classList.toggle('mobile-nav-open')}
            >
              <span className="hamburger-inner" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="ciq-main" style={{ background: "#f6fbf9", paddingBottom: 60 }}>
        <div className="ciq-container">
          
          {/* HERO SECTION */}
          <section className="ciq-hero" style={{ minHeight: "80vh", padding: "60px 0" }}>
            <div className="ciq-pill" style={{ textTransform: "uppercase", letterSpacing: "1px", background: "#e6f9f1", color: "#06a77d" }}>
              ✨ AI-Powered Career Matching
            </div>
            
            <h1 className="ciq-h1" style={{ fontSize: "72px", fontWeight: "900", lineHeight: "1.1", marginBottom: "12px", textAlign: "center" }}>
              Confused about your career?
            </h1>
            <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#06a77d", marginTop: 0, marginBottom: "30px", textAlign: "center" }}>
              We'll help you find the perfect fit
            </h2>

            {/* Quick 3-Step Guide Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              width: "100%",
              maxWidth: "1000px",
              margin: "0 auto 36px auto",
              textAlign: "left"
            }}>
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.02)", border: "1px solid #eaf2ee" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#06a77d", textTransform: "uppercase", marginBottom: "8px" }}>Step 01</div>
                <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Answer 27 Questions</h3>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>A quick assessment about your personality, work style, and preferences.</p>
              </div>

              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.02)", border: "1px solid #eaf2ee" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#06a77d", textTransform: "uppercase", marginBottom: "8px" }}>Step 02</div>
                <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Get Matched</h3>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>AI analyzes and ranks 150+ careers specifically matching your traits.</p>
              </div>

              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.02)", border: "1px solid #eaf2ee" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#06a77d", textTransform: "uppercase", marginBottom: "8px" }}>Step 03</div>
                <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Make Your Choice</h3>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>Discover matching paths detailed with real salary, stress, and work-life balance data.</p>
              </div>
            </div>

            <p style={{ fontSize: "16px", color: "#5b6a67", maxWidth: "800px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
              From Software Engineer to Chef, Doctor to Electrician — we cover 150+ careers with real Indian market data.
            </p>

            {/* Bullet Stats horizontal row */}
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px", fontSize: "15px", fontWeight: "600", color: "#072827" }}>
              <span>⏱️ Only 5 minutes</span>
              <span style={{ color: "#cdd6d2" }}>|</span>
              <span>🎯 100% Personalized</span>
              <span style={{ color: "#cdd6d2" }}>|</span>
              <span>🎁 100% Free</span>
            </div>

            {/* CTAs Row */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
              <Link to="/quiz">
                <button className="ciq-primary" style={{ padding: "16px 36px", fontSize: "16px", borderRadius: "14px" }}>
                  Start Free Assessment Now
                </button>
              </Link>
              <button className="ciq-secondary" onClick={handleLearnMore} style={{ padding: "16px 28px", fontSize: "16px", borderRadius: "14px", background: "#ffffff" }}>
                How Does This Work?
              </button>
            </div>

            <p style={{ marginTop: "18px", color: "#5b6a67", fontSize: "13px" }}>
              ✅ No signup required to start • All salary data in Indian LPA • Works on mobile & desktop
            </p>
          </section>

          {/* POPULAR CAREERS IN INDIA */}
          <section style={{ padding: "40px 0", borderTop: "1px solid #eaf2ee" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0", textAlign: "center" }}>Popular Careers in India</h2>
            <p style={{ color: "#5b6a67", textAlign: "center", margin: "0 0 32px 0", fontSize: "15px" }}>
              Explore diverse career paths across key sectors in the Indian market.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px"
            }}>
              {/* Software Engineer */}
              <div className="pop-card" onClick={() => navigate("/careers/software-engineer")} style={{ cursor: "pointer", background: "#ffffff" }}>
                <div className="pop-left">
                  <div className="pop-icon" style={{ background: "#e6f9f1", color: "#06a77d" }}><IconLaptop /></div>
                  <div>
                    <div className="pop-name">Software Engineer</div>
                    <div className="pop-sub">Technology</div>
                  </div>
                </div>
                <div className="pop-sal-block">
                  <div className="pop-sal-top">Average</div>
                  <div className="pop-sal-bottom">₹8-15L</div>
                </div>
              </div>

              {/* Doctor */}
              <div className="pop-card" onClick={() => navigate("/careers/doctor")} style={{ cursor: "pointer", background: "#ffffff" }}>
                <div className="pop-left">
                  <div className="pop-icon" style={{ background: "#eaf2ee", color: "#06a77d" }}><IconDoctor /></div>
                  <div>
                    <div className="pop-name">Doctor</div>
                    <div className="pop-sub">Healthcare</div>
                  </div>
                </div>
                <div className="pop-sal-block">
                  <div className="pop-sal-top">Average</div>
                  <div className="pop-sal-bottom">₹10-25L</div>
                </div>
              </div>

              {/* Chef */}
              <div className="pop-card" onClick={() => navigate("/careers/chef")} style={{ cursor: "pointer", background: "#ffffff" }}>
                <div className="pop-left">
                  <div className="pop-icon" style={{ background: "#eaf2ee", color: "#06a77d" }}><IconChef /></div>
                  <div>
                    <div className="pop-name">Chef</div>
                    <div className="pop-sub">Culinary</div>
                  </div>
                </div>
                <div className="pop-sal-block">
                  <div className="pop-sal-top">Average</div>
                  <div className="pop-sal-bottom">₹4-12L</div>
                </div>
              </div>

              {/* Electrician */}
              <div className="pop-card" onClick={() => navigate("/careers/electrician")} style={{ cursor: "pointer", background: "#ffffff" }}>
                <div className="pop-left">
                  <div className="pop-icon" style={{ background: "#eaf2ee", color: "#06a77d" }}><IconElectrician /></div>
                  <div>
                    <div className="pop-name">Electrician</div>
                    <div className="pop-sub">Skilled Trades</div>
                  </div>
                </div>
                <div className="pop-sal-block">
                  <div className="pop-sal-top">Average</div>
                  <div className="pop-sal-bottom">₹3-8L</div>
                </div>
              </div>
            </div>
          </section>

          {/* FASTEST GROWING SECTORS IN INDIA */}
          <section style={{ padding: "60px 0", borderTop: "1px solid #eaf2ee" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div className="ciq-pill" style={{ background: "#e6f9f1", color: "#06a77d", textTransform: "uppercase" }}>
                📈 Live Market Insights
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "6px 0 8px 0" }}>Fastest Growing Sectors in India</h2>
              <p style={{ color: "#5b6a67", fontSize: "15px", margin: 0 }}>Where job opportunities and salaries are currently booming.</p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              marginBottom: "32px"
            }}>
              {/* IT & Digital */}
              <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #eaf2ee", boxShadow: "0 8px 22px rgba(6,10,12,0.02)" }}>
                <h3 style={{ fontSize: "20px", margin: "0 0 10px 0", fontWeight: "700" }}>Information Technology & Digital Services</h3>
                <div style={{ display: "inline-block", background: "#e6f9f1", color: "#06a77d", padding: "4px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", marginBottom: "16px" }}>
                  Avg. Starting: ₹15-18 LPA
                </div>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  The IT sector continues to lead Indian growth. High demand is concentrated in artificial intelligence, cloud architectures, and cybersecurity roles.
                </p>
              </div>

              {/* Healthcare & Pharma */}
              <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #eaf2ee", boxShadow: "0 8px 22px rgba(6,10,12,0.02)" }}>
                <h3 style={{ fontSize: "20px", margin: "0 0 10px 0", fontWeight: "700" }}>Healthcare & Pharmaceuticals</h3>
                <div style={{ display: "inline-block", background: "#e6f9f1", color: "#06a77d", padding: "4px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", marginBottom: "16px" }}>
                  Salary: Varies by role
                </div>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  India's health industry is expanding rapidly. Demand is booming for medical technologists, clinical practitioners, hospital managers, and research scientists.
                </p>
              </div>

              {/* Consumer Electronics */}
              <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #eaf2ee", boxShadow: "0 8px 22px rgba(6,10,12,0.02)" }}>
                <h3 style={{ fontSize: "20px", margin: "0 0 10px 0", fontWeight: "700" }}>Consumer Electronics & Manufacturing</h3>
                <div style={{ display: "inline-block", background: "#e6f9f1", color: "#06a77d", padding: "4px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", marginBottom: "16px" }}>
                  Salary: Varies by role
                </div>
                <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  Driven by the "Make in India" initiative, semiconductor layout, embedded engineering, and automated production sectors are seeing massive capital and hiring boosts.
                </p>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Link to="/careers">
                <button className="small-cta" style={{ display: "inline-flex", alignItems: "center", padding: "10px 20px" }}>
                  View Detailed Industry Trends <IconArrowRight />
                </button>
              </Link>
            </div>
          </section>

          {/* EXPLORE BY SECTOR */}
          <section style={{ padding: "40px 0", borderTop: "1px solid #eaf2ee" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0", textAlign: "center" }}>Explore by Sector</h2>
            <p style={{ color: "#5b6a67", textAlign: "center", margin: "0 0 32px 0", fontSize: "15px" }}>
              Quickly browse careers categorized under your primary interest area.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}>
              <Link to="/category/medical" style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "24px", textAlign: "center", background: "#ffffff" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Medical Careers</h3>
                  <p style={{ color: "#5b6a67", fontSize: "13px", margin: 0 }}>Clinical, nursing & research roles</p>
                </div>
              </Link>

              <Link to="/category/engineering" style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "24px", textAlign: "center", background: "#ffffff" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Engineering</h3>
                  <p style={{ color: "#5b6a67", fontSize: "13px", margin: 0 }}>Software, electrical, mechanical</p>
                </div>
              </Link>

              <Link to="/category/business" style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "24px", textAlign: "center", background: "#ffffff" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Business & Finance</h3>
                  <p style={{ color: "#5b6a67", fontSize: "13px", margin: 0 }}>Analyst, consultant & banking roles</p>
                </div>
              </Link>

              <Link to="/category/teaching" style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "24px", textAlign: "center", background: "#ffffff" }}>
                  <h3 style={{ fontSize: "18px", margin: "0 0 6px 0", fontWeight: "700" }}>Teaching & Education</h3>
                  <p style={{ color: "#5b6a67", fontSize: "13px", margin: 0 }}>Lecturers, schools & training</p>
                </div>
              </Link>
            </div>
          </section>

          {/* STATS COUNTER */}
          <section style={{
            background: "linear-gradient(135deg, #072827, #063c3a)",
            borderRadius: "20px",
            padding: "48px 20px",
            margin: "40px 0",
            color: "#ffffff"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "30px",
              textAlign: "center"
            }}>
              <div>
                <div style={{ fontSize: "48px", fontWeight: "900", color: "#06a77d" }}>150+</div>
                <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#cdd6d2", marginTop: "4px" }}>Career Options</div>
              </div>

              <div>
                <div style={{ fontSize: "48px", fontWeight: "900", color: "#06a77d" }}>27</div>
                <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#cdd6d2", marginTop: "4px" }}>Assessment Questions</div>
              </div>

              <div>
                <div style={{ fontSize: "48px", fontWeight: "900", color: "#06a77d" }}>6</div>
                <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#cdd6d2", marginTop: "4px" }}>Happiness Dimensions</div>
              </div>

              <div>
                <div style={{ fontSize: "48px", fontWeight: "900", color: "#06a77d" }}>10+</div>
                <div style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#cdd6d2", marginTop: "4px" }}>Skill Validation Tests</div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS TIMELINE */}
          <section id="how-it-works" style={{ padding: "60px 0", borderTop: "1px solid #eaf2ee" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0" }}>How it works</h2>
              <p style={{ color: "#5b6a67", fontSize: "15px", margin: 0 }}>Simple, scientific, and tailored for Indian professionals.</p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "30px"
            }}>
              {/* Step 1 */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#06a77d", opacity: 0.35, lineHeight: "1" }}>01</div>
                <div>
                  <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "700" }}>Take the comprehensive assessment</h3>
                  <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                    Answer 27 questions about your personality, work style, and what makes you happy in a career (~5 minutes).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#06a77d", opacity: 0.35, lineHeight: "1" }}>02</div>
                <div>
                  <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "700" }}>Get your AI profile</h3>
                  <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                    We analyze your responses across 9 personality trait dimensions, 7 skills, and 6 lifestyle priorities.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#06a77d", opacity: 0.35, lineHeight: "1" }}>03</div>
                <div>
                  <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "700" }}>Explore 150+ careers</h3>
                  <p style={{ color: "#5b6a67", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                    See ranked matches with stress levels, salary (LPA), work-life balance, and personalized happiness scores.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* KEY DIFFERENTIATORS / COMPARISON GRID */}
          <section style={{ padding: "40px 0", borderTop: "1px solid #eaf2ee" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "30px"
            }}>
              {/* Card 1: Built for India */}
              <div style={{ background: "#ffffff", padding: "32px", borderRadius: "18px", border: "1px solid #eaf2ee" }}>
                <h3 style={{ fontSize: "22px", margin: "0 0 18px 0", fontWeight: "800", color: "#072827" }}>Built for India</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Salary data in LPA (Lakhs Per Annum)</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> 150+ careers including vocational options</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Indian market-specific insights</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Real stress and work-life balance data</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Live market trends from the web</div>
                </div>
              </div>

              {/* Card 2: Science-backed matching */}
              <div style={{ background: "#ffffff", padding: "32px", borderRadius: "18px", border: "1px solid #eaf2ee" }}>
                <h3 style={{ fontSize: "22px", margin: "0 0 18px 0", fontWeight: "800", color: "#072827" }}>Science-backed Matching</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> 27-question comprehensive assessment</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> 9 personality trait dimensions</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> 6 job happiness factors</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Weighted career matching algorithm</div>
                  <div style={{ display: "flex", alignItems: "center" }}><IconCheck /> Customizable priority sliders</div>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC CATEGORY EXPLORER */}
          <section style={{ padding: "20px 0", borderTop: "1px solid #eaf2ee" }}>
            <CategoriesGrid max={6} />
          </section>

          {/* FINAL CTA BOTTOM BANNER */}
          <section style={{
            background: "linear-gradient(135deg, #06a77d, #058a68)",
            borderRadius: "20px",
            padding: "48px 32px",
            color: "#ffffff",
            marginTop: "40px",
            boxShadow: "0 10px 40px rgba(6,167,125,0.2)"
          }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                For Everyone
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", margin: "0 0 12px 0" }}>Ready to find your perfect career?</h2>
              <p style={{ fontSize: "16px", margin: "0 0 28px 0", lineHeight: 1.6, opacity: 0.9 }}>
                Take our free 5-minute assessment and discover careers that truly match who you are. Get personalized recommendations with salary insights, stress metrics, and skill-alignment diagnostics.
              </p>
              <Link to="/quiz">
                <button style={{
                  background: "#ffffff",
                  color: "#058a68",
                  padding: "16px 36px",
                  fontSize: "16px",
                  fontWeight: "800",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => e.target.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}
                >
                  Start Free Assessment (5 min)
                </button>
              </Link>
              <div style={{ fontSize: "13px", marginTop: "16px", opacity: 0.8 }}>
                No signup required • No credit card • Get instant results
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="ciq-footer">© 2026 CareerIQ</footer>
    </div>
  );
}

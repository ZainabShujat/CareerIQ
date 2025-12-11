// src/pages/Home.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
// top of file
import CategoriesGrid from "../components/CategoriesGrid";

// inside the Home component's JSX, wherever you want categories to appear:



/* Small icon components used on the homepage */
const IconLaptop = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 5h18v10H3z" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 21h8" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15v6" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDoctor = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2v20" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M5 8h14" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 20h8" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconChef = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 20h16" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 12c1-2 5-2 6 0" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 8c1.5-2 8-2 9 0" stroke="#065f4b" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ProfileButton: always navigates to /profile. Profile page will show auth or profile. */
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
  return (
    <div className="ciq-root">
      <header className="ciq-header">
        <div className="ciq-container">
          <div className="ciq-brand">
            <div className="ciq-title">CareerIQ</div>
            <div className="ciq-sub">AI-powered career recommender</div>
          </div>

          {/* main nav — includes direct category links so the nav doesn't redirect to generic page */}
          <nav className="ciq-nav" role="navigation" aria-label="Main navigation">
            <Link to="/careers" className="ciq-link">Careers</Link>
            <Link to="/insights" className="ciq-link">Insights</Link>
            <Link to="/skill-tests" className="ciq-link">Skill Tests</Link>

            
            <Link to="/personality-test" className="ciq-link">Personality Test</Link>
            <Link to="/happiness-index" className="ciq-link">Happiness Index</Link>
            <Link to="/about" className="ciq-link">About</Link>

            <ProfileButton />
          </nav>
        </div>
      </header>

      <main className="ciq-main">
        <div className="ciq-container ciq-grid">
          {/* HERO */}
          <section className="ciq-hero">
            <div className="ciq-pill">CareerIQ — AI-POWERED CAREER MATCHING</div>
            <h1 className="ciq-h1">Find careers aligned with who you are</h1>
            <p className="ciq-lead">
              Take a 7-minute assessment and discover careers that match your traits, with salary & work-life insights tailored to India.
            </p>

            <div className="ciq-cta-row">
              <Link to="/quiz"><button className="ciq-primary">Start Assessment</button></Link>
              <button className="ciq-secondary">Navigation Guide</button>
              <Link to="/careers" className="ciq-link" style={{ marginTop: 12, display: "inline-block" }}>
                Explore All Careers →
              </Link>
            </div>

            {/* Popular in hero (keeps the same visual layout you designed) */}
            <div className="popular-wrap">
              <h3 className="popular-title">Popular Careers in India</h3>

              <div className="popular-row">
                <Link to="/engineering-careers" style={{textDecoration: 'none'}} className="pop-link">
                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon"><IconLaptop /></div>
                      <div>
                        <div className="pop-name">Software Engineer</div>
                        <div className="muted pop-sub">Build products & platforms</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹8–</div>
                      <div className="pop-sal-bottom">15L</div>
                    </div>
                  </div>
                </Link>

                <Link to="/medical-careers" style={{textDecoration: 'none'}} className="pop-link">
                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon"><IconDoctor /></div>
                      <div>
                        <div className="pop-name">Doctor</div>
                        <div className="muted pop-sub">Clinical practice & research</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹10–</div>
                      <div className="pop-sal-bottom">25L</div>
                    </div>
                  </div>
                </Link>

                <Link to="/culinary-careers" style={{textDecoration: 'none'}} className="pop-link">
                  <div className="pop-card">
                    <div className="pop-left">
                      <div className="pop-icon"><IconChef /></div>
                      <div>
                        <div className="pop-name">Chef</div>
                        <div className="muted pop-sub">Culinary arts & hospitality</div>
                      </div>
                    </div>
                    <div className="pop-sal-block">
                      <div className="pop-sal-top">₹4–</div>
                      <div className="pop-sal-bottom">12L</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
          
          {/* POPULAR GRID */}
          <section className="ciq-popular">
            <h2>Popular Careers in India</h2>

            <div className="cards">
              <article className="card">
                <div className="card-head">
                  <div>
                    <h3>Software Engineer</h3>
                    <div className="muted">Technology</div>
                  </div>
                  <div className="sal">₹8–15 LPA</div>
                </div>
                <p className="muted">Build products, systems and services used by millions.</p>
                <div className="card-foot">
                  <Link to="/engineering-careers" className="small-cta">Explore</Link>
                </div>
              </article>

              <article className="card">
                <div className="card-head">
                  <div>
                    <h3>Doctor</h3>
                    <div className="muted">Healthcare</div>
                  </div>
                  <div className="sal">₹10–25 LPA</div>
                </div>
                <p className="muted">Clinical practice, research and public health.</p>
                <div className="card-foot">
                  <Link to="/medical-careers" className="small-cta">Explore</Link>
                </div>
              </article>

              <article className="card">
                <div className="card-head">
                  <div>
                    <h3>Teacher</h3>
                    <div className="muted">Education</div>
                  </div>
                  <div className="sal">₹3–12 LPA</div>
                </div>
                <p className="muted">Shape learners' futures in schools and colleges.</p>
                <div className="card-foot">
                  <Link to="/teaching-careers" className="small-cta">Explore</Link>
                </div>
              </article>
            </div>
          </section>
          {/* ------------------ HOW TO USE SECTION ------------------ */}
<section style={{
  padding: "50px 20px",
  maxWidth: "1100px",
  margin: "0 auto",
  marginTop: "40px",
  marginBottom: "60px",
  fontFamily: "'Inter', sans-serif"
}}>
  <h2 style={{
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "20px",
    textAlign: "center"
  }}>
    How to use CareerIQ
  </h2>

  <p style={{
    fontSize: "16px",
    color: "#5f6f66",
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 40px auto",
    lineHeight: 1.6
  }}>
    New here? No worries. CareerIQ helps you discover your strengths, explore roles, 
    and understand exactly where you fit. Follow these steps:
  </p>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px"
  }}>
    
    {/* 1 — Browse Careers */}
    <div style={{
      padding: "20px",
      background: "white",
      border: "1px solid #e6efe9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>1. Explore Careers</h3>
      <p style={{ color: "#56645f", fontSize: "15px", marginBottom: "12px" }}>
        Browse 150+ careers auto-categorized into engineering, design, finance, medical and more.
      </p>
      <a href="/careers" style={{
        padding: "8px 14px",
        border: "1px solid #cfd8d4",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#1a3c34",
        textDecoration: "none"
      }}>Start exploring →</a>
    </div>

    {/* 2 — Skill Tests */}
    <div style={{
      padding: "20px",
      background: "white",
      border: "1px solid #e6efe9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>2. Take Skill Tests</h3>
      <p style={{ color: "#56645f", fontSize: "15px", marginBottom: "12px" }}>
        Check how strong you are in reasoning, analytical thinking, verbal, and domain skills.
      </p>
      <a href="/skill-tests" style={{
        padding: "8px 14px",
        border: "1px solid #cfd8d4",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#1a3c34",
        textDecoration: "none"
      }}>Try tests →</a>
    </div>

    {/* 3 — Personality Test */}
    <div style={{
      padding: "20px",
      background: "white",
      border: "1px solid #e6efe9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>3. Personality Test</h3>
      <p style={{ color: "#56645f", fontSize: "15px", marginBottom: "12px" }}>
        Understand how your personality matches different roles and work styles.
      </p>
      <a href="/quiz" style={{
        padding: "8px 14px",
        border: "1px solid #cfd8d4",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#1a3c34",
        textDecoration: "none"
      }}>Take quiz →</a>
    </div>

    {/* 4 — Insights */}
    <div style={{
      padding: "20px",
      background: "white",
      border: "1px solid #e6efe9",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    }}>
      <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>4. Get Insights</h3>
      <p style={{ color: "#56645f", fontSize: "15px", marginBottom: "12px" }}>
        See personalised analysis combining your tests + personality + career interests.
      </p>
      <a href="/insights" style={{
        padding: "8px 14px",
        border: "1px solid #cfd8d4",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#1a3c34",
        textDecoration: "none"
      }}>View insights →</a>
    </div>

  </div>
</section>

          <CategoriesGrid max={12} />
        </div>
      </main>

      <footer className="ciq-footer">© 2025 CareerIQ </footer>
    </div>
  );
}

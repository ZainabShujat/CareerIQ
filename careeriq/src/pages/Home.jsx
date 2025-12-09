// src/pages/Home.jsx
import React, { useContext } from "react";
import { Link, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

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

/* ProfileButton: uses AuthContext and navigates to /profile when user exists */
function ProfileButton(){
  const navigate = useNavigate();
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const user = ctx?.user;
  const openAuth = ctx?.openAuth || (()=>{ alert("Auth not loaded"); });

  if (user) {
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
        {user.name}
      </button>
    );
  }

  return <button onClick={openAuth} className="ciq-cta">Profile</button>;
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

          {/* center nav: add all the page links you requested */}
          <nav className="ciq-nav" role="navigation" aria-label="Main navigation">
            <Link to="/careers" className="ciq-link">Careers</Link>
            <Link to="/insights" className="ciq-link">Insights</Link>
            <Link to="/skill-tests" className="ciq-link">Skill Tests</Link>

            {/* industry / category pages */}
            <Link to="/engineering-careers" className="ciq-link">Engineering</Link>
            <Link to="/medical-careers" className="ciq-link">Medical</Link>
            <Link to="/teaching-careers" className="ciq-link">Teaching</Link>
            <Link to="/culinary-careers" className="ciq-link">Culinary</Link>
            <Link to="/civil-careers" className="ciq-link">Civil & Infrastructure</Link>
            {/* tools & extras */}
            <Link to="/personality-test" className="ciq-link">Personality Test</Link>
            <Link to="/happiness-index" className="ciq-link">Happiness Index</Link>

            <Link to="/about" className="ciq-link">About</Link>

            {/* profile button (keeps auth modal / profile navigation) */}
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

            {/* Popular in hero */}
            <div className="popular-wrap">
              <h3 className="popular-title">Popular Careers in India</h3>

              <div className="popular-row">
                <Link to="/engineering-careers" style={{textDecoration: 'none'}}>
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

                <Link to="/medical-careers" style={{textDecoration: 'none'}}>
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

                <Link to="/culinary-careers" style={{textDecoration: 'none'}}>
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

          {/* ASIDE */}
          <aside className="ciq-aside">
            <div className="ciq-panel">
              <h4>Live Market Insights</h4>

              <div className="ciq-trend">
                <div className="t-left">
                  <div className="t-title">Data Science & AI</div>
                  <div className="t-sub">AI & ML hiring surge</div>
                </div>
                <div className="t-sal">₹8–35 LPA</div>
              </div>

              <div className="ciq-trend">
                <div className="t-left">
                  <div className="t-title">Cybersecurity</div>
                  <div className="t-sub">Rising cyber threats</div>
                </div>
                <div className="t-sal">₹6–30 LPA</div>
              </div>

              <div className="ciq-stats">
                <div>
                  <div className="big">100+</div>
                  <div className="muted">Career Options</div>
                </div>
                <div>
                  <div className="big">24</div>
                  <div className="muted">Questions</div>
                </div>
                <div>
                  <div className="big">6+</div>
                  <div className="muted">Skill Tests</div>
                </div>
              </div>
            </div>
          </aside>

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
        </div>
      </main>

      <footer className="ciq-footer">© 2025 CareerIQ </footer>
    </div>
  );
}

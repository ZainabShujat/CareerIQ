// src/App.jsx
import React, { useContext } from "react";
import "./App.css";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import ModalAuth from "./components/ModalAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";
import Insights from "./pages/Insights";
import SkillTests from "./pages/SkillTests";
import About from "./pages/About";
import Profile from "./pages/Profile";

/* small inline SVG components for crisp icons */
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

function ProfileButton(){
  // useNavigate requires the Router wrapper to exist (we added that earlier).
  const navigate = useNavigate();

  // safe access to AuthContext (won't crash if context is missing)
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const user = ctx?.user;
  const openAuth = ctx?.openAuth || (()=>{ alert("Auth not loaded"); });

  // if signed in -> navigate to profile page
  if (user) {
    return (
      <button
        className="ciq-cta"
        onClick={() => {
          // if for any reason navigate is not available, fallback to alert
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

  // not signed in -> open auth modal
  return <button onClick={openAuth} className="ciq-cta">Profile</button>;
}

export function Home() {
  return (
    <AuthProvider>
      <div className="ciq-root">
        <header className="ciq-header">
          <div className="ciq-container">
            <div className="ciq-brand">
              <div className="ciq-title">CareerIQ</div>
              <div className="ciq-sub">AI-powered career recommender</div>
            </div>

            <nav className="ciq-nav">
              <Link to="/careers" className="ciq-link">Careers</Link>
              <Link to="/insights" className="ciq-link">Insights</Link>
              <Link to="/skill-tests" className="ciq-link">Skill Tests</Link>
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
                <button className="ciq-primary">Start Assessment</button>
                <button className="ciq-secondary">Navigation Guide</button>
                <Link to="/careers" className="ciq-link" style={{ marginTop: 12, display: "inline-block" }}>
                 Explore All Careers →
                </Link>

              </div>

              {/* Popular in hero */}
              <div className="popular-wrap">
                <h3 className="popular-title">Popular Careers in India</h3>

                <div className="popular-row">
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
                    <Link to="/careers/se" className="small-cta">Explore</Link>
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
                    <Link to="/careers/doctor" className="small-cta">Explore</Link>
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
                  <p className="muted">Shape learners’ futures in schools and colleges.</p>
                  <div className="card-foot">
                    <Link to="/careers/teacher" className="small-cta">Explore</Link>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>

        <footer className="ciq-footer">© 2025 CareerIQ </footer>

        {/* ModalAuth will be rendered by the AuthProvider context */}
        <ModalAuth />
      </div>
    </AuthProvider>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />

          {/* Pages you created (we’ll fill them later) */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<CareerDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/skill-tests" element={<SkillTests />} />
          <Route path="/about" element={<About />} />

        </Routes>

        {/* global modal */}
        <ModalAuth />

      </BrowserRouter>
    </AuthProvider>
  );
}

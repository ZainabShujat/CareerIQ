// src/pages/Home.jsx
import React from "react";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";


export default function Home() {
  

  return (
    <div>
      <BackButton />
      {/* HERO — full width section; inner container centers content */}
      <section className="ciq-hero">
        <div className="ciq-hero-inner ciq-container">
          <Hero />
        </div>
      </section>

      {/* MAIN CONTENT (insights + popular) — limited-width container */}
      <section className="ciq-main-content">
        <div className="ciq-container ciq-grid-two">
          {/* Left column: Popular Careers */}
          <div className="main-left">
            {/* Popular Careers (we'll refine visuals next) */}
            <div className="popular-wrap" style={{ marginTop: 28 }}>
              <h3 className="popular-title">Popular Careers in India</h3>
              <div className="popular-row">
                <div className="pop-card">
                  <div className="pop-left">
                    <div className="pop-icon">💻</div>
                    <div>
                      <div className="pop-name">Software Engineer</div>
                      <div className="muted pop-sub">Build innovative software solutions</div>
                    </div>
                  </div>
                  <div className="pop-sal-block">
                    <div className="pop-sal-top">₹8–</div>
                    <div className="pop-sal-bottom">15L</div>
                  </div>
                </div>

                <div className="pop-card">
                  <div className="pop-left">
                    <div className="pop-icon">🩺</div>
                    <div>
                      <div className="pop-name">Doctor</div>
                      <div className="muted pop-sub">Save lives and improve health</div>
                    </div>
                  </div>
                  <div className="pop-sal-block">
                    <div className="pop-sal-top">₹10–</div>
                    <div className="pop-sal-bottom">25L</div>
                  </div>
                </div>

                <div className="pop-card">
                  <div className="pop-left">
                    <div className="pop-icon">🍳</div>
                    <div>
                      <div className="pop-name">Chef</div>
                      <div className="muted pop-sub">Create culinary masterpieces</div>
                    </div>
                  </div>
                  <div className="pop-sal-block">
                    <div className="pop-sal-top">₹4–</div>
                    <div className="pop-sal-bottom">12L</div>
                  </div>
                </div>
              </div>
            </div>

            {/* placeholder for other sections (we'll fill in after this looks right) */}
          </div>

          {/* Right column: aside / market insights */}
          <aside className="main-right">
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

              <div className="ciq-stats" style={{ marginTop: 12 }}>
                <div><div className="big">100+</div><div className="muted">Career Options</div></div>
                <div><div className="big">24</div><div className="muted">Questions</div></div>
                <div><div className="big">6+</div><div className="muted">Skill Tests</div></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

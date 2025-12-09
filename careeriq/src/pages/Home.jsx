// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-root">
      {/* Header (we reuse global header in App; this is a page-level wrapper) */}
      <div className="home-inner">

        {/* HERO */}
        <section id="hero" className="section hero">
          <div className="container">
            <div className="pill">CareerIQ — AI-POWERED CAREER MATCHING</div>
            <h1>Find careers aligned with who you are</h1>
            <p className="lead">Take a 7-minute assessment and discover careers that match your traits.</p>
            <div className="cta-row">
              <Link to="/quiz" className="btn primary">Start Assessment</Link>
              <a href="#nav-guide" className="btn secondary">Navigation Guide</a>
              <Link to="/careers" className="btn ghost">Explore All Careers →</Link>
            </div>
          </div>
        </section>

        {/* LIVE MARKET INSIGHTS + STATS (aside style) */}
        <section id="insights-aside" className="section insights-aside">
          <div className="container">
            <h3>Live Market Insights</h3>
            <div className="insights-rows">
              <div className="trend">Data Science & AI — AI & ML hiring surge — ₹8–35 LPA</div>
              <div className="trend">Cybersecurity — Rising demand — ₹6–30 LPA</div>
            </div>
            <div className="stats">
              <div>100+<div className="muted">Career Options</div></div>
              <div>24<div className="muted">Questions</div></div>
              <div>6+<div className="muted">Skill Tests</div></div>
            </div>
          </div>
        </section>
        {/* POPULAR CAREERS ROW (3 cards) */}
        <section id="popular-row" className="section popular-row">
          <div className="container">
            <h3>Popular Careers in India</h3>
            <div className="row-cards">
              <div className="card">Software Engineer — ₹8–15 LPA</div>
              <div className="card">Doctor — ₹10–25 LPA</div>
              <div className="card">Teacher — ₹3–12 LPA</div>
            </div>
          </div>
        </section>

        {/* POPULAR GRID (vertical cards) */}
        <section id="popular-grid" className="section popular-grid">
          <div className="container">
            <h3>Popular Roles</h3>
            <div className="grid-cards">
              <div className="card">Software Engineer — explore →</div>
              <div className="card">Doctor — explore →</div>
              <div className="card">Teacher — explore →</div>
            </div>
          </div>
        </section>

        {/* CATEGORY PREVIEWS (5 categories placeholders) */}
        <section id="categories" className="section categories">
          <div className="container">
            <h3>Top Categories</h3>

            <div className="category-block">
              <h4>Engineering</h4>
              <div className="category-preview">[3 cards placeholder]</div>
            </div>

            <div className="category-block">
              <h4>Medical</h4>
              <div className="category-preview">[3 cards placeholder]</div>
            </div>

            <div className="category-block">
              <h4>Teaching</h4>
              <div className="category-preview">[3 cards placeholder]</div>
            </div>

            <div className="category-block">
              <h4>Culinary</h4>
              <div className="category-preview">[3 cards placeholder]</div>
            </div>

            <div className="category-block">
              <h4>Civil & Public Service</h4>
              <div className="category-preview">[3 cards placeholder]</div>
            </div>

          </div>
        </section>

        {/* PERSONALITY TEST BANNER */}
        <section id="personality-banner" className="section personality">
          <div className="container">
            <h3>Personality Test — 24 questions</h3>
            <p>Understand your strengths and see tailored career matches.</p>
            <Link to="/personality-test" className="btn primary">Take Personality Test</Link>
          </div>
        </section>

        {/* HAPPINESS INDEX (placeholder) */}
        <section id="happiness" className="section happiness">
          <div className="container">
            <h3>Happiness • Stability • Money</h3>
            <p>Adjust sliders and see matching careers (placeholder).</p>
            <div className="happiness-placeholder">[Happiness index UI goes here]</div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="section testimonials">
          <div className="container">
            <h3>What people say</h3>
            <div className="quotes">
              <blockquote>"CareerIQ helped me decide my next step." — A</blockquote>
              <blockquote>"Insightful and practical." — B</blockquote>
              <blockquote>"Fun test; clear results." — C</blockquote>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="section footer">
          <div className="container">
            <div className="footer-columns">
              <div>CareerIQ</div>
              <div>Links: Careers · Tests · Insights · About</div>
              <div>© 2025 CareerIQ</div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

// src/pages/Home.jsx
import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import AsideInsights from "../components/AsideInsights";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <div className="ciq-container ciq-grid" style={{ paddingTop: 8 }}>
          {/* left: popular grid (wider) */}
          <section className="ciq-popular" style={{ flex: 1 }}>
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

          {/* right: aside insights panel */}
          <div style={{ width: 360 }}>
            <AsideInsights />
          </div>
        </div>
      </main>
      <footer className="ciq-footer" style={{ marginTop: 32 }}>© 2025 CareerIQ — Indian market data (demo)</footer>
    </>
  );
}


//ok 

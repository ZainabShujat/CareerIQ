// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import IconNav from "./iconNav";

export default function Header() {
  return (
    <header className="ciq-header-global">
      <div className="ciq-header-top">
        <div className="ciq-container ciq-header-inner">
          <Link to="/" className="ciq-brand">
            {/* Inline logo for reliability (paste an <img> if you have a logo file) */}
            <svg className="ciq-logo" width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden>
              <circle cx="24" cy="24" r="22" fill="#E6FFFA"/>
              <path d="M14 28c3-6 10-6 13 0" stroke="#065f4b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 16v12" stroke="#065f4b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <div className="ciq-brand-text">
              <div className="ciq-title">CareerIQ</div>
              <div className="ciq-sub">CAREER RECOMMENDER</div>
            </div>
          </Link>

          <nav className="ciq-nav-links" aria-label="Main navigation">
            <Link className="ciq-link" to="/careers">Careers</Link>
            <Link className="ciq-link" to="/insights">Insights</Link>
            <Link className="ciq-link" to="/skill-tests">Skill Tests</Link>
            <Link className="ciq-cta" to="/profile">Profile</Link>
          </nav>
        </div>
      </div>

      {/* Icon strip inside same header container (right-aligned icons row) */}
      <div className="ciq-header-icons">
        <div className="ciq-container ciq-header-inner">
          <IconNav />
        </div>
      </div>
    </header>
  );
}

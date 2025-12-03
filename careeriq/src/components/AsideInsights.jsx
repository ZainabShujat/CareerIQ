// src/components/AsideInsights.jsx
import React from "react";

export default function AsideInsights() {
  return (
    <aside className="ciq-aside-panel">
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

        <div className="ciq-stats" aria-hidden>
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
  );
}

//ok
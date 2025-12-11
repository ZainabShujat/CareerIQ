import React, { useState, useEffect } from "react";
import careersData from "../data/careers.json";

function matchScore(career, sliders) {
  const salaryNum = (() => {
    if (!career.salary) return 50;
    const m = String(career.salary).match(/(\d+(?:\.\d+)?)/);
    if (!m) return 50;
    // normalize to 0-100 using LPA as base (assume value is in LPA)
    let v = Number(m[1]);
    // if salary looks like 10000 (unlikely) clamp sensibly
    if (v > 100) v = Math.min(100, Math.round(v / 1));
    return Math.max(0, Math.min(100, v));
  })();

  const stress = career.stress ?? 50;
  const worklife = career.worklife ?? 50;

  const ds = Math.abs(salaryNum - (sliders.salary || 50));
  const dt = Math.abs(stress - (sliders.stress || 50));
  const dw = Math.abs(worklife - (sliders.worklife || 50));
  const maxDistance = 150;
  const dist = ds + dt + dw;
  const score = Math.round(((maxDistance - dist) / maxDistance) * 100);
  return Math.max(0, Math.min(100, score));
}

export default function Results() {
  const [sliders, setSliders] = useState({ salary: 70, stress: 40, worklife: 60 });
  const [sorted, setSorted] = useState([]);

  const careers = Array.isArray(careersData) ? careersData : [];

  useEffect(() => {
    const withScore = careers.map((c) => ({ ...c, match: matchScore(c, sliders) }));
    withScore.sort((a, b) => b.match - a.match);
    setSorted(withScore);
  }, [sliders, careers]);

  // Small inline styles to ensure layout works even if Tailwind isn't configured
  const containerStyle = { padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' };
  const panelStyle = { background: "#fff", padding: 14, borderRadius: 10, boxShadow: "0 1px 4px rgba(10,20,15,0.04)", border: "1px solid #eef7f2" };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Your Results & Happiness Index</h1>
      <p style={{ color: '#556', marginTop: 0, marginBottom: 18 }}>Adjust sliders to reflect your preferences. Matches update live.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
        {/* LEFT: sliders + quick summary */}
        <aside style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Preferences</h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Salary preference: <strong>{sliders.salary}</strong></label>
            <input type="range" min="0" max="100" value={sliders.salary}
              onChange={(e) => setSliders(s => ({ ...s, salary: Number(e.target.value) }))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Stress tolerance: <strong>{sliders.stress}</strong></label>
            <input type="range" min="0" max="100" value={sliders.stress}
              onChange={(e) => setSliders(s => ({ ...s, stress: Number(e.target.value) }))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Work-life balance: <strong>{sliders.worklife}</strong></label>
            <input type="range" min="0" max="100" value={sliders.worklife}
              onChange={(e) => setSliders(s => ({ ...s, worklife: Number(e.target.value) }))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            <div><strong>Top match</strong>: {sorted[0]?.title || '—'}</div>
            <div style={{ marginTop: 6 }}>Matches are computed by comparing your sliders against typical role attributes.</div>
          </div>
        </aside>

        {/* RIGHT: matches list */}
        <main>
          <section style={{ marginBottom: 12 }}>
            <h2 style={{ margin: '0 0 8px 0' }}>Top career matches</h2>
            <div style={{ color: '#444', marginBottom: 6 }}>Results shown below — click a career to view details (if available).</div>
          </section>

          <div style={{ display: 'grid', gap: 12 }}>
            {sorted.length === 0 ? (
              <div style={panelStyle}>No careers available.</div>
            ) : (
              sorted.slice(0, 30).map((c) => (
                <article key={c.id || c.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', ...panelStyle }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{c.title}</h3>
                    <p style={{ margin: '6px 0', color: '#556' }}>{c.short}</p>
                    <div style={{ fontSize: 13, color: '#777' }}>{(c.tags || []).join(', ')}</div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 110 }}>
                    <div style={{ fontWeight: 700 }}>{c.salary || '—'}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: c.match >= 75 ? '#14632a' : c.match >= 50 ? '#b76' : '#666' }}>{`Match ${c.match}%`}</div>
                    <div style={{ marginTop: 8 }}>
                      {/* optionally link to career detail if route exists */}
                      <a href={`/careers/${c.slug || c.id}`} style={{ fontSize: 13, color: '#065f4b', textDecoration: 'none' }}>View</a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Accessibility + small footer note */}
      <div style={{ marginTop: 18, fontSize: 13, color: '#666' }}>
        Tip: Use keyboard arrows to move sliders. Matches update instantly.
      </div>
    </div>
  );
}

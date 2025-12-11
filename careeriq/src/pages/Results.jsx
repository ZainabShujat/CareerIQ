// src/pages/HappinessIndex.jsx
import React, { useState, useMemo } from "react";
import BackButton from "../components/BackButton";
import careers from "../data/careers.json"; // your careers-100.json

function Slider({ label, min=0, max=100, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="muted">{label}</div>
        <div>{value}</div>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e)=>onChange(Number(e.target.value))} />
    </div>
  );
}

export default function HappinessIndex() {
  const [salary, setSalary] = useState(50);
  const [stress, setStress] = useState(50);
  const [wl, setWl] = useState(50);

  // convert salary slider into rough LPA target
  function scoreCareer(c) {
    // parse numeric min
    const m = (c.salary || "").match(/(\d+)(?=\s*–|\s*-\s*|LPA|L)/);
    const min = m ? Number(m[1]) : 8;
    // map career attributes to 0-100 score (simple heuristics)
    const sSalary = Math.max(0, Math.min(100, (min / 25) * 100));
    // use tags to approximate stress/worklife: engineering -> heavier stress; teaching -> better WL
    const tags = (c.tags || []).map(t => t.toLowerCase());
    const stressEstimate = tags.includes("engineering") ? 70 : tags.includes("teaching") ? 30 : 50;
    const wlEstimate = 100 - stressEstimate;

    const dSalary = 100 - Math.abs(sSalary - salary);
    const dStress = 100 - Math.abs(stressEstimate - stress);
    const dWl = 100 - Math.abs(wlEstimate - wl);

    return Math.round((dSalary * 0.45) + (dStress * 0.25) + (dWl * 0.3));
  }

  const matches = useMemo(() => {
    const list = (careers || []).map(c => ({ career: c, score: scoreCareer(c) }))
      .sort((a,b)=>b.score-a.score)
      .slice(0,12);
    return list;
  }, [salary, stress, wl]);

  // save preferences for Insights page
  React.useEffect(() => {
    localStorage.setItem("ciq_happiness", JSON.stringify({ salary, stress, wl }));
  }, [salary, stress, wl]);

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Happiness Index</h1>
      <p className="muted">Slide the sliders to express your priorities and discover careers that match them.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20, marginTop: 20 }}>
        <div>
          <div className="card" style={{ padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>Your priorities</h3>
            <Slider label="Salary priority" value={salary} onChange={setSalary} />
            <Slider label="Stress tolerance (higher = can handle more stress)" value={stress} onChange={setStress} />
            <Slider label="Work-life balance priority (higher = better balance preferred)" value={wl} onChange={setWl} />
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Top matches</h4>
            <div style={{ display: "grid", gap: 10 }}>
              {matches.map((m, i) => (
                <div key={m.career.id || m.career.slug} className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{m.career.title}</strong>
                      <div className="muted" style={{ fontSize: 13 }}>{m.career.short}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>{m.career.salary}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{m.score}% match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="card" style={{ padding: 12 }}>
            <h4>How scores work</h4>
            <div className="muted">We compare your slider values to career estimates and rank by closeness. This helps you prioritise salary vs wellbeing.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

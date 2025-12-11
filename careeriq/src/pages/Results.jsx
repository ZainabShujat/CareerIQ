import React, { useState, useEffect } from "react";
import careersData from "../data/careers.json";

function matchScore(career, sliders) {
  // attempt to normalize salary to a 0-100 scale if it's numeric-like
  const salaryNum = (() => {
    if (!career.salary) return 50;
    const s = String(career.salary).match(/\d+/);
    return s ? Math.min(100, Math.max(0, Number(s[0]))) : 50;
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

  const careers = Array.isArray(careersData) && careersData.length ? careersData : [];

  useEffect(() => {
    const withScore = careers.map(c => ({ ...c, match: matchScore(c, sliders) }));
    withScore.sort((a, b) => b.match - a.match);
    setSorted(withScore);
  }, [sliders, careers]);

  useEffect(() => {
    // Also load latest quiz from localStorage and optionally compute aggregated happiness — optional
    const tests = JSON.parse(localStorage.getItem("ciq_latest_tests") || "null");
    // if (tests) { ... }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Results & Happiness Index</h1>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block mb-2">Salary preference: {sliders.salary}</label>
          <input type="range" min="0" max="100" value={sliders.salary}
            onChange={(e) => setSliders(s => ({ ...s, salary: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block mb-2">Stress tolerance: {sliders.stress}</label>
          <input type="range" min="0" max="100" value={sliders.stress}
            onChange={(e) => setSliders(s => ({ ...s, stress: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block mb-2">Work-life balance: {sliders.worklife}</label>
          <input type="range" min="0" max="100" value={sliders.worklife}
            onChange={(e) => setSliders(s => ({ ...s, worklife: Number(e.target.value) }))} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-4">Top career matches</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.slice(0, 20).map(c => (
            <div key={c.id || c.slug} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-slate-600">{c.short}</p>
                <div className="text-xs text-slate-500 mt-2">{c.tags && c.tags.join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{c.salary || "—"}</div>
                <div className="text-sm text-slate-500">Match {c.match}%</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

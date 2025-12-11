// src/pages/Results.jsx
import React, { useState, useEffect } from "react";
import CareerCard from "../components/CareerCard.jsx";

const sampleCareers = [
  { id: 1, name: "Frontend Developer", salary: 80, stress: 40, worklife: 60 },
  { id: 2, name: "Data Analyst", salary: 70, stress: 50, worklife: 55 },
  { id: 3, name: "UX Designer", salary: 65, stress: 30, worklife: 75 },
  { id: 4, name: "Project Manager", salary: 75, stress: 70, worklife: 45 },
  // replace with careers-100.json mapping when available
];

function matchScore(career, sliders) {
  // lower distance is better. transform to score 0-100
  const ds = Math.abs((career.salary || 50) - (sliders.salary || 50));
  const dt = Math.abs((career.stress || 50) - (sliders.stress || 50));
  const dw = Math.abs((career.worklife || 50) - (sliders.worklife || 50));
  const maxDistance = 150; // 3 * 50
  const dist = ds + dt + dw;
  const score = Math.round(((maxDistance - dist) / maxDistance) * 100);
  return score;
}

export default function Results() {
  const [sliders, setSliders] = useState({ salary: 70, stress: 40, worklife: 60 });
  const [sorted, setSorted] = useState([]);

  useEffect(() => {
    // compute scores and sort descending
    const withScore = sampleCareers.map(c => ({ ...c, match: matchScore(c, sliders) }));
    withScore.sort((a, b) => b.match - a.match);
    setSorted(withScore);
  }, [sliders]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Happiness Index</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Salary: {sliders.salary}</label>
          <input type="range" min="0" max="100" value={sliders.salary}
            onChange={(e) => setSliders(s => ({ ...s, salary: Number(e.target.value) }))} />
        </div>
        <div>
          <label>Stress: {sliders.stress}</label>
          <input type="range" min="0" max="100" value={sliders.stress}
            onChange={(e) => setSliders(s => ({ ...s, stress: Number(e.target.value) }))} />
        </div>
        <div>
          <label>Work-life: {sliders.worklife}</label>
          <input type="range" min="0" max="100" value={sliders.worklife}
            onChange={(e) => setSliders(s => ({ ...s, worklife: Number(e.target.value) }))} />
        </div>
      </div>

      <div>
        <h3 className="mb-2">Matches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(c => (
            <div key={c.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{c.name}</strong>
                  <div className="text-sm text-muted">Match: {c.match}%</div>
                </div>
                <div className="text-sm">{c.match >= 75 ? "Great fit" : c.match >= 50 ? "Okay" : "Consider other roles"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

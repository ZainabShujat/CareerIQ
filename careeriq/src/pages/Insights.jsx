// src/pages/Insights.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function Insights() {
  const { user, fetchProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Example payload construction — adjust to your app's state
  async function handleGenerate() {
    setError("");
    setLoading(true);
    try {
      // Fetch latest profile if available
      const profile = user ? await fetchProfile().catch(() => user) : { name: "Guest" };

      // For tests/happiness, you might pull them from local state or an API.
      // Here we send a minimal example — your app should replace with real test data.
      const payload = {
        profile,
        tests: {
          topSkill: "programming",
          scores: { programming: 72, data: 55, design: 40 }
        },
        happiness: { salary: 70, stress: 30, worklife: 60 }
      };

      const res = await fetch(`${API_BASE}/api/ai/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to generate insights");
      } else {
        setResult(data);
      }
    } catch (e) {
      console.error(e);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-3">Career Insights</h2>
      <p className="mb-4">Generate personalised career recommendations based on your tests and happiness sliders.</p>

      <button onClick={handleGenerate} disabled={loading} className="btn">
        {loading ? "Generating..." : "Generate Insights"}
      </button>

      {error && <div className="mt-3 text-red-600">{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <strong>Summary</strong>
            <p>{result.narrative}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <strong>Recommendations</strong>
            <ul className="list-disc pl-6 mt-2">
              {result.recommendations?.map((r, i) => (
                <li key={i}>
                  <b>{r.title}</b> — {r.confidence}. <span className="text-muted">{r.reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <strong>Strengths</strong>
              <ul className="list-disc pl-6 mt-2">
                {result.strengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <strong>Weaknesses</strong>
              <ul className="list-disc pl-6 mt-2">
                {result.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <strong>Action Plan</strong>
              <ol className="list-decimal pl-6 mt-2">
                {result.actionPlan?.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <strong>Resources</strong>
            <ul className="list-disc pl-6 mt-2">
              {result.resources?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

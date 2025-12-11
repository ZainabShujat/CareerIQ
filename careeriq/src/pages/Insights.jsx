// src/pages/Insights.jsx
import React, { useState, useContext } from "react";
import BackButton from "../components/BackButton";
import Chatbot from "../components/Chatbot";
import { AuthContext } from "../contexts/AuthContext";

export default function Insights() {
  const { user, fetchProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const profile = user ? await fetchProfile() : { name: "Guest" };
      // gather simple skill/test/happiness placeholders from localStorage or empty
      const tests = JSON.parse(localStorage.getItem("ciq_latest_tests") || "null") || {};
      const happiness = JSON.parse(localStorage.getItem("ciq_happiness") || "null") || {};

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, tests, happiness }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "AI error");
      }
      const json = await res.json();
      setResult(json);
    } catch (e) {
      console.error("Insights error", e);
      setError(e.message || "Failed to generate insights");
    } finally { setLoading(false); }
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Insights & Career Analysis</h1>
      <p className="muted">Actionable analysis from your profile, tests, and preferences.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginTop: 20 }}>
        <div>
          <div className="card" style={{ padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>Generate tailored insights</h3>
            <p className="muted">Uses your profile, saved tests and happiness sliders.</p>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="ciq-primary" onClick={generate} disabled={loading}>
                {loading ? "Generating…" : "Generate insights"}
              </button>
              <button className="small-cta" onClick={() => { setResult(null); setError(null); }}>
                Reset
              </button>
            </div>
          </div>

          {error && <div style={{ marginTop: 12 }} className="card"><div className="muted" style={{ color: "#8b1e1e" }}>{error}</div></div>}

          {result && (
            <div style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 14 }}>
                <h3>Top recommendations</h3>
                {(result.recommendations || []).map((r, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>{r.title} <span className="muted" style={{ fontWeight: 400 }}>({r.confidence || "—"})</span></div>
                    <div className="muted" style={{ marginTop: 6 }}>{r.reason || r.explanation || ""}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 12, padding: 14 }}>
                <h3>Action plan</h3>
                {(result.actionPlan || []).map((a, i) => <div key={i} className="muted" style={{ marginBottom: 8 }}>{i+1}. {a}</div>)}
                <div style={{ marginTop: 8 }}>
                  <strong>Resources</strong>
                  <div className="muted">{(result.resources || []).join(", ")}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="card" style={{ padding: 12 }}>
            <h4>Assistant</h4>
            <div className="muted" style={{ marginBottom: 8 }}>Ask follow-ups to refine your path.</div>
            <Chatbot initialContext={[
              { role: "system", content: "You are a friendly career assistant. Keep answers concise and practical." },
              { role: "user", content: "I want career advice tailored to my profile." }
            ]} />
          </div>

          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            <h5>Tips</h5>
            <ul className="muted">
              <li>Update your profile to improve suggestions.</li>
              <li>Take skill tests for more accurate matches.</li>
              <li>Use Happiness Index to prioritise lifestyle preferences.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

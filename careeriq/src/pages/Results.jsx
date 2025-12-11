// src/pages/Results.jsx
import React, { useEffect, useState, useContext } from "react";
import BackButton from "../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Results() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/results", { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          console.warn("results fetch failed", res.status, t);
          setResults([]);
          return;
        }
        const json = await res.json();
        setResults(json || []);
      } catch (err) {
        console.error("Failed to fetch results", err);
        setResults([]);
      } finally {
        mounted && setLoading(false);
      }
    };
    fetchResults();
    return () => (mounted = false);
  }, [user]);

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Your Results</h1>
      <p className="muted">Your top matches will appear here after completing the quiz.</p>

      {loading ? (
        <div style={{ marginTop: 24 }}>Loading results…</div>
      ) : !results || results.length === 0 ? (
        <div style={{ marginTop: 24 }} className="card">
          <h3>No results yet</h3>
          <p className="muted">Take an assessment to generate matches and save your results.</p>
          <div style={{ marginTop: 12 }}>
            <Link to="/quiz" className="ciq-primary">Take the test</Link>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {results.map((r) => (
            <div key={r._id || r.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Result</strong>
                  <div className="muted">{new Date(r.takenAt || r.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <Link to={`/results/${r._id || r.id}`} className="small-cta">View</Link>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="muted">Score:</div>
                <div style={{ fontWeight: 700 }}>{r.score ?? "—"} / {r.total ?? "—"}</div>
                <div style={{ marginTop: 8 }} className="muted">Top matches: {(r.matches || []).slice(0,3).join(", ") || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

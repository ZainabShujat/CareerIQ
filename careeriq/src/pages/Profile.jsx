// snippet to put inside Profile.jsx (use your existing layout)
import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

export default function Profile(){
  const [results, setResults] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/results").then(r => r.ok ? r.json() : []),
      fetch("/api/tests").then(r => r.ok ? r.json() : [])
    ]).then(([resJson, testsJson]) => {
      if (!mounted) return;
      setResults(resJson || []);
      setTests(testsJson || []);
    }).catch(e => {
      console.warn(e);
    }).finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="ciq-container">Loading…</div>;

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      
      <BackButton />
      <h1>Your Profile</h1>
      <section style={{ marginTop: 18 }}>
        <h3>Personality Results</h3>
        {results.length === 0 ? <div className="muted">No saved results yet.</div> : (
          <ul>
            {results.map(r => (
              <li key={r._id || r.id}>
                {r.takenAt ? new Date(r.takenAt).toLocaleString() : ""} — Score/summary: {r.summary || "—"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Skill Tests</h3>
        {tests.length === 0 ? <div className="muted">No tests taken.</div> : (
          <ul>
            {tests.map(t => <li key={t._id || t.id}>{t.testId} — {t.score}/{t.total} ({t.takenAt?new Date(t.takenAt).toLocaleString():""})</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

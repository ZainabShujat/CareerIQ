import React, { useEffect, useState } from "react";
import CareerCard from "../components/CareerCard";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Teaching() {
  const tag = "teaching";
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/careers")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const filtered = (data || []).filter(c =>
          (c.tags || []).map(t => (t||"").toLowerCase()).includes(tag)
        );
        setCareers(filtered);
      })
      .catch(() => {
        try {
          const local = require("../data/careers.json");
          const filtered = (local || []).filter(c =>
            (c.tags || []).map(t => (t||"").toLowerCase()).includes(tag)
          );
          mounted && setCareers(filtered);
        } catch (e) {
          console.error("No careers available", e);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="ciq-container">Loading…</div>;

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
            <Header />
      <Link to="/careers" className="small-cta" style={{ marginBottom: 12 }}>← Back to Careers</Link>
      <h1>Teaching careers</h1>
      <div className="muted" style={{ marginBottom: 16 }}>Roles shaping learners across schools and colleges.</div>

      {careers.length === 0 ? (
        <div className="muted">No teaching careers found yet.</div>
      ) : (
        <div className="cards">
          {careers.map(c => <CareerCard key={c.id || c.slug} career={c} />)}
        </div>
      )}
    </div>
  );
}

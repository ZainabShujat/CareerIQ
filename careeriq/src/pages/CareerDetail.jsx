// src/pages/CareerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function CareerDetail() {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // try backend first
    fetch("/api/careers")
      .then((r) => r.json())
      .then((list) => {
        if (!mounted) return;
        const found = (list || []).find((c) => (c.slug || c.id) === slug);
        if (found) setCareer(found);
        else {
          // fallback to local file
          try {
            // eslint-disable-next-line
            const local = require("../data/careers.json");
            const foundLocal = (local || []).find((c) => (c.slug || c.id) === slug);
            setCareer(foundLocal || null);
          } catch (e) {
            setCareer(null);
          }
        }
      })
      .catch(() => {
        try {
          // eslint-disable-next-line
          const local = require("../data/careers.json");
          const foundLocal = (local || []).find((c) => (c.slug || c.id) === slug);
          setCareer(foundLocal || null);
        } catch (e) {
          setCareer(null);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [slug]);

  if (loading) return <div className="ciq-container" style={{ paddingTop: 48 }}>Loading…</div>;
  if (!career) return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Career not found</h1>
      <p className="muted">Try browsing the careers list.</p>
      <Link to="/careers" className="small-cta">Back to careers</Link>
    </div>
  );

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginTop: 0 }}>{career.title}</h1>
          <div className="muted">{career.salary}</div>
          <div style={{ marginTop: 16 }}>
            <h3>About this role</h3>
            <p className="muted">{career.long || career.short}</p>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Typical responsibilities</h3>
            <ul>
              {(career.responsibilities || [
                "Work on domain-specific tasks",
                "Collaborate with team",
                "Deliver results"
              ]).map((r, i) => <li key={i} className="muted">{r}</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Suggested skills</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(career.skills || []).map((s) => <div key={s} className="tag">{s}</div>)}
            </div>
          </div>
        </div>

        <aside style={{ width: 320 }}>
          <div className="card" style={{ padding: 14 }}>
            <h4 style={{ marginTop: 0 }}>Career snapshot</h4>
            <div style={{ marginTop: 8 }}>
              <div className="muted">Tags</div>
              <div style={{ marginTop: 6 }}>{(career.tags || []).join(", ")}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="muted">Estimated salary</div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>{career.salary || "—"}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/quiz" className="ciq-primary" style={{ display: "block", textAlign: "center" }}>Check fit — Take test</Link>
              <Link to="/insights" className="small-cta" style={{ display: "block", marginTop: 8, textAlign: "center" }}>Explore insights</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

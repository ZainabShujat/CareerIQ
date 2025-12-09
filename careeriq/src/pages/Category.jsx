// src/pages/Category.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CareerCard from "../components/CareerCard";

/*
Route usage:
  <Route path="/category/:tag" element={<Category />} />
  header links: /category/engineering etc
*/

export default function Category(){
  const { tag } = useParams(); // e.g. "engineering"
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch("/api/careers")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const filtered = (data || []).filter(c => {
          const tags = (c.tags || []).map(t => (t||"").toLowerCase());
          return tags.includes((tag||"").toLowerCase());
        });
        setCareers(filtered);
      })
      .catch(() => {
        // fallback to local file for dev
        try {
          // eslint-disable-next-line
          const local = require("../data/careers.json");
          const filtered = (local || []).filter(c => {
            const tags = (c.tags || []).map(t => (t||"").toLowerCase());
            return tags.includes((tag||"").toLowerCase());
          });
          mounted && setCareers(filtered);
        } catch (e) {
          console.error("No careers found", e);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [tag]);

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <Link to="/" className="small-cta" style={{ marginBottom: 12 }}>← Home</Link>
      <h1 style={{ textTransform: "capitalize" }}>{tag || "Careers"}</h1>
      <div className="muted" style={{ marginBottom: 18 }}>
        Browse careers tagged {tag}.
      </div>

      {loading ? <div>Loading…</div> : (
        careers.length === 0 ? <div className="muted">No careers found for {tag}.</div> :
        <div className="cards">
          {careers.map(c => <CareerCard key={c.id || c.slug} career={c} />)}
        </div>
      )}
    </div>
  );
}

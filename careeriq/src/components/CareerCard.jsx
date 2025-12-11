// src/components/CareerCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CareerCard({ career }) {
  const slug = career.slug || career.id;
  return (
    <article className="card career-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Link to={`/careers/${slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <h3 style={{ margin: 0 }}>{career.title}</h3>
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>{career.short}</div>
          <div style={{ marginTop: 8, fontSize: 13 }} className="muted">{(career.tags || []).join(", ")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{career.salary || "—"}</div>
          <div style={{ marginTop: 8 }}>
            <Link to={`/careers/${slug}`} className="small-cta">View</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

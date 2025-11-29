import React from "react";
import { useNavigate } from "react-router-dom";
import careers from "../data/careers.json";
import BackButton from "../components/BackButton";



export default function Careers() {


  return (
    <div className="ciq-container" style={{ paddingTop: 28 }}>
      <BackButton />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="breadcrumbs">
          <a onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</a>
          <span className="sep">/</span>
          <span style={{ fontWeight: 700 }}>Careers</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 30, margin: 0 }}>Explore Careers</h1>
          <div className="muted" style={{ marginTop: 6 }}>Curated roles with salary insight, skill tags and typical responsibilities.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input placeholder="Search careers, skills or tags" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(6,10,12,0.06)", minWidth: 220 }} />
          <button className="small-cta">Filter</button>
        </div>
      </div>

      <div style={{ marginTop: 26 }} className="cards-grid">
        {careers.map((c) => (
          <article key={c.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f1fff8", display: "grid", placeItems: "center", color: "#0f9a73", fontWeight: 800 }}>{c.title.split(" ").slice(0,1)[0][0]}</div>
                  <div>
                    <h3 style={{ margin: 0 }}>{c.title}</h3>
                    <div className="muted" style={{ fontSize: 13 }}>{c.short}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {(c.tags || []).slice(0,3).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="salary-chip">{c.salary || "—"}</div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => navigate(`/careers/${c.id}`)} className="small-cta">View →</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

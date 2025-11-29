// src/components/CareerCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CareerCard({ career, onBookmark, bookmarked = false }) {
  const navigate = useNavigate();

  return (
    <article className="career-card" role="article" aria-label={career.title}>
      <div className="career-card-left">
        <div className="career-avatar" aria-hidden>
          { (career.title||"").charAt(0) }
        </div>

        <div style={{flex:1}}>
          <h3 className="career-title">{career.title}</h3>
          <div className="muted career-short" style={{marginTop:6}}>{career.short}</div>

          <div style={{marginTop:10, display:"flex", gap:8, flexWrap:"wrap"}}>
            {(career.tags || []).map(t => (
              <span key={t} className="tag" style={{fontSize:13}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="career-card-right">
        <div className="career-salary">{career.salary || "—"}</div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            className="small-cta"
            onClick={() => navigate(`/careers/${career.slug || career.id}`)}
            aria-label={`View ${career.title}`}
          >
            View →
          </button>

          <button
            className={`small-cta bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark && onBookmark(career.id);
            }}
            aria-pressed={bookmarked}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
      </div>
    </article>
  );
}

// src/pages/CareerDetail.jsx
import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import careers from "../data/careers.json";
import BackButton from "../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";

export default function CareerDetail() {
  const { id } = useParams();
  const career = careers.find((c) => c.slug === id || String(c.id) === String(id));
  const { toggleBookmark, getBookmarks, openAuth, user } = useContext(AuthContext);

  if (!career) {
    return (
      <div className="ciq-container" style={{ paddingTop: 48 }}>
        <BackButton />
        <h2>Not found</h2>
        <p className="muted">We couldn't find that career.</p>
      </div>
    );
  }

  const bookmarked = (getBookmarks ? getBookmarks() : []).includes(career.id);

  function handleSave() {
    if (!user) {
      return openAuth({ tab: "signup" });
    }
    toggleBookmark(career.id);
    // optionally show a toast
    alert(bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>{career.title}</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            {(career.tags || []).join(" • ")}
          </div>
          <div style={{ marginTop: 10, fontWeight: 700 }}>{career.salary || "Salary info not available"}</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="ciq-primary" onClick={() => alert("Start the skills test (TODO)")}>
            Take relevant skill test
          </button>
          <button className="small-cta" onClick={handleSave}>
            {bookmarked ? "Unsave" : "Save to profile"}
          </button>
        </div>
      </div>

      <section style={{ marginTop: 20, background: "#fff", padding: 18, borderRadius: 10 }}>
        <h3>Description</h3>
        <p style={{ marginTop: 8 }}>{career.long || career.short || "No long description yet."}</p>

        {career.responsibilities && (
          <>
            <h4 style={{ marginTop: 12 }}>Typical Responsibilities</h4>
            <ul>
              {career.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {career.pathways && (
          <>
            <h4 style={{ marginTop: 12 }}>Career Pathways</h4>
            <div className="muted">{career.pathways.join(" → ")}</div>
          </>
        )}

        {career.skills && (
          <>
            <h4 style={{ marginTop: 12 }}>Key skills</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {career.skills.map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          </>
        )}
      </section>

      <div style={{ marginTop: 18 }}>
        <Link to="/careers" className="small-cta">← Back to careers</Link>
      </div>
    </div>
  );
}

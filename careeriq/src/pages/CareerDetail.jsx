// src/pages/CareerDetail.jsx
import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";

/**
 * Inline-styled Career detail page (guaranteed visible regardless of Tailwind)
 * - robust slug/id matching
 * - responsive two-column layout using inline styles
 * - skills rendered as chips
 * - responsibilities as a list
 */

const normalize = (s = "") => String(s).trim().toLowerCase();

export default function CareerDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const rawParam = params.slug ?? params.id ?? Object.values(params)[0] ?? "";
  const decoded = decodeURIComponent(rawParam || "");

  useEffect(() => {
    console.log("LOADED → INLINE CareerDetail.jsx", rawParam, decoded);
  }, [rawParam, decoded]);

  const career = useMemo(() => {
    if (!decoded) return null;
    const want = normalize(decoded);

    // 1) exact slug
    let found = careersData.find(c => normalize(c.slug) === want);
    if (found) return found;

    // 2) numeric id suffix
    const maybeNum = decoded.match(/(\d+)$/);
    if (maybeNum) {
      found = careersData.find(c => Number(c.id) === Number(maybeNum[1]));
      if (found) return found;
    }

    // 3) startsWith / includes on slug
    found = careersData.find(c => normalize(c.slug).startsWith(want) || normalize(c.slug).includes(want));
    if (found) return found;

    // 4) title contains
    found = careersData.find(c => normalize(c.title).includes(want));
    if (found) return found;

    // 5) tag match
    found = careersData.find(c => (c.tags || []).map(t => normalize(t)).includes(want));
    if (found) return found;

    // 6) fallback using first token
    const token = want.split(/[-_ ]+/)[0];
    if (token) {
      found = careersData.find(c => normalize(c.slug).includes(token) || normalize(c.title).includes(token));
      if (found) return found;
    }

    return null;
  }, [decoded]);

  // inline styles
  const page = { padding: 28, maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };
  const backBtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #cfd8d4", background: "#fff", cursor: "pointer", marginBottom: 18 };
  const container = { background: "#ffffff", borderRadius: 12, padding: 22, boxShadow: "0 8px 20px rgba(6, 35, 20, 0.04)", display: "flex", gap: 24, flexDirection: "column" };
  const leftCol = { flex: 1, minWidth: 0 };
  const rightCol = { width: 260, flexShrink: 0 };
  const sidebarCard = { padding: 16, borderRadius: 10, background: "#f8faf7", border: "1px solid #e6efe9", textAlign: "center" };
  const title = {
    fontSize: 36,
    fontWeight: 700,
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #072827, #06a77d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  };
  const subtitle = { color: "#556b62", marginBottom: 8, lineHeight: 1.4 };
  const sectionHeading = { fontSize: 18, fontWeight: 700, margin: "18px 0 10px 0" };
  const chip = { display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#f1f6f3", border: "1px solid #e6efe9", fontSize: 13, marginRight: 8, marginBottom: 8 };

  if (!decoded) {
    return (
      <div style={page}>
        <button style={backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{ marginTop: 10 }}>No career selected</h2>
        <p style={{ color: "#5f6f66" }}>The URL didn't include a career identifier. <a href="/careers">Back to careers</a></p>
      </div>
    );
  }

  if (!career) {
    const token = decoded.split(/[-_ ]+/)[0] || decoded;
    const alternatives = careersData.filter(c =>
      normalize(c.title).includes(token) || (c.tags || []).map(t => normalize(t)).includes(token)
    ).slice(0, 6);

    return (
      <div style={page}>
        <button style={backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={title}>Career not found</h1>
        <p style={{ color: "#5f6f66" }}>We couldn't find a career matching <strong>{decoded}</strong>.</p>

        {alternatives.length > 0 ? (
          <>
            <h3 style={{ marginTop: 18, marginBottom: 8 }}>Maybe you meant:</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {alternatives.map(a => (
                <div key={a.slug} style={{ padding: 12, borderRadius: 10, border: "1px solid #eef6ee", background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div style={{ color: "#6b7a70", fontSize: 13 }}>{a.short}</div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600 }}>{a.salary || "—"}</div>
                    <button onClick={() => navigate(`/careers/${encodeURIComponent(a.slug)}`)} style={{ padding: "6px 10px" }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "#6b7a70" }}>Try browsing the <a href="/careers">careers list</a>.</p>
        )}
      </div>
    );
  }

  // render found career
  return (
    <div style={page}>
      <button style={backBtn} onClick={() => navigate(-1)}>← Back</button>

      <div style={{ ...container, flexDirection: window.innerWidth < 900 ? "column" : "row" }}>
        <div style={leftCol}>
          <h1 style={title}>{career.title}</h1>
          <div style={subtitle}>{career.short}</div>
          <div style={{ color: "#8aa08e", fontSize: 13, marginBottom: 16 }}>{(career.tags || []).join(" • ")}</div>

          {career.long && <div style={{ color: "#2f3b35", marginBottom: 12 }}>{career.long}</div>}

          {career.responsibilities && career.responsibilities.length > 0 && (
            <>
              <div style={sectionHeading}>Typical responsibilities</div>
              <ul style={{ color: "#2f3b35", paddingLeft: 20 }}>
                {career.responsibilities.map((r, i) => <li key={i} style={{ marginBottom: 8 }}>{r}</li>)}
              </ul>
            </>
          )}

          {career.skills && career.skills.length > 0 && (
            <>
              <div style={sectionHeading}>Important skills</div>
              <div>
                {career.skills.map((s, i) => (
                  <div key={i} style={chip}>{s}</div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside style={rightCol}>
          <div style={sidebarCard}>
            <div style={{ color: "#6b7a70", fontSize: 13 }}>Estimated salary</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{career.salary || "—"}</div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

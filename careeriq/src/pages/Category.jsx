import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";

export default function Category() {
  console.log("🔥 Correct Category.jsx is now rendering");

  const { tag } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const t = (tag || "").toLowerCase();
    const q = query.toLowerCase();

    return careersData.filter(c => {
      const tags = (c.tags || []).map(t => t.toLowerCase());
      const matchesTag = tags.includes(t);
      const matchesQuery =
        c.title.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q);

      return matchesTag && matchesQuery;
    });
  }, [tag, query]);

  const card = {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    background: "white",
    border: "1px solid #e4ece7",
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  };

  const grid = {
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  };

  return (
    <div style={{ padding: "32px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid #cbd5d1",
          background: "white",
          marginBottom: 20,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6, textTransform: "capitalize" }}>
        {tag}
      </h1>
      <p style={{ color: "#6b7280" }}>{filtered.length} roles</p>

      <input
        type="text"
        placeholder="Search in this category"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "260px",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #cbd5d1",
          marginTop: 16,
          marginBottom: 32,
        }}
      />

      <div style={grid}>
        {filtered.map((c) => (
          <div key={c.slug} style={card}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>{c.title}</h2>
            <p style={{ color: "#64748b", marginBottom: 12 }}>{c.short}</p>

            <div style={{ fontSize: 14, marginBottom: 16 }}>
              <strong>{c.salary}</strong>
            </div>

            <button
              onClick={() => navigate(`/careers/${c.slug}`)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #94a3b8",
                background: "#f8fafc",
                cursor: "pointer",
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

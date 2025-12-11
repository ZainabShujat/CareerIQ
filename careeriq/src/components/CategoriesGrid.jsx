// src/components/CategoriesGrid.jsx (debug / guaranteed-visible)
import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import careersData from "../data/careers.json";

function buildCategoryMap(careers) {
  const map = {};
  careers.forEach((c) => {
    (c.tags || []).forEach((rawTag) => {
      const tag = String(rawTag).trim().toLowerCase();
      if (!tag) return;
      if (!map[tag]) map[tag] = { tag, count: 0, careers: [] };
      map[tag].count += 1;
      map[tag].careers.push(c);
    });
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export default function CategoriesGrid({ max = 12 }) {
  const categories = useMemo(() => buildCategoryMap(careersData), []);
  useEffect(() => {
    console.log("DEBUG: CategoriesGrid mounted — categories:", categories.length);
  }, [categories]);

  // simple inline styles so this shows regardless of CSS framework
  const cardStyle = {
    padding: 10, borderRadius: 12, border: "1px solid #e6efe9", background: "#ffffff", boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
  };
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 };

  return (
    <section style={{ padding: "28px 20px", maxWidth: 1200, margin: "0 auto", background: "#f6fbf8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 32, margin: 0, textAlign: "center" }}>Browse by category</h1>
        <div style={{ color: "#6b7280" }}>{categories.length} categories</div>
      </div>

      <div style={gridStyle}>
        {categories.slice(0, max).map(cat => (
          <div key={cat.tag} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}>{cat.tag}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{cat.count} roles</div>
              </div>
              <Link to={`/category/${encodeURIComponent(cat.tag)}`} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid #d1e7dd", borderRadius: 999 }}>View</Link>
            </div>

            <div>
              {cat.careers.slice(0,3).map(c => (
                <div key={c.id || c.slug} style={{ paddingTop: 8, paddingBottom: 8, borderTop: "1px solid #f0f6f2" }}>
                  <Link to={`/careers/${encodeURIComponent(c.slug)}`} style={{ textDecoration: "none", color: "#0f172a" }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{c.short}</div>
                  </Link>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
              Popular examples shown.
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

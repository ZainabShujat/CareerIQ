import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import careersData from "../data/careers.json";
import Header from "../components/Header";
import CareerCard from "../components/CareerCard";
import { ArrowLeft, Search, Layers } from "lucide-react";

export default function Category() {
  console.log("🔥 Category.jsx is now rendering with premium UI");

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

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5d1",
              background: "white",
              marginBottom: 24,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#5b6a67",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#06a77d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5d1"}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Header Banner */}
          <div 
            style={{ 
              marginBottom: 32,
              padding: "24px 20px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #072827, #0d3d3a)",
              boxShadow: "0 10px 24px rgba(7, 40, 39, 0.08)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ background: "rgba(6, 167, 125, 0.2)", padding: 4, borderRadius: 6, color: "#06a77d" }}>
                  <Layers size={16} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#06a77d" }}>
                  Category Sector
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, textTransform: "capitalize", color: "#ffffff" }}>
                {tag} Roles
              </h1>
              <p style={{ margin: "6px 0 0 0", color: "#9eb2ae", fontSize: 13.5 }}>
                Showing {filtered.length} careers matching this specialty tag.
              </p>
            </div>

            {/* Category Search */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <Search 
                size={16} 
                style={{ 
                  position: "absolute", 
                  left: 12, 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "#9eb2ae" 
                }} 
              />
              <input
                type="text"
                placeholder="Search in this category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 36px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div 
            style={{ 
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: 40, background: "#ffffff", borderRadius: 16, border: "1px solid #e2efe8", color: "#6b7a70", gridColumn: "1/-1", textAlign: "center" }}>
                No careers found matching your search.
              </div>
            ) : (
              filtered.map((c) => (
                <CareerCard key={c.slug} career={c} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

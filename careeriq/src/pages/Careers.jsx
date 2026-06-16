// src/pages/Careers.jsx
import React, { useState, useMemo } from "react";
import careersData from "../data/careers.json";
import CareerCard from "../components/CareerCard";
import Header from "../components/Header";
import { Search, Filter, RefreshCw, Briefcase, Tag } from "lucide-react";

const SALARY_BUCKETS = [
  { id: "lt5", label: "Less than ₹5 LPA", min: 0, max: 5 },
  { id: "5-10", label: "₹5 — 10 LPA", min: 5, max: 10 },
  { id: "10-20", label: "₹10 — 20 LPA", min: 10, max: 20 },
  { id: "20+", label: "₹20+ LPA", min: 20, max: Infinity },
];

function parseSalaryMin(salaryStr) {
  if (!salaryStr) return null;
  const m = salaryStr.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

export default function Careers() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [salaryBucket, setSalaryBucket] = useState("");

  const allTags = useMemo(() => {
    const s = new Set();
    (careersData || []).forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    return (careersData || []).filter((c) => {
      const search = query.trim().toLowerCase();
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search) ||
        (c.short || "").toLowerCase().includes(search) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(search));
      if (!matchSearch) return false;

      if (activeTags.length > 0) {
        const hasAll = activeTags.every((tag) => (c.tags || []).includes(tag));
        if (!hasAll) return false;
      }

      if (salaryBucket) {
        const bucket = SALARY_BUCKETS.find((b) => b.id === salaryBucket);
        if (bucket) {
          const min = parseSalaryMin(c.salary);
          if (min === null) return false;
          if (!(min >= bucket.min && min <= bucket.max)) return false;
        }
      }
      return true;
    });
  }, [query, activeTags, salaryBucket]);

  function toggleTag(t) {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function clearFilters() {
    setQuery("");
    setActiveTags([]);
    setSalaryBucket("");
  }

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <Header />

      <main className="ciq-main" style={{ paddingBottom: 80 }}>
        <div className="ciq-container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* Header Title Section / Banner */}
          <div 
            style={{ 
              marginTop: 40, 
              marginBottom: 32,
              padding: "28px 24px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #072827, #0d3d3a)",
              boxShadow: "0 10px 30px rgba(7, 40, 39, 0.15)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20
            }}
          >
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ background: "rgba(6, 167, 125, 0.2)", padding: 6, borderRadius: 8, color: "#06a77d" }}>
                  <Briefcase size={20} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#06a77d" }}>
                  Discover Pathways
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>
                Career Exploration Database
              </h1>
              <p style={{ margin: "10px 0 0 0", color: "#9eb2ae", fontSize: 14, lineHeight: 1.5, maxWidth: 650 }}>
                Filter through 150+ curated careers in India. Search by role, tags, or baseline salary packages. Click on a card to see AI-powered salary tiers and market outlooks.
              </p>
            </div>

            {/* Search Box on Banner */}
            <div style={{ position: "relative", minWidth: 280, flex: "1 1 300px" }}>
              <Search 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: 14, 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "#9eb2ae" 
                }} 
              />
              <input
                placeholder="Search careers, skills or tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 16px 12px 42px", 
                  borderRadius: 12, 
                  border: "1px solid rgba(255,255,255,0.15)", 
                  background: "rgba(255, 255, 255, 0.08)", 
                  color: "#ffffff",
                  fontSize: 14,
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
                className="banner-search-input"
                aria-label="Search careers"
              />
            </div>
          </div>

          {/* Grid Layout (Sidebar Filters + Career Grid) */}
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 850 ? "1fr" : "260px 1fr", gap: 24 }}>
            
            {/* Sidebar Filter Panel */}
            <aside 
              style={{ 
                background: "#ffffff", 
                borderRadius: 16, 
                padding: 20, 
                border: "1px solid rgba(6, 160, 120, 0.06)",
                boxShadow: "0 8px 20px rgba(6, 95, 75, 0.03)",
                height: "fit-content"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #f1f6f4", paddingBottom: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#072827", fontSize: 15 }}>
                  <Filter size={16} color="#06a77d" />
                  Filters
                </span>
                {(salaryBucket || activeTags.length > 0 || query) && (
                  <button 
                    onClick={clearFilters}
                    style={{ 
                      background: "transparent", 
                      border: "none", 
                      color: "#d93838", 
                      fontSize: 12, 
                      fontWeight: 700, 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} />
                    Reset
                  </button>
                )}
              </div>

              {/* Salary Filter */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#5b6a67", display: "block", marginBottom: 8 }}>
                  Baseline Salary
                </label>
                <select
                  value={salaryBucket}
                  onChange={(e) => setSalaryBucket(e.target.value)}
                  style={{ 
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2efe8",
                    background: "#ffffff",
                    fontSize: 13,
                    color: "#072827",
                    cursor: "pointer",
                    outline: "none"
                  }}
                  className="small-select"
                >
                  <option value="">All Salaries</option>
                  {SALARY_BUCKETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#5b6a67", marginBottom: 10 }}>
                  <Tag size={13} color="#06a77d" />
                  Career Tags
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {allTags.map((t) => {
                    const active = activeTags.includes(t);
                    return (
                      <button 
                        key={t} 
                        onClick={() => toggleTag(t)} 
                        style={{ 
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: active ? "1px solid #06a77d" : "1px solid #e2efe8",
                          background: active ? "linear-gradient(135deg, #eefbf7, #e2f7ef)" : "#ffffff",
                          color: active ? "#06a77d" : "#5b6a67",
                          transition: "all 0.15s ease-in-out"
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main Careers Grid */}
            <main>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#072827" }}>
                    {filtered.length} {filtered.length === 1 ? "Career Match" : "Career Matches"}
                  </span>
                  {activeTags.length > 0 && (
                    <div style={{ fontSize: 12, color: "#5b6a67", marginTop: 4 }}>
                      Selected: <strong style={{ color: "#06a77d" }}>{activeTags.join(", ")}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Cards Grid */}
              <div 
                style={{ 
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20
                }}
              >
                {filtered.length === 0 ? (
                  <div 
                    style={{ 
                      padding: 40, 
                      background: "#ffffff", 
                      borderRadius: 16, 
                      border: "1px solid #e2efe8", 
                      color: "#6b7a70", 
                      gridColumn: "1/-1", 
                      textAlign: "center" 
                    }}
                  >
                    No careers match your search criteria. Try adjusting your filters or search terms.
                  </div>
                ) : (
                  filtered.map((c) => <CareerCard key={c.id || c.slug} career={c} />)
                )}
              </div>
            </main>
          </div>

        </div>
      </main>
    </div>
  );
}

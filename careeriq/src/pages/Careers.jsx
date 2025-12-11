// src/pages/Careers.jsx (replace existing file — keep your CSS/classes)
import React, { useState, useMemo } from "react";
import careersData from "../data/careers.json";
import CareerCard from "../components/CareerCard";
import BackButton from "../components/BackButton";

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
    <div className="ciq-container" style={{ paddingTop: 28 }}>
      <BackButton />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Explore Careers</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Curated roles with salary insight, tags and typical responsibilities.
          </div>
        </div>

        <div style={{ minWidth: 240, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Search careers, skills or tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            aria-label="Search careers"
            style={{ minWidth: 220 }}
          />
          <button className="small-cta" onClick={() => clearFilters()}>
            Clear
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        <aside className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong style={{ fontSize: 15 }}>Filters</strong>
            <button className="small-cta" onClick={() => clearFilters()}>
              Reset
            </button>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Salary</div>
            <select
              value={salaryBucket}
              onChange={(e) => setSalaryBucket(e.target.value)}
              className="small-select"
              style={{ marginTop: 8 }}
            >
              <option value="">All salaries</option>
              {SALARY_BUCKETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Tags</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allTags.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)} className={`tag ${active ? "tag--active" : ""}`} style={{ cursor: "pointer" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="section-head">
              <h2 style={{ margin: 0 }}>{filtered.length} careers</h2>
              <div className="muted" style={{ fontSize: 13, marginLeft: 12 }}>
                {activeTags.length > 0 ? activeTags.join(", ") : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Sort
              </div>
              <select className="small-select" value={"relevance"} readOnly>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          <div className="cards-grid" style={{ marginTop: 8 }}>
            {filtered.length === 0 ? (
              <div className="card">
                <div className="muted">No careers match those filters. Try clearing filters.</div>
              </div>
            ) : (
              filtered.map((c) => <CareerCard key={c.id || c.slug} career={c} />)
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// src/pages/Careers.jsx
import React, { useState, useMemo, useContext, useEffect } from "react";
import careersData from "../data/careers.json";
import CareerCard from "../components/CareerCard";
import BackButton from "../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";

/*
  Filter UX:
  - Search (title / short / tags)
  - Multi-tag filter (click tags to add/remove)
  - Salary buckets (select one)
  - Clear filters
*/

const SALARY_BUCKETS = [
  { id: "lt5", label: "Less than ₹5 LPA", min: 0, max: 5 },
  { id: "5-10", label: "₹5 — 10 LPA", min: 5, max: 10 },
  { id: "10-20", label: "₹10 — 20 LPA", min: 10, max: 20 },
  { id: "20+", label: "₹20+ LPA", min: 20, max: Infinity },
];

function parseSalaryMin(salaryStr) {
  // salaryStr example: "₹8–20 LPA" or "₹8-20 LPA" or "₹8–" etc.
  if (!salaryStr) return null;
  // extract first consecutive number (could be 8, 10, 4, 3)
  const m = salaryStr.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

export default function Careers() {
  const { toggleBookmark, getBookmarks } = useContext(AuthContext) || {};
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]); // multi-select tags
  const [salaryBucket, setSalaryBucket] = useState(""); // id of SALARY_BUCKETS
  const [bookmarks, setBookmarks] = useState(() => (getBookmarks ? getBookmarks() : []));

  // keep local bookmarks in sync if auth context changes (user toggles elsewhere)
  useEffect(() => {
    setBookmarks(getBookmarks ? getBookmarks() : []);
  }, [getBookmarks]);

  // collect all available tags from careers
  const allTags = useMemo(() => {
    const s = new Set();
    careersData.forEach((c) => (c.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  // filter pipeline
  const filtered = useMemo(() => {
    return careersData.filter((c) => {
      // search match
      const search = query.trim().toLowerCase();
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search) ||
        (c.short || "").toLowerCase().includes(search) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(search));

      if (!matchSearch) return false;

      // tag match: activeTags must all be present (AND behavior). If you want OR, change logic.
      if (activeTags.length > 0) {
        const hasAll = activeTags.every((tag) => (c.tags || []).includes(tag));
        if (!hasAll) return false;
      }

      // salary bucket match
      if (salaryBucket) {
        const bucket = SALARY_BUCKETS.find((b) => b.id === salaryBucket);
        if (bucket) {
          const min = parseSalaryMin(c.salary);
          if (min === null) return false; // unknown salary don't show for bucket filter
          if (!(min >= bucket.min && min <= bucket.max)) return false;
        }
      }

      return true;
    });
  }, [query, activeTags, salaryBucket]);

  function toggleTag(t) {
    setActiveTags((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      return [...prev, t];
    });
  }

  function clearFilters() {
    setQuery("");
    setActiveTags([]);
    setSalaryBucket("");
  }

  function handleBookmark(id) {
    if (!toggleBookmark) {
      alert("Sign in to save bookmarks (or open the auth modal).");
      return;
    }
    toggleBookmark(id);
    const updated = getBookmarks ? getBookmarks() : [];
    setBookmarks(updated);
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 28 }}>
      <BackButton />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Explore Careers</h1>
          <div className="muted" style={{ marginTop: 6 }}>Curated roles with salary insight, tags and typical responsibilities.</div>
        </div>

        <div style={{ minWidth: 220, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Search careers, skills or tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            aria-label="Search careers"
            style={{ minWidth: 220 }}
          />
          <button className="small-cta" onClick={() => clearFilters()}>Clear</button>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* FILTER SIDEBAR */}
        <aside className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong style={{ fontSize: 15 }}>Filters</strong>
            <button className="small-cta" onClick={() => clearFilters()}>Reset</button>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Salary</div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                value={salaryBucket}
                onChange={(e) => setSalaryBucket(e.target.value)}
                className="small-select"
                aria-label="Salary bucket"
              >
                <option value="">All salaries</option>
                {SALARY_BUCKETS.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Tags</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allTags.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`tag ${active ? "tag--active" : ""}`}
                    style={{ cursor: "pointer", border: active ? "1px solid rgba(11,127,103,0.12)" : "1px solid rgba(6,10,12,0.04)" }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Bookmarked</div>
            <div>
              <div className="muted" style={{ fontSize: 13 }}>
                {bookmarks.length === 0 ? "No bookmarks yet." : `${bookmarks.length} saved`}
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="section-head">
              <h2 style={{ margin: 0 }}>{filtered.length} careers</h2>
              <div className="muted" style={{ fontSize: 13, marginLeft: 12 }}>{activeTags.length > 0 ? activeTags.join(", ") : ""}</div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="muted" style={{ fontSize: 13 }}>Sort</div>
              <select className="small-select" value={"relevance"} readOnly>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          <div className="cards-grid" style={{ marginTop: 8 }}>
            {filtered.length === 0 ? (
              <div className="card"><div className="muted">No careers match those filters. Try clearing filters.</div></div>
            ) : (
              filtered.map((c) => (
                <CareerCard
                  key={c.id}
                  career={c}
                  onBookmark={handleBookmark => handleBookmark ? handleBookmark(c.id) : handleBookmark}
                  bookmarked={bookmarks.includes(c.id)}
                  // But we'll call our local handler below:
                />
              ))
            )}
          </div>

          {/* NOTE: Because CareerCard expects onBookmark(career.id) signature,
              we attach our handler via inline wrapper below for clarity */}
          {filtered.length > 0 && (
            <div style={{ display: "none" }} aria-hidden>
              {/* dummy holder to satisfy structure - actual onBookmark passed inline above */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

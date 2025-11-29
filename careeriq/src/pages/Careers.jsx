// src/pages/Careers.jsx
import React, { useState, useMemo, useContext } from "react";
import careersData from "../data/careers.json";
import CareerCard from "../components/CareerCard";
import BackButton from "../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";

export default function Careers() {
  const { addBookmark, getBookmarks } = useContext(AuthContext) || {};
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("relevance"); // placeholder
  const bookmarks = (getBookmarks && getBookmarks()) || [];

  const tags = useMemo(() => {
    const s = new Set();
    careersData.forEach(c => (c.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    return careersData.filter(c => {
      const matchQ = !q || c.title.toLowerCase().includes(q.toLowerCase()) || (c.short||"").toLowerCase().includes(q.toLowerCase()) || (c.tags||[]).some(t=>t.includes(q.toLowerCase()));
      const matchTag = !tag || (c.tags || []).includes(tag);
      return matchQ && matchTag;
    });
  }, [q, tag]);

  function handleBookmark(id){
    if (addBookmark) {
      addBookmark(id);
      alert("Bookmarked");
    } else {
      alert("Sign in to save bookmarks");
    }
  }

  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <BackButton />

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:16}}>
        <div>
          <h1>Explore Careers</h1>
          <p className="muted">Curated roles with salary insight, skill tags and typical responsibilities.</p>
        </div>

        <div style={{minWidth:260, display:"flex", gap:8}}>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Search careers, skills or tags"
            className="search-input"
          />
          <select value={tag} onChange={e=>setTag(e.target.value)} className="small-select">
            <option value="">All tags</option>
            {tags.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginTop:20, display:"grid", gap:18}}>
        <div className="cards-grid">
          {filtered.length === 0 ? (
            <div className="muted">No careers found.</div>
          ) : (
            filtered.map(c => (
           <CareerCard
            key={c.id}
            career={c}
            onBookmark={handleBookmark}
            bookmarked={bookmarks.includes(c.id)}
             />
            ))

          )}
        </div>
      </div>
    </div>
  );
}

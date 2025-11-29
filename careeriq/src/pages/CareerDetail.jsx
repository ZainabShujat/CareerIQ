// src/pages/CareerDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";
import careers from "../data/careers.json";
import BackButton from "../components/BackButton";

export default function CareerDetail(){
  const { id } = useParams(); // id will be slug or short id
  const career = careers.find(c => c.slug === id || c.id === id);

  if (!career) {
    return (
      <div className="ciq-container" style={{paddingTop:48}}>
        <BackButton />
        <h2>Not found</h2>
        <p className="muted">We couldn't find that career.</p>
      </div>
    );
  }

  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <BackButton />
      <h1>{career.title}</h1>
      <div className="muted">{(career.tags || []).join(" • ")}</div>
      <div style={{marginTop:12, fontWeight:700}}>{career.salary}</div>

      <div style={{marginTop:20}}>
        <p>{career.long || career.short || "No long description yet."}</p>
      </div>

      <div style={{marginTop:20, display:"flex", gap:8}}>
        <button className="ciq-primary">Take relevant skill test</button>
        <button className="small-cta">Save to profile</button>
      </div>
    </div>
  );
}

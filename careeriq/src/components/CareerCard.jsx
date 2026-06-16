// src/components/CareerCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  Code, Heart, Palette, Calculator, Book, Cpu, Briefcase, 
  ArrowRight, Coins, Sparkles
} from "lucide-react";

function getCareerIcon(tags, title) {
  const t = (tags || []).map(x => x.toLowerCase());
  const ti = (title || "").toLowerCase();
  
  if (t.includes("ai") || t.includes("ml") || t.includes("robotics")) return Cpu;
  if (t.includes("software") || t.includes("coding") || t.includes("engineering")) return Code;
  if (t.includes("medical") || t.includes("healthcare") || t.includes("care") || t.includes("public-health")) return Heart;
  if (t.includes("design") || t.includes("creative") || t.includes("media") || t.includes("art")) return Palette;
  if (t.includes("finance") || t.includes("investment") || t.includes("banking") || ti.includes("financial") || ti.includes("finance") || ti.includes("accountant")) return Calculator;
  if (t.includes("teaching") || t.includes("education")) return Book;
  
  return Briefcase;
}

export default function CareerCard({ career }) {
  const slug = career.slug || career.id;
  const IconComponent = getCareerIcon(career.tags, career.title);

  return (
    <article 
      className="card career-card" 
      style={{ 
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid rgba(6, 160, 120, 0.06)",
        background: "#ffffff",
        minHeight: 200,
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          {/* Left: Avatar Icon + Title */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
            <div 
              style={{ 
                width: 42, 
                height: 42, 
                borderRadius: 10, 
                background: "linear-gradient(135deg, #eefbf7, #e2f7ef)", 
                color: "#06a77d", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexShrink: 0
              }}
              className="career-avatar-icon"
            >
              <IconComponent size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Link to={`/careers/${slug}`} style={{ textDecoration: "none" }}>
                <h3 style={{ margin: 0, fontSize: 17, color: "#072827", fontWeight: 700, lineHeight: 1.3 }}>{career.title}</h3>
              </Link>
            </div>
          </div>

          {/* Right: Salary Badge */}
          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 4, 
              background: "#eefaf3", 
              color: "#06a77d", 
              padding: "4px 8px", 
              borderRadius: 8, 
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            <Coins size={12} />
            {career.salary || "—"}
          </div>
        </div>

        {/* Short Summary */}
        <p style={{ color: "#5b6a67", fontSize: 13, margin: "0 0 16px 0", lineHeight: 1.5 }}>
          {career.short}
        </p>
      </div>

      <div>
        {/* Bottom Section: Tag Chips & View CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
            {(career.tags || []).slice(0, 2).map((tag, idx) => (
              <span 
                key={idx} 
                style={{ 
                  fontSize: 10, 
                  fontWeight: 700, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.3px", 
                  background: "#f1f6f4", 
                  color: "#5b6a67", 
                  padding: "3px 8px", 
                  borderRadius: 6 
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <Link 
            to={`/careers/${slug}`} 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: "#06a77d",
              textDecoration: "none"
            }}
            className="career-card-link"
          >
            Explore
            <ArrowRight size={13} className="arrow-icon" style={{ transition: "transform 0.2s ease" }} />
          </Link>
        </div>
      </div>
    </article>
  );
}

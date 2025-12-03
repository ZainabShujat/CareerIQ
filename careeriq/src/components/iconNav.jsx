// src/components/IconNav.jsx
import React from "react";
import { Link } from "react-router-dom";

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 21h14a1 1 0 0 0 1-1V11" />
    </svg>
  ),
  careers: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  insights: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M6 20v-4" />
      <path d="M12 20V10" />
      <path d="M18 20V6" />
    </svg>
  ),
  skill: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h2v4h-2z" />
    </svg>
  ),
  engineering: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
    </svg>
  ),
  teaching: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 6h16" />
      <path d="M4 18h16" />
      <path d="M6 6v12" />
    </svg>
  ),
  culinary: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M7 21h10" />
      <path d="M12 3v14" />
      <path d="M8 7h8" />
    </svg>
  ),
  medical: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2v20" />
      <path d="M5 8h14" />
    </svg>
  ),
  happiness: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" />
      <path d="M9 10h.01M15 10h.01" />
    </svg>
  ),
  personality: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2a4 4 0 0 1 4 4v1" />
      <path d="M12 2a4 4 0 0 0-4 4v1" />
      <path d="M5 12h14" />
      <path d="M8 18h8" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
};

function IconButton({ to, label, icon }) {
  return (
    <Link to={to} className="icon-link" title={label} aria-label={label}>
      {icon}
    </Link>
  );
}

export default function IconNav() {
  const items = [
    { key: "home", to: "/", label: "Home" },
    { key: "careers", to: "/careers", label: "Careers" },
    { key: "insights", to: "/insights", label: "Insights" },
    { key: "skill", to: "/skill-tests", label: "Skill tests" },
    { key: "about", to: "/about", label: "About" },
    { key: "engineering", to: "/engineering-careers", label: "Engineering Careers" },
    { key: "teaching", to: "/teaching-careers", label: "Teaching Careers" },
    { key: "culinary", to: "/culinary-careers", label: "Culinary Careers" },
    { key: "medical", to: "/medical-careers", label: "Medical Careers" },
    { key: "happiness", to: "/Happiness-index", label: "Happiness Index" },
    { key: "personality", to: "/personality-test", label: "Personality Test" },
    { key: "profile", to: "/profile", label: "Profile" }
  ];

  return (
    <nav className="icon-nav" aria-label="Quick actions">
      {items.map(it => (
        <IconButton key={it.key} to={it.to} label={it.label} icon={ICONS[it.key]} />
      ))}
    </nav>
  );
}

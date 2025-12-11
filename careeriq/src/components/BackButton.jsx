// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to }) {
  const nav = useNavigate();
  return (
    <button
      className="small-cta back-btn"
      onClick={() => (to ? nav(to) : nav("/"))}
      style={{ cursor: "pointer" }}
    >
      ← Home
    </button>
  );
}

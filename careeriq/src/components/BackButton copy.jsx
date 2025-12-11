// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to }) {
  const nav = useNavigate();
  return (
    <button
      className="small-cta back-btn"
      onClick={() => (to ? nav(to) : nav(-1))}
      style={{ cursor: "pointer" }}
    >
      ← Back
    </button>
  );
}

// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)}
      className="small-cta back-btn"
      style={{
        marginBottom: "20px",
        display: "inline-block",
      }}
    >
      ← Back
    </button>
  );
}

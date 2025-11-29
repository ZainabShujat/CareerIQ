import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";


export default function About() {

  return (
    
    <div className="ciq-container" style={{ paddingTop: 48 }}>
    <BackButton />
      <h1>About CareerIQ</h1>
      <p className="muted">This is a student-built tool designed to help Indian students make informed career choices.</p>

      <div className="card" style={{ marginTop: 32 }}>
        <p>
          This project uses AI-inspired logic, industry data, user traits, and personality indicators
          to guide students toward meaningful careers.
        </p>
        
      </div>
    </div>
  );
}

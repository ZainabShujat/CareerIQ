import React from "react";
import BackButton from "../components/BackButton";


export default function Results() {
  

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Your Results</h1>
      <p className="muted">Your top matches will appear here after completing the quiz.</p>

      <div className="card" style={{ marginTop: 32 }}>
        <h3>Results Placeholder</h3>
        <p>We’ll build the matching engine after setting all pages.</p>
      </div>
    </div>
  );
}

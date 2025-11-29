import React from "react";
import BackButton from "../components/BackButton";



export default function Insights() {
  

  return (
    
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Insights & Trends</h1>
      <p className="muted">Industry insights, market shifts, and India-specific data.</p>

      <div style={{ marginTop: 32 }}>

        <article className="card">
          <h3>AI is growing in India</h3>
          <p className="muted">A quick look at why AI roles are exploding.</p>
        </article>

        <article className="card">
          <h3>Cybersecurity demand rising</h3>
          <p className="muted">Companies hiring security experts aggressively.</p>
        </article>

      </div>
    </div>
  );
}

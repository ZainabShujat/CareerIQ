import React from "react";

export default function Hero() {
  return (
    <section className="ciq-hero">
      <div className="ciq-pill">CareerIQ — AI-POWERED CAREER MATCHING</div>

      <h1 className="ciq-h1">
        Find careers aligned with who you are
      </h1>

      <p className="ciq-lead">
        Take a 7-minute assessment and discover careers that match your traits,
        with salary &amp; work-life insights tailored to India.
      </p>

      <div className="ciq-subline">
        <span className="muted">Explore</span>
        <strong> 100+ careers</strong>
        <span className="muted"> • validated skill tests • live market data</span>
      </div>

      <div className="ciq-cta-row">
        <button className="ciq-primary">Start Assessment</button>
        <button className="ciq-secondary">Navigation Guide</button>
      </div>
    </section>
  );
}

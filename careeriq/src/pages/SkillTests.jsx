import React from "react";
import BackButton from "../components/BackButton";


export default function SkillTests() {
  

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Skill Tests</h1>
      <p className="muted">A growing library of aptitude and soft skill tests.</p>

      <div style={{ marginTop: 32 }}>

        <article className="card">
          <h3>Logical Reasoning Test</h3>
          <p className="muted">20-minute practice test.</p>
        </article>

        <article className="card">
          <h3>Verbal Aptitude Test</h3>
          <p className="muted">Improve your communication pattern.</p>
        </article>

      </div>
    </div>
    
  );
}

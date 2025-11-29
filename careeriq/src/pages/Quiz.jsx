import React from "react";
import BackButton from "../components/BackButton";



export default function Quiz() {
  

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Career Assessment</h1>
      <p className="muted">Your personalised assessment will begin soon.</p>

      <div className="card" style={{ marginTop: 32, padding: 24 }}>
        <h3>Not Ready Yet</h3>
        <p>The quiz logic will be added after we finish the pages.</p>
        <p className="muted">But this page is fully wired.</p>
      </div>

      <button className="ciq-primary" style={{ marginTop: 20 }}>
        Start Quiz
      </button>
    </div>
  );
}

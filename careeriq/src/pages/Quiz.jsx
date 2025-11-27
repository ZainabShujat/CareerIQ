import React from "react";
import { Link } from "react-router-dom";

export default function Quiz(){
  return (
    <div className="ciq-container" style={{paddingTop:48, paddingBottom:80}}>
      <h2>Assessment</h2>
      <p className="muted">Interactive quiz will appear here. (Using local questions.json)</p>
      <div style={{marginTop:14}}>
        <Link to="/results" className="ciq-primary">Mock finish — view results</Link>
      </div>
    </div>
  );
}

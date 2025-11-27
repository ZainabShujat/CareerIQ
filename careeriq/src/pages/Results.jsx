import React from "react";
import { Link } from "react-router-dom";
export default function Results(){
  return (
    <div className="ciq-container" style={{paddingTop:48, paddingBottom:80}}>
      <h2>Your results</h2>
      <p className="muted">Sample matches will appear here after you complete the quiz.</p>
      <div className="cards" style={{marginTop:18}}>
        <div className="card"><h3>Software Engineer</h3><div className="muted">Match 92%</div><Link to="/careers/se" className="small-cta">Open</Link></div>
      </div>
    </div>
  );
}

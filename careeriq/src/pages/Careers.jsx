import React from "react";
import careers from "../data/careers.json";

export default function Careers(){
  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <h2>Careers</h2>
      <div className="cards" style={{marginTop:16}}>
        {careers.map(c => (
          <div key={c.id} className="card">
            <h3>{c.title}</h3>
            <div className="muted">{c.short}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

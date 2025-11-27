import React from "react";
import { useParams } from "react-router-dom";
import careers from "../data/careers.json";

export default function CareerDetail(){
  const { id } = useParams();
  const career = careers.find(c=>c.id===id) || careers[0];
  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <h2>{career.title}</h2>
      <p className="muted">{career.salary}</p>
      <p>{career.short}</p>
    </div>
  );
}

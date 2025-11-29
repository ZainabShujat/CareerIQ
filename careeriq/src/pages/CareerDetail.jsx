import React from "react";
import { useParams } from "react-router-dom";
import careers from "../data/careers.json";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function CareerDetail() {
  const { id } = useParams();
  const career = careers.find((c) => c.id === id);

  if (!career) {
    return (
      <div className="ciq-container" style={{ paddingTop: 48 }}>
        <h2>Career not found</h2>
      </div>
    );
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>{career.title}</h1>
      <p className="muted" style={{ marginBottom: 20 }}>{career.short}</p>

      <div className="card" style={{ padding: 24 }}>
        <h3>Overview</h3>
        <p>{career.description || "Detailed information coming soon!"}</p>

        <h3 style={{ marginTop: 24 }}>Average Salary</h3>
        <p>{career.salary || "N/A"}</p>

        <h3 style={{ marginTop: 24 }}>Work-life Balance</h3>
        <p>{career.wlb || "N/A"}</p>
      </div>
    </div>
  );
}

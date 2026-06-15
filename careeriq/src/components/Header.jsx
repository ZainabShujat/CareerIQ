import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function ProfileButton(){
  const navigate = useNavigate();
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const user = ctx?.user;
  const openAuth = ctx?.openAuth || (()=>{ alert("Auth not loaded"); });

  if (user) {
    return (
      <button
        className="ciq-cta"
        onClick={() => {
          try {
            navigate("/profile");
          } catch (err) {
            console.warn("Router not available:", err);
            alert("Router not ready — try again");
          }
        }}
      >
        {user.name}
      </button>
    );
  }

  return <button onClick={openAuth} className="ciq-cta">Profile</button>;
}

export default function Header() {
  return (
    <header className="ciq-header">
      <div className="ciq-container">
        <div className="ciq-brand">
          <div className="ciq-title">CareerIQ</div>
          <div className="ciq-sub">AI-powered career recommender</div>
        </div>

        <nav className="ciq-nav" role="navigation" aria-label="Main navigation">
          <Link to="/" className="ciq-link">Home</Link>
          <Link to="/careers" className="ciq-link">Careers</Link>
          <Link to="/insights" className="ciq-link">Insights</Link>
          <Link to="/skill-tests" className="ciq-link">Skill Tests</Link>
          <Link to="/happiness-index" className="ciq-link">Happiness Index</Link>
          <Link to="/chatbot" className="ciq-link">AI Chatbot</Link>
          <Link to="/about" className="ciq-link">About</Link>
          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
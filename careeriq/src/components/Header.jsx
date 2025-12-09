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
          <Link to="/engineering-careers" className="ciq-link">Engineering</Link>
          <Link to="/medical-careers" className="ciq-link">Medical</Link>
          <Link to="/teaching-careers" className="ciq-link">Teaching</Link>
          <Link to="/culinary-careers" className="ciq-link">Culinary</Link>
          <Link to="/civil-careers" className="ciq-link">Civil</Link>
          <Link to="/about" className="ciq-link">About</Link>
          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Home, Briefcase, TrendingUp, CheckSquare, Smile, MessageSquare, Info, User } from "lucide-react";

function ProfileButton() {
  const navigate = useNavigate();
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const user = ctx?.user;
  const openAuth = ctx?.openAuth || (() => { alert("Auth not loaded"); });

  if (user) {
    return (
      <button
        className="ciq-link ciq-nav-icon-btn"
        title={`Profile (${user.name})`}
        onClick={() => {
          try {
            navigate("/profile");
          } catch (err) {
            console.warn("Router not available:", err);
            alert("Router not ready — try again");
          }
        }}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px 12px" }}
      >
        <User size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={openAuth}
      className="ciq-link ciq-nav-icon-btn"
      title="Profile / Login"
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px 12px" }}
    >
      <User size={20} />
    </button>
  );
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
          <Link to="/" className="ciq-link" title="Home">
            <Home size={20} />
          </Link>
          <Link to="/careers" className="ciq-link" title="Careers Database">
            <Briefcase size={20} />
          </Link>
          <Link to="/insights" className="ciq-link" title="Match Insights">
            <TrendingUp size={20} />
          </Link>
          <Link to="/skill-tests" className="ciq-link" title="Skill Tests">
            <CheckSquare size={20} />
          </Link>
          <Link to="/happiness-index" className="ciq-link" title="Happiness Index / Results">
            <Smile size={20} />
          </Link>
          <Link to="/chatbot" className="ciq-link" title="AI Chatbot">
            <MessageSquare size={20} />
          </Link>
          <Link to="/about" className="ciq-link" title="About CareerIQ">
            <Info size={20} />
          </Link>
          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
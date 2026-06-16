import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Home, Briefcase, TrendingUp, CheckSquare, Smile, MessageSquare, Info, User, Menu, X } from "lucide-react";

function ProfileButton({ closeMenu }) {
  const navigate = useNavigate();
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const user = ctx?.user;
  const openAuth = ctx?.openAuth || (() => { alert("Auth not loaded"); });

  const handleClick = () => {
    if (closeMenu) closeMenu();
    if (user) {
      try {
        navigate("/profile");
      } catch (err) {
        console.warn("Router not available:", err);
      }
    } else {
      openAuth();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="ciq-link ciq-nav-icon-btn"
      title={user ? `Profile (${user.name})` : "Profile / Login"}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 10 }}
    >
      <User size={20} />
      <span className="mobile-nav-label" style={{ display: "none" }}>{user ? `Profile (${user.name})` : "Login / Signup"}</span>
    </button>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="ciq-header" style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, background: "var(--panel)" }}>
      <div className="ciq-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 }}>
        <div className="ciq-brand" style={{ display: "flex", flexDirection: "column" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div className="ciq-title" style={{ fontSize: 22, fontWeight: 900 }}>CareerIQ</div>
          </Link>
          <div className="ciq-sub" style={{ fontSize: 11 }}>AI-powered career recommender</div>
        </div>

        {/* Desktop Nav */}
        <nav className="ciq-nav desktop-only" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link to="/" className="ciq-link" title="Home"><Home size={20} /></Link>
          <Link to="/careers" className="ciq-link" title="Careers Database"><Briefcase size={20} /></Link>
          <Link to="/insights" className="ciq-link" title="Match Insights"><TrendingUp size={20} /></Link>
          <Link to="/skill-tests" className="ciq-link" title="Skill Tests"><CheckSquare size={20} /></Link>
          <Link to="/happiness-index" className="ciq-link" title="Happiness Index / Results"><Smile size={20} /></Link>
          <Link to="/chatbot" className="ciq-link" title="AI Chatbot"><MessageSquare size={20} /></Link>
          <Link to="/about" className="ciq-link" title="About CareerIQ"><Info size={20} /></Link>
          <ProfileButton />
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-only menu-toggle-btn"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          style={{
            background: "transparent",
            border: "none",
            color: "#072827",
            cursor: "pointer",
            padding: 8
          }}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Slide-Out Sidebar Drawer */}
      <div 
        className={`mobile-sidebar-backdrop ${isMenuOpen ? "open" : ""}`}
        onClick={closeMenu}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 40, 39, 0.4)",
          backdropFilter: "blur(4px)",
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          zIndex: 1001
        }}
      />
      <div 
        className={`mobile-sidebar ${isMenuOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          background: "#ffffff",
          boxShadow: "-10px 0 30px rgba(7, 40, 39, 0.15)",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 1002
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f6f4", paddingBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#072827" }}>Navigation</div>
            <div style={{ fontSize: 11, color: "#5b6a67" }}>AI-Powered Recommendations</div>
          </div>
          <button 
            onClick={closeMenu}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#5b6a67" }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }} className="mobile-nav-links">
          <Link to="/" className="mobile-sidebar-link" onClick={closeMenu}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link to="/careers" className="mobile-sidebar-link" onClick={closeMenu}>
            <Briefcase size={18} /> <span>Careers Database</span>
          </Link>
          <Link to="/insights" className="mobile-sidebar-link" onClick={closeMenu}>
            <TrendingUp size={18} /> <span>Match Insights</span>
          </Link>
          <Link to="/skill-tests" className="mobile-sidebar-link" onClick={closeMenu}>
            <CheckSquare size={18} /> <span>Skill Tests</span>
          </Link>
          <Link to="/happiness-index" className="mobile-sidebar-link" onClick={closeMenu}>
            <Smile size={18} /> <span>Happiness Index</span>
          </Link>
          <Link to="/chatbot" className="mobile-sidebar-link" onClick={closeMenu}>
            <MessageSquare size={18} /> <span>AI Chatbot</span>
          </Link>
          <Link to="/about" className="mobile-sidebar-link" onClick={closeMenu}>
            <Info size={18} /> <span>About CareerIQ</span>
          </Link>
          <div style={{ borderTop: "1px solid #f1f6f4", marginTop: 10, paddingTop: 10 }}>
            <ProfileButton closeMenu={closeMenu} />
          </div>
        </nav>
      </div>
    </header>
  );
}
// src/pages/Profile.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Header from "../components/Header";


export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    openAuth,
    logout,
  } = useContext(AuthContext);
  const results = user?.results || [];
const personality = user?.personality || null;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    headline: "",
    about: "",
    location: "",
    education: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile((p) => ({
        ...p,
        name: user.name || "",
        email: user.email || "",
      }));
    } else {
      setProfile({
        name: "",
        email: "",
        headline: "",
        about: "",
        location: "",
        education: "",
      });
    }
  }, [user]);

  // replace your existing handleSave with this
async function handleSave(e) {
  e.preventDefault();
  setMessage(null);

  // basic client validation
  if (!profile.name) {
    setMessage({ type: "error", text: "Please enter your name." });
    return;
  }

  setSaving(true);
  try {
    const token = localStorage.getItem("ciq_token");

    // server's allowed fields (from server/routes/user.js)
    const allowed = [
      "name",
      "headline",
      "photoUrl",
      "about",
      "education",
      "experience",
      "projects",
      "skills",
      "happinessIndex"
    ];

    // map your local UI fields into allowed keys
    // only include keys that both exist in profile and are allowed by server
    const updates = {};
    if (profile.name !== undefined) updates.name = profile.name;
    if (profile.headline !== undefined) updates.headline = profile.headline;
    if (profile.about !== undefined) updates.about = profile.about;
    // server expects 'education' - we send whatever is in profile.education
    if (profile.education !== undefined) updates.education = profile.education;
    // NOTE: location/email are not in allowed list — don't send them or server will ignore / return 400

    // If you have other complex fields (experience/projects/skills), send them in the structure server expects.
    if (Object.keys(updates).length === 0) {
      setMessage({ type: "error", text: "No updatable fields provided." });
      setSaving(false);
      return;
    }

    // send to correct endpoint and method
    const res = await fetch("/api/user/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });

    // always read text first (prevents JSON.parse crash if HTML is returned)
    const text = await res.text();
    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try { data = JSON.parse(text); } catch (err) { console.warn("JSON parse fail:", err, text); }
    }

    if (!res.ok) {
      const serverMsg = (data && (data.message || data.error)) || text || res.statusText;
      throw new Error(`Server ${res.status}: ${serverMsg}`);
    }

    // update local UI with returned user (server returns updated user)
    if (data) {
      // if server returned the updated user object, merge to local profile
      setProfile((p) => ({ ...p, ...data }));
    }

    setMessage({ type: "success", text: "Profile saved to server." });
  } catch (err) {
    console.error("Save profile error:", err);
    setMessage({ type: "error", text: `Failed to save profile: ${err.message}` });
  } finally {
    setSaving(false);
    setTimeout(() => setMessage(null), 4500);
  }
}

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((s) => ({ ...s, [name]: value }));
  }

  if (!user) {
    return (
      <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
        <Header />
        <main className="ciq-main" style={{ padding: "80px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 44, marginBottom: 8, color: "var(--ciq-dark)" }}>Profile</h1>
          <p style={{ color: "var(--ciq-muted)", marginBottom: 28 }}>You are not signed in.</p>

          <div style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
            <button
              onClick={() => openAuth({ tab: "login" })}
              className="ciq-primary"
              style={{ padding: "14px 34px", borderRadius: 28 }}
            >
              Sign in / Create account 
            </button>

            <button
              onClick={() => navigate("/about")}
              className="ciq-secondary"
              style={{ padding: "12px 22px", borderRadius: 28 }}
            >
              Learn more
            </button>
          </div>

          <p style={{ maxWidth: 760, margin: "36px auto 0", color: "var(--ciq-muted)" }}>
            Complete your profile after signing in — we’ll personalise your match results, show saved
            assessments, and let you export a small resume for submissions.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="ciq-root" style={{ background: "linear-gradient(180deg, #f6fbf9 0%, #edf7f3 100%)", minHeight: "100vh" }}>
      <Header />
      <main className="ciq-main" style={{ padding: "40px 20px" }}>
        <div className="ciq-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 18 }}>
            <button onClick={() => navigate(-1)} className="back-button">← Back</button>
          </div>

          {/* Header */}
          <header style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 22,
            flexWrap: "wrap"
          }}>
            <div style={{
              width: 110,
              height: 110,
              borderRadius: 18,
              background: "linear-gradient(135deg, #e6f9f1, #d4f1e6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 40,
              color: "#065f4b",
              boxShadow: "0 10px 30px rgba(6, 160, 120, 0.12)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}>
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </div>

            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 28, margin: 0, color: "var(--ciq-dark)" }}>{profile.name || "Your name"}</h1>
              <p style={{ margin: "8px 0 0", color: "var(--ciq-muted)" }}>
                {profile.headline || "Add a short headline (e.g. 'Computer Science student')"}
              </p>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
              <button
                onClick={() => { logout(); }}
                className="ciq-cta"
                style={{ padding: "10px 16px", borderRadius: 10 }}
              >
                Sign out
              </button>
            </div>
          </header>

          {/* layout grid: form (left) | summary (right) */}
          <div className="ciq-grid-two">
            {/* Form card */}
            <form onSubmit={handleSave} style={{
              background: "#fff",
              padding: 22,
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(6, 95, 75, 0.06)",
              border: "1px solid rgba(6, 95, 75, 0.04)"
            }}>
              <div className="profile-form-grid">
                <label style={{ display: "block" }}>
                  <div className="muted">Name</div>
                  <input name="name" value={profile.name} onChange={handleChange} className="text-input" />
                </label>

                <label style={{ display: "block" }}>
                  <div className="muted">Email</div>
                  <input name="email" value={profile.email} onChange={handleChange} className="text-input" />
                </label>

                <label style={{ display: "block" }}>
                  <div className="muted">Headline</div>
                  <input name="headline" value={profile.headline} onChange={handleChange} className="text-input" placeholder="e.g. Frontend dev • UX enthusiast" />
                </label>

                <label style={{ display: "block" }}>
                  <div className="muted">Location</div>
                  <input name="location" value={profile.location} onChange={handleChange} className="text-input" placeholder="City, Country" />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <div className="muted">About</div>
                  <textarea name="about" value={profile.about} onChange={handleChange} rows={5} className="text-input" placeholder="Short bio — what you like to do, goals, interests" />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <div className="muted">Education</div>
                  <input name="education" value={profile.education} onChange={handleChange} className="text-input" placeholder="College, degree, expected year" />
                </label>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button type="submit" className="ciq-primary" style={{ padding: "10px 18px", borderRadius: 10, minWidth: 140 }}>
                  {saving ? "Saving..." : "Save profile"}
                </button>

                {message && (
                  <div style={{
                    marginLeft: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: message.type === "error" ? "#ffecec" : "#ecffef",
                    color: message.type === "error" ? "#8b1e1e" : "#14632a"
                  }}>
                    {message.text}
                  </div>
                )}
              </div>
            </form>

            {/* Right column: cards */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "white", padding: 18, borderRadius: 12, boxShadow: "var(--card-shadow)" }}>
                <h4 style={{ marginTop: 0, marginBottom: 8 }}>Saved Results</h4>
                <p className="muted" style={{ margin: 0 }}>No saved results yet. Complete an assessment to generate matches.</p>
              </div>

            

              <div style={{ background: "linear-gradient(180deg,#fff,#fbfffd)", padding: 14, borderRadius: 12, border: "1px solid #eef7f2" }}>
                <h5 style={{ margin: "0 0 6px 0" }}>Quick actions</h5>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigate("/careers")} className="ciq-secondary" style={{ padding: "8px 12px", borderRadius: 8 }}>Browse careers</button>
                  <button onClick={() => navigate("/quiz")} className="ciq-primary" style={{ padding: "8px 12px", borderRadius: 8 }}>Take test</button>
                </div>
              </div>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}

// careeriq/src/pages/Profile.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import careers from "../data/careers.json";
import BackButton from "../components/BackButton";


export default function Profile() {

  

  const { user, openAuth, logout, getResults, deleteResult, getBookmarks } =
    useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setResults(getResults());
    setBookmarks(getBookmarks());
  }, []);

  // -----------------------------
  //   NOT LOGGED IN
  // -----------------------------
  if (!user) {
    return (
      <div className="ciq-container" style={{ paddingTop: 48 }}>
        <BackButton/>
        <h2>Profile</h2>
        <p className="muted">You are not signed in.</p>
        <button
          onClick={() => openAuth({ tab: "signup" })}
          className="ciq-primary"
        >
          Sign in / Sign up
        </button>
      </div>
    );
  }

  // -----------------------------
  //   GUEST USER
  // -----------------------------
  if (user && user.id === "guest") {
    return (
      <div className="ciq-container" style={{ paddingTop: 48 }}>
        <BackButton to="/" />

        <h2>Hello, Guest</h2>
        <p className="muted">
          You are using a guest session. Create a real account to save your
          results across devices.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={() => openAuth({ tab: "signup", email: user.email })}
            className="ciq-primary"
          >
            Complete account
          </button>

          <button onClick={logout} className="small-cta">
            Clear session
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------
  //   LOGGED IN USER
  // -----------------------------
  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton to="/" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>{user.name}'s Profile</h2>

        <button onClick={logout} className="small-cta">
          Log out
        </button>
      </div>

      {/* ---------------- SAVED RESULTS ---------------- */}
      <section style={{ marginTop: 32 }}>
        <h3>Saved Results</h3>

        {results.length === 0 ? (
          <p className="muted">
            No saved results yet. Complete the assessment to generate matches.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {results.map((r) => (
              <div
                key={r.id}
                className="card"
                style={{
                  padding: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {r.title || "Assessment Result"}
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {(r.matches || [])
                      .slice(0, 3)
                      .map((m) => {
                        const career =
                          careers.find((x) => x.id === m.careerId) || {
                            title: m.careerId,
                          };
                        return (
                          <div
                            key={m.careerId}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              background: "#f1fff8",
                              color: "#0f9a73",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {career.title.split(" ")[0]} {Math.round(m.score * 100)}%
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => handleExport(r)} className="small-cta">
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="small-cta"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- BOOKMARKS ---------------- */}
      <section style={{ marginTop: 40 }}>
        <h3>Bookmarks</h3>
        {bookmarks.length === 0 ? (
          <p className="muted">
            No bookmarked careers. Bookmark them from the homepage or careers
            list.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 14,
              marginTop: 14,
            }}
          >
            {bookmarks.map((id) => {
              const c = careers.find((x) => x.id === id) || { title: id };
              return (
                <div key={id} className="card" style={{ padding: 18 }}>
                  <h4 style={{ marginBottom: 6 }}>{c.title}</h4>
                  <div className="muted">{c.short}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

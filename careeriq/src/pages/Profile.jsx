// careeriq/src/pages/Profile.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import careers from "../data/careers.json";

export default function Profile(){
  const { user, openAuth, logout, getResults, deleteResult, getBookmarks } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(()=> { setResults(getResults()); setBookmarks(getBookmarks()); }, []);

  function handleExport(r){
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ciq-result-${r.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id){
    deleteResult(id);
    setResults(getResults());
  }

  if (!user) {
    return (
      <div className="ciq-container" style={{paddingTop:48}}>
        <h2>Profile</h2>
        <p className="muted">You are not signed in.</p>
        <button onClick={()=>openAuth({ tab: "signup" })} className="ciq-primary">Sign in / Sign up</button>
      </div>
    );
  }

  // guest case handled inside Profile (complete account UI)
  if (user && user.id === "guest") {
    return (
      <div className="ciq-container" style={{paddingTop:48}}>
        <h2>Hello, Guest</h2>
        <p className="muted">You are using a guest session. Create a real account to save results across devices.</p>
        <div style={{display:"flex", gap:12, marginTop:12}}>
          <button onClick={()=>openAuth({ tab:"signup", email: user.email })} className="ciq-primary">Complete account</button>
          <button onClick={logout} className="small-cta">Clear session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>{user.name}'s profile</h2>
        <div>
          <button onClick={logout} className="small-cta">Log out</button>
        </div>
      </div>

      <section style={{marginTop:22}}>
        <h3>Saved results</h3>
        {results.length === 0 ? <p className="muted">No saved results yet. Take the assessment to generate recommendations.</p> : (
          <div style={{display:"grid", gap:12, marginTop:12}}>
            {results.map(r => (
              <div key={r.id} className="card" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:800}}>{r.title || "Assessment result"}</div>
                  <div className="muted" style={{fontSize:13}}>Taken {new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{marginTop:8, display:"flex", gap:10}}>
                    {(r.matches || []).slice(0,3).map(m => (
                      <div key={m.careerId} style={{padding:"6px 10px", borderRadius:8, background:"#f1fff8", fontWeight:700}}>{m.careerId.toUpperCase()} {(Math.round(m.score*100))}%</div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button onClick={()=>handleExport(r)} className="small-cta">Export JSON</button>
                  <button onClick={()=>handleDelete(r.id)} className="small-cta">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{marginTop:28}}>
        <h3>Bookmarks</h3>
        {bookmarks.length === 0 ? <p className="muted">No bookmarked careers -- bookmark them from the homepage or careers list.</p> : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginTop:12}}>
            {bookmarks.map(id => {
              const c = careers.find(x=>x.id === id) || { id, title: id };
              return (
                <div key={id} className="card">
                  <h4 style={{margin:0}}>{c.title}</h4>
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

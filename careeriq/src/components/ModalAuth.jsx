// src/components/ModalAuth.jsx  (replace existing file)
import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function ModalAuth(){
  const { authOpen, closeAuth, login, signup } = useContext(AuthContext);
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authOpen) return null;

  // submit must be async
  async function submit(e){
    e.preventDefault();
    setError("");
    if (!email) return setError("Enter an email");
    // simple validation for signup
    if (tab === "signup" && !name) return setError("Enter your name");

    setLoading(true);
    try {
      if (tab === "login") {
        await login({ email, password });           // uses backend via AuthContext
      } else {
        // call signup from context
        await signup({ name, email, password });
      }
      // if succeeded, closeAuth is typically handled in AuthContext; close here as fallback
      closeAuth();
    } catch (err) {
      console.error("Auth error:", err);
      // try to surface a friendly message
      const msg = err?.body?.message || err?.message || "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(6,10,12,0.45)"
    }}>
      <div style={{width:420, borderRadius:14, background:"#fff", padding:22, boxShadow:"0 18px 60px rgba(6,10,12,0.2)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <div style={{display:"flex", gap:8}}>
            <button type="button" onClick={()=>setTab("login")} style={{padding:8, borderRadius:8, background: tab==="login" ? "#12b886" : "transparent", color: tab==="login" ? "#fff" : "#222" }}>Log in</button>
            <button type="button" onClick={()=>setTab("signup")} style={{padding:8, borderRadius:8, background: tab==="signup" ? "#12b886" : "transparent", color: tab==="signup" ? "#fff" : "#222" }}>Sign up</button>
          </div>
          <button onClick={closeAuth} style={{background:"transparent", border:0, fontSize:18}}>✕</button>
        </div>

        <form onSubmit={submit}>
          {tab === "signup" && (
            <div style={{marginBottom:10}}>
              <label style={{display:"block",fontSize:13}}>Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #e6eef0"}}/>
            </div>
          )}

          <div style={{marginBottom:10}}>
            <label style={{display:"block",fontSize:13}}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #e6eef0"}}/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:13}}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={{width:"100%", padding:10, borderRadius:8, border:"1px solid #e6eef0"}}/>
          </div>

          {error && <div style={{color:"crimson", marginBottom:10}}>{error}</div>}

          <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center"}}>
            <button type="submit" disabled={loading} style={{background:"#12b886", color:"#fff", border:0, padding:"10px 14px", borderRadius:10}}>
              {loading ? (tab === "login" ? "Logging in..." : "Creating...") : (tab === "login" ? "Log in" : "Create account")}
            </button>

            <button type="button" onClick={()=>{ login({ id:"guest", name:"Guest", email:"guest@ciq" }); }} style={{background:"transparent", border:0, color:"#64748b"}}>Continue as guest</button>
          </div>
        </form>
      </div>
    </div>
  );
}

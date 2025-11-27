import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function ModalAuth(){
  const { authOpen, closeAuth, login } = useContext(AuthContext);
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!authOpen) return null;

  function submit(e){
    e.preventDefault();
    // simple local signin/signup
    if (!email) return alert("Enter email");
    login({ id: email, name: name || "You", email });
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(6,10,12,0.45)"
    }}>
      <div style={{width:420, borderRadius:14, background:"#fff", padding:22, boxShadow:"0 18px 60px rgba(6,10,12,0.2)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <div style={{display:"flex", gap:8}}>
            <button onClick={()=>setTab("login")} style={{padding:8, borderRadius:8, background: tab==="login" ? "#12b886" : "transparent", color: tab==="login" ? "#fff" : "#222" }}>Log in</button>
            <button onClick={()=>setTab("signup")} style={{padding:8, borderRadius:8, background: tab==="signup" ? "#12b886" : "transparent", color: tab==="signup" ? "#fff" : "#222" }}>Sign up</button>
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

          <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center"}}>
            <button type="submit" style={{background:"#12b886", color:"#fff", border:0, padding:"10px 14px", borderRadius:10}}>{tab==="login" ? "Log in" : "Create account"}</button>
            <button type="button" onClick={()=>{ login({ id:"guest", name:"Guest", email:"guest@ciq" }); }} style={{background:"transparent", border:0, color:"#64748b"}}>Continue as guest</button>
          </div>
        </form>
      </div>
    </div>
  );
}

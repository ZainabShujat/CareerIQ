import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Header(){
  const { user, openAuth } = useContext(AuthContext);
  // if user exists show name, else show Profile button.
}

export default function Profile(){
  const { user, openAuth, logout } = useContext(AuthContext);
  if (!user) {
    return (
      <div className="ciq-container" style={{paddingTop:48}}>
        <h2>Profile</h2>
        <p className="muted">You are not signed in.</p>
        <button onClick={openAuth} className="ciq-primary">Sign in / Sign up</button>
      </div>
    );
  }
  return (
    <div className="ciq-container" style={{paddingTop:48}}>
      <h2>Welcome, {user.name}</h2>
      <p className="muted">Saved results will show here.</p>
      <button onClick={logout} className="small-cta">Log out</button>
    </div>
  );
}

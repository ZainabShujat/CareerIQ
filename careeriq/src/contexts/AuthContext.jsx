import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ciq_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  function openAuth() { setAuthOpen(true); }
  function closeAuth() { setAuthOpen(false); }

  function login({ id, name, email }) {
    const u = { id: id || `u_${Date.now()}`, name: name || "You", email };
    localStorage.setItem("ciq_user", JSON.stringify(u));
    setUser(u);
    closeAuth();
  }

  function logout() {
    localStorage.removeItem("ciq_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, openAuth, closeAuth, authOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

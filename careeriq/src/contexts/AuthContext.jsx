// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

// Helper: read/write token
const TOKEN_KEY = "ciq_token";
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

// Helper: small fetch wrapper that includes Authorization if token is present
// replace existing fetchWithAuth in src/contexts/AuthContext.jsx
const API_BASE = import.meta.env.VITE_API_BASE || ""; // e.g. "http://localhost:4000"

async function fetchWithAuth(pathOrUrl, opts = {}) {
  // if user passed a relative path, build full url using API_BASE
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}


export function AuthProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // validates token on mount

  // Open/close modal
  const openAuth = useCallback((opts = {}) => {
    // optionally pass { tab: "signup" } etc
    setAuthOpen(true);
    // could also persist tab selection if you want
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  // Load / validate token on app start
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      const token = getToken();
      if (!token) {
        if (mounted) { setUser(null); setLoading(false); }
        return;
      }
      try {
        // call protected endpoint to validate and load user
        const me = await fetchWithAuth("/api/auth/me", { method: "GET" });
        if (mounted) setUser(me);
      } catch (err) {
        // token invalid => purge
        console.warn("Auth init failed:", err);
        setToken(null);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  // login: accepts either credentials {email,password} or a local user object (guest)
  const login = useCallback(async (payload) => {
    // guest/local mode: if payload has no password and has id/email, treat as local
    if (payload && !payload.password && (payload.id || payload.email) && payload.name) {
      // local-only user (ModalAuth uses this for Continue as guest)
      setUser({ id: payload.id, name: payload.name, email: payload.email });
      setToken(null); // no JWT stored
      setAuthOpen(false);
      return { user: payload };
    }

    // otherwise expect { email, password }
    const { email, password } = payload || {};
    if (!email || !password) throw new Error("email & password required for login");
    const data = await fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // server returns { token, user }
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    setAuthOpen(false);
    return data.user;
  }, []);

  // signup (calls backend then signs in)
  const signup = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error("name, email, password required");
    const data = await fetchWithAuth("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    setAuthOpen(false);
    return data.user;
  }, []);

  // logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // optionally redirect to home in your UI
  }, []);

  // convenience: fetch /api/user/me (full profile route)
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await fetchWithAuth("/api/user/me", { method: "GET" });
      return profile;
    } catch (e) {
      // if 401, logout locally
      if (e.status === 401) logout();
      throw e;
    }
  }, [logout]);

  // placeholders used by Profile.jsx — implement as needed
  const getResults = useCallback(async () => {
    // implement: fetch saved results
    return [];
  }, []);
  const getBookmarks = useCallback(async () => {
    // implement: fetch bookmarks
    return [];
  }, []);
  const saveResult = useCallback(async (r) => {
    // implement: POST saved result
    return true;
  }, []);

  const value = {
    authOpen,
    openAuth,
    closeAuth,
    user,
    loading,
    login,
    signup,
    logout,
    fetchProfile,
    getResults,
    getBookmarks,
    saveResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

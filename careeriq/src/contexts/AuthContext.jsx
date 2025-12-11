// src/contexts/AuthContext.jsx
import React, { createContext, useCallback, useEffect, useState } from "react";

export const AuthContext = createContext();

// keys used in localStorage
const TOKEN_KEY = "ciq_token";
const BOOKMARKS_KEY = "ciq_bookmarks";

// API base (empty for local dev unless VITE_API_BASE is set)
const API_BASE = import.meta.env.VITE_API_BASE || "";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

/**
 * fetchWithAuth - small wrapper that automatically prefixes API_BASE if provided
 * and attaches Authorization header when token exists.
 */
async function fetchWithAuth(pathOrUrl, opts = {}) {
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
  const [loading, setLoading] = useState(true);

  const openAuth = useCallback((opts = {}) => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  // Validate token on mount and populate user
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const token = getToken();
      if (!token) { if (mounted) setLoading(false); return; }
      try {
        const me = await fetchWithAuth("/api/auth/me", { method: "GET" });
        if (mounted) setUser(me);
      } catch (err) {
        console.warn("Auth init failed:", err);
        setToken(null);
        if (mounted) setUser(null);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  // LOGIN - supports guest mode when no password provided (local-only)
  const login = useCallback(async (payload) => {
    if (payload && !payload.password && (payload.id || payload.email) && payload.name) {
      // guest/local user
      setUser({ id: payload.id, name: payload.name, email: payload.email });
      setToken(null);
      setAuthOpen(false);
      return { user: payload };
    }

    const { email, password } = payload || {};
    if (!email || !password) throw new Error("email & password required for login");

    const response = await fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // debug: show raw response so we can inspect deployed behavior
    console.log("LOGIN RESPONSE:", response);

    if (!response.token) throw new Error("Login response missing token");
    setToken(response.token);
    if (response.user) setUser(response.user);
    setAuthOpen(false);
    return response.user;
  }, []);

  // SIGNUP
  const signup = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error("name, email, password required");
    const response = await fetchWithAuth("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    console.log("SIGNUP RESPONSE:", response);

    if (!response.token) throw new Error("Signup response missing token");
    setToken(response.token);
    if (response.user) setUser(response.user);
    setAuthOpen(false);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  // getBookmarks: always returns an array (guest-local storage fallback)
  const getBookmarks = useCallback(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, []);

  // toggleBookmark: stores locally (guest) — you can extend to call backend when logged in
  const toggleBookmark = useCallback((id) => {
    try {
      const current = getBookmarks();
      const exists = current.includes(id);
      const next = exists ? current.filter((x) => x !== id) : [...current, id];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    } catch (e) {
      console.warn("toggleBookmark error", e);
      return [];
    }
  }, [getBookmarks]);

  // placeholder functions you can expand
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await fetchWithAuth("/api/user/me", { method: "GET" });
      return profile;
    } catch (e) {
      if (e.status === 401) logout();
      throw e;
    }
  }, [logout]);

  const getResults = useCallback(async () => {
    try {
      const r = await fetchWithAuth("/api/results", { method: "GET" });
      return Array.isArray(r) ? r : [];
    } catch (e) {
      return [];
    }
  }, []);

  const saveResult = useCallback(async (payload) => {
    try {
      const r = await fetchWithAuth("/api/results", { method: "POST", body: JSON.stringify(payload) });
      return r;
    } catch (e) {
      console.warn("saveResult failed", e);
      return null;
    }
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
    fetchWithAuth,
    getBookmarks,
    toggleBookmark,
    fetchProfile,
    getResults,
    saveResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

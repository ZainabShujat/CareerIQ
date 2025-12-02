// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const STORAGE_KEY = "ciq_auth_v1";
const BOOKMARKS_KEY = "ciq_bookmarks_v1";
const RESULTS_KEY = "ciq_results_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email }
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // optional props from openAuth

  // load saved user
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  // API: openAuth({ tab, email }) — used by ProfileButton or pages to open modal
  function openAuth(opts = {}) {
    setAuthTab(opts.tab || "login");
    setAuthOpen(true);
  }
  function closeAuth() {
    setAuthOpen(false);
  }

  // simple mock login/signup
  function login({ email, name }) {
    // in a real app, call backend. Here we just create a fake user
    const u = { id: email || "user-"+Date.now(), name: name || email?.split("@")[0] || "User", email };
    setUser(u);
    setAuthOpen(false);
    return u;
  }
  function guestLogin() {
    const g = { id: "guest", name: "Guest", email: `guest@ciq.${Date.now()}` };
    setUser(g);
    setAuthOpen(false);
    return g;
  }

  function logout() {
    setUser(null);
  }

  // bookmarks/results persisted locally
  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function toggleBookmark(id) {
    const arr = new Set(getBookmarks());
    if (arr.has(id)) arr.delete(id);
    else arr.add(id);
    const out = [...arr];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(out));
    return out;
  }

  function getResults() {
    try {
      return JSON.parse(localStorage.getItem(RESULTS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveResult(r) {
    const arr = getResults();
    arr.unshift(r);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(arr));
    return arr;
  }
  function deleteResult(id) {
    const arr = getResults().filter(x => x.id !== id);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(arr));
    return arr;
  }

  return (
    <AuthContext.Provider value={{
      user,
      openAuth,
      closeAuth,
      authOpen,
      authTab,
      login,
      logout,
      guestLogin,
      getBookmarks,
      toggleBookmark,
      getResults,
      saveResult,
      deleteResult
    }}>
      {children}
    </AuthContext.Provider>
  );
}

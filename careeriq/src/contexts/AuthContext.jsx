// careeriq/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const RESULTS_KEY = "ciq_results";
const BOOKMARKS_KEY = "ciq_bookmarks";
const USER_KEY = "ciq_user";

function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // { id, name, email }
  const [authOpen, setAuthOpen] = useState(false);
  const [authPrefill, setAuthPrefill] = useState(null);

  useEffect(() => {
    const u = readJSON(USER_KEY, null);
    setUser(u);
  }, []);

  function openAuth(prefill) { if (prefill) setAuthPrefill(prefill); setAuthOpen(true); }
  function closeAuth() { setAuthOpen(false); setAuthPrefill(null); }

  function login({ id, name, email }) {
    const u = { id: id || `u_${Date.now()}`, name: name || "You", email };
    writeJSON(USER_KEY, u);
    setUser(u);
    closeAuth();
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  function upgradeAccount({ name, email }) {
    const newUser = { id: email, name: name || email.split("@")[0], email };
    writeJSON(USER_KEY, newUser);
    setUser(newUser);
    closeAuth();
  }

  /* --- Results (save / list / delete) --- */
  function getResults() {
    return readJSON(RESULTS_KEY, []);
  }
  function saveResult(result) {
    // result should be an object with id (optional); we'll generate id if missing
    const current = readJSON(RESULTS_KEY, []);
    const r = { id: result.id || `r_${Date.now()}`, createdAt: Date.now(), ...result };
    current.unshift(r);
    writeJSON(RESULTS_KEY, current);
    return r;
  }
  function deleteResult(resultId) {
    const current = readJSON(RESULTS_KEY, []);
    const filtered = current.filter(r=> r.id !== resultId);
    writeJSON(RESULTS_KEY, filtered);
  }

  /* --- Bookmarks (toggle / list / check) --- */
  function getBookmarks() {
    return readJSON(BOOKMARKS_KEY, []);
  }
  function toggleBookmark(careerId) {
    const list = readJSON(BOOKMARKS_KEY, []);
    const idx = list.indexOf(careerId);
    if (idx === -1) {
      list.push(careerId);
    } else {
      list.splice(idx, 1);
    }
    writeJSON(BOOKMARKS_KEY, list);
    return list;
  }
  function isBookmarked(careerId) {
    const list = readJSON(BOOKMARKS_KEY, []);
    return list.includes(careerId);
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, openAuth, closeAuth, authOpen, authPrefill, upgradeAccount,
      /* results */
      getResults, saveResult, deleteResult,
      /* bookmarks */
      getBookmarks, toggleBookmark, isBookmarked
    }}>
      {children}
    </AuthContext.Provider>
  );
}

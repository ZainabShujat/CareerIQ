// src/pages/Chatbot.jsx — Dedicated AI Career Chatbot page
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const SUGGESTED_QUESTIONS = [
  "What career should I pursue based on my results?",
  "How do I break into data science?",
  "Compare software engineering vs product management for me.",
  "What skills should I build to become a UX designer?",
  "I'm good at analytical thinking but prefer working alone. What suits me?",
];

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your CareerIQ assistant. I can help you explore career paths, compare roles, and identify what you should focus on. What's on your mind?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getProfile = () => {
    let personality = null;
    try { personality = JSON.parse(localStorage.getItem("careerIQ_personality")); } catch {}
    return {
      name: user?.name || "User",
      personality: personality?.scores || user?.personality?.scores || null,
      skills: user?.results?.reduce((acc, r) => { acc[r.testId] = r.score; return acc; }, {}) || null,
    };
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, profile: getProfile(), tests: getProfile().skills }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content || data.error || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to connect to the AI. Please check your Render backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { maxWidth: 800, margin: "0 auto", padding: 24, fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 16 },
    title: { fontSize: 26, fontWeight: 700, margin: 0 },
    subtitle: { color: "#556b62", marginTop: 4, fontSize: 14 },
    window: {
      background: "#fff", borderRadius: 16, border: "1px solid #e0ede6",
      boxShadow: "0 4px 24px rgba(10,30,20,0.07)", overflow: "hidden",
      display: "flex", flexDirection: "column", height: "62vh"
    },
    messagesArea: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 },
    bubble: (role) => ({
      maxWidth: "78%", alignSelf: role === "user" ? "flex-end" : "flex-start",
      padding: "12px 16px", borderRadius: role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: role === "user" ? "#1a3c34" : "#f3f9f5",
      color: role === "user" ? "#fff" : "#1a3c34",
      fontSize: 14, lineHeight: 1.6,
      boxShadow: role === "user" ? "0 2px 12px rgba(26,60,52,0.2)" : "0 2px 8px rgba(0,0,0,0.04)"
    }),
    inputArea: {
      borderTop: "1px solid #e0ede6", padding: "14px 16px",
      display: "flex", gap: 10, alignItems: "flex-end", background: "#fafcfb"
    },
    textarea: {
      flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #cddbd4",
      fontFamily: "inherit", fontSize: 14, resize: "none", outline: "none",
      background: "#fff", color: "#1a3c34", lineHeight: 1.5, minHeight: 44, maxHeight: 120
    },
    sendBtn: {
      padding: "10px 18px", borderRadius: 10, background: "#1a3c34", color: "#fff",
      border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
      opacity: loading ? 0.7 : 1
    },
    suggested: { marginTop: 14 },
    suggestedTitle: { fontSize: 12, color: "#7b8b82", fontWeight: 600, marginBottom: 8 },
    chips: { display: "flex", gap: 8, flexWrap: "wrap" },
    chip: {
      padding: "7px 13px", borderRadius: 20, border: "1px solid #cddbd4",
      fontSize: 12, color: "#1a3c34", background: "#fff", cursor: "pointer",
      transition: "all 0.15s ease"
    },
    dots: { display: "flex", gap: 4, alignItems: "center", padding: "4px 0" },
    dot: (i) => ({
      width: 8, height: 8, borderRadius: "50%", background: "#1a3c34",
      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
    })
  };

  return (
    <div style={s.page}>
      <BackButton />
      <div style={s.header}>
        <h1 style={s.title}>AI Career Advisor</h1>
        <div style={s.subtitle}>
          Ask anything about careers — comparisons, skill gaps, what to focus on next.
          {user ? ` Your profile is loaded, ${user.name.split(" ")[0]}.` : " Sign in to personalise responses."}
        </div>
      </div>

      <div style={s.window}>
        <div style={s.messagesArea}>
          {messages.map((msg, i) => (
            <div key={i} style={s.bubble(msg.role)}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{ ...s.bubble("assistant"), padding: "14px 18px" }}>
              <div style={s.dots}>
                {[0,1,2].map(i => <div key={i} style={s.dot(i)} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={s.inputArea}>
          <textarea
            style={s.textarea}
            placeholder="Ask about careers, skills, or what path suits you..."
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={1}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button style={s.sendBtn} onClick={() => sendMessage()} disabled={loading}>
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      <div style={s.suggested}>
        <div style={s.suggestedTitle}>💡 TRY ASKING</div>
        <div style={s.chips}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              style={s.chip}
              onClick={() => sendMessage(q)}
              onMouseEnter={e => { e.target.style.background = "#f0faf4"; e.target.style.borderColor = "#1a3c34"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#cddbd4"; }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

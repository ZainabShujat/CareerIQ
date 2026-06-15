// src/pages/Chatbot.jsx — Full-screen AI Career Chatbot (ChatGPT-style)
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const SUGGESTED_QUESTIONS = [
  "What career suits my profile?",
  "How do I break into data science?",
  "Compare software engineering vs product management",
  "What skills should I build for AI/ML?",
  "I prefer working alone — what careers suit me?",
  "What salary can I expect as a data scientist?",
];

// ── Lightweight inline Markdown renderer ─────────────────────────────────────
function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  let tableBuffer = [];
  let inTable = false;

  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    return parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={pi} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={pi} style={{ background: "rgba(255,255,255,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: "0.88em", fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
      if (part.startsWith("_") && part.endsWith("_"))
        return <em key={pi}>{part.slice(1, -1)}</em>;
      return part;
    });
  };

  const flushTable = () => {
    const rows = tableBuffer.filter(r => !r.match(/^\|[-| :]+\|$/));
    if (rows.length > 0) {
      elements.push(
        <div key={`tbl-${elements.length}`} style={{ overflowX: "auto", margin: "12px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").slice(1, -1);
                const Tag = ri === 0 ? "th" : "td";
                return (
                  <tr key={ri} style={{ background: ri === 0 ? "rgba(255,255,255,0.08)" : ri % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent" }}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", textAlign: "left", fontWeight: ri === 0 ? 700 : 400, color: "inherit", whiteSpace: "nowrap" }}>
                        {renderInline(cell.trim())}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
    inTable = false;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("|")) {
      inTable = true;
      tableBuffer.push(line);
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${i}`} style={{ fontSize: 15, fontWeight: 800, margin: "18px 0 8px", color: "inherit", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6 }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${i}`} style={{ fontSize: 13.5, fontWeight: 700, margin: "14px 0 6px", color: "inherit" }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={`hr-${i}`} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.12)", margin: "14px 0" }} />);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={`ol-${i}`} style={{ display: "flex", gap: 10, margin: "4px 0" }}>
          <span style={{ minWidth: 20, fontWeight: 700, opacity: 0.6, flexShrink: 0, fontSize: 13 }}>{line.match(/^(\d+)\./)?.[1]}.</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={`ul-${i}`} style={{ display: "flex", gap: 10, margin: "3px 0", paddingLeft: 4 }}>
          <span style={{ opacity: 0.5, marginTop: 2, flexShrink: 0, fontSize: 13 }}>•</span>
          <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} style={{ height: 6 }} />);
    } else {
      elements.push(<p key={`p-${i}`} style={{ margin: "4px 0", fontSize: 13.5, lineHeight: 1.7 }}>{renderInline(line)}</p>);
    }
    i++;
  }
  if (inTable) flushTable();
  return <div>{elements}</div>;
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "## Hey! I'm CareerIQ AI 👋\n\nI'm an ML-powered career advisor that uses **trait-vector cosine similarity** to match your personality and skills to the right careers.\n\nAsk me anything:\n- **Career recommendations** based on your profile\n- **Salary ranges** across industries\n- **How to break into** a new field\n- **Compare careers** side-by-side\n- **Skills & learning roadmaps**"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Focus on mount
    textareaRef.current?.focus();
  }, []);

  const getProfile = () => {
    let personality = null;
    let skills = null;
    try { personality = JSON.parse(localStorage.getItem("careerIQ_personality")); } catch {}
    try { skills = JSON.parse(localStorage.getItem("careerIQ_skills")); } catch {}
    return {
      name: user?.name || "User",
      personality: personality?.scores || user?.personality?.scores || null,
      skills: skills?.scores || user?.results?.reduce((acc, r) => { acc[r.testId] = r.score; return acc; }, {}) || null,
    };
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.focus();
    }
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const profile = getProfile();
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, profile, tests: profile.skills }),
      });
      const data = await res.json();
      setSource(data.source || "ml-engine");
      setMessages(prev => [...prev, { role: "assistant", content: data.content || data.error || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Could not reach the backend. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "24px";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const isFirstMessage = messages.length === 1;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg, #0d1f1a 0%, #0a1c17 50%, #091510 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#e8f0ec",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.2)", backdropFilter: "blur(12px)",
        flexShrink: 0, zIndex: 10
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#c8ddd4", borderRadius: 10, padding: "7px 14px",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            transition: "all 0.15s", fontFamily: "inherit"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        >
          ← Back
        </button>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #06a77d, #04c48a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 0 12px rgba(6,167,125,0.4)"
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#e8f0ec", lineHeight: 1.2 }}>CareerIQ AI</div>
            <div style={{ fontSize: 11, color: "#5a9e82", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06a77d", display: "inline-block", animation: "pulse 2s infinite" }} />
              ML-Powered • Cosine Similarity Matching
            </div>
          </div>
        </div>

        {/* User badge */}
        <div style={{
          background: "rgba(6,167,125,0.12)", border: "1px solid rgba(6,167,125,0.25)",
          borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#5a9e82", fontWeight: 600
        }}>
          {user ? `✓ ${user.name.split(" ")[0]}` : "Guest"}
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "0 0 8px",
        scrollBehavior: "smooth",
      }}>
        {/* Empty state — show suggested questions */}
        {isFirstMessage && (
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 0" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#4a7a62", fontWeight: 700, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
                Try asking
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: "9px 16px", borderRadius: 20,
                      border: "1px solid rgba(6,167,125,0.25)",
                      background: "rgba(6,167,125,0.08)",
                      color: "#a8d4bc", fontSize: 13, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,167,125,0.18)"; e.currentTarget.style.color = "#d4ede2"; e.currentTarget.style.borderColor = "rgba(6,167,125,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,167,125,0.08)"; e.currentTarget.style.color = "#a8d4bc"; e.currentTarget.style.borderColor = "rgba(6,167,125,0.25)"; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              padding: msg.role === "assistant" ? "22px 0" : "22px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: msg.role === "assistant" ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "assistant"
                  ? "linear-gradient(135deg, #06a77d, #04c48a)"
                  : "linear-gradient(135deg, #2a5245, #1a3c34)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginTop: 2,
                boxShadow: msg.role === "assistant" ? "0 0 10px rgba(6,167,125,0.3)" : "none"
              }}>
                {msg.role === "assistant" ? "🤖" : (user?.name?.[0] || "U")}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: msg.role === "assistant" ? "#4a9e82" : "#7a9a8a", marginBottom: 8, letterSpacing: 0.3 }}>
                  {msg.role === "assistant" ? "CareerIQ AI" : (user?.name?.split(" ")[0] || "You")}
                </div>
                <div style={{ color: "#dceee5", lineHeight: 1.7 }}>
                  {msg.role === "assistant"
                    ? <MarkdownText text={msg.content} />
                    : <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{msg.content}</p>
                  }
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{
            padding: "22px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ maxWidth: 740, margin: "0 auto", padding: "0 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #06a77d, #04c48a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 0 10px rgba(6,167,125,0.3)"
              }}>🤖</div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4a9e82", marginBottom: 10, letterSpacing: 0.3 }}>CareerIQ AI</div>
                <TypingDots />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: 8 }} />
      </div>

      {/* ── Input Area ── */}
      <div style={{
        flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.25)", backdropFilter: "blur(12px)",
        padding: "16px 24px 20px",
      }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {/* Input box */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14, padding: "10px 12px 10px 18px",
            transition: "border-color 0.2s",
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(6,167,125,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(6,167,125,0.08)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about careers, skills, salary, or anything career-related..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e8f0ec", fontSize: 14, lineHeight: 1.6, resize: "none",
                fontFamily: "inherit", minHeight: 24, maxHeight: 150,
                "::placeholder": { color: "rgba(255,255,255,0.3)" }
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 9, border: "none",
                background: loading || !input.trim()
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #06a77d, #04c48a)",
                color: loading || !input.trim() ? "rgba(255,255,255,0.3)" : "#fff",
                cursor: loading || !input.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0, transition: "all 0.2s",
                boxShadow: loading || !input.trim() ? "none" : "0 2px 8px rgba(6,167,125,0.4)"
              }}
              title="Send (Enter)"
            >
              {loading ? (
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : "↑"}
            </button>
          </div>

          {/* Footer info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "0 2px" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Press Enter to send · Shift+Enter for new line
            </span>
            {source && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                {source === "openai" ? "⚡ OpenAI GPT-3.5" : "🧠 CareerIQ ML Engine"}
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        *::-webkit-scrollbar { width: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

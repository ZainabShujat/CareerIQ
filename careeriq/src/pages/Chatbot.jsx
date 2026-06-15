// src/pages/Chatbot.jsx — ML-Powered AI Career Chatbot
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import BackButton from "../components/BackButton";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const SUGGESTED_QUESTIONS = [
  "What career suits my profile?",
  "How do I break into data science?",
  "Compare software engineering vs product management",
  "What skills should I build for AI/ML?",
  "I prefer working alone — what careers suit me?",
  "What salary can I expect as a data scientist?",
];

// ── Lightweight Markdown renderer (no external deps) ─────────────────────────
function MarkdownText({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  let tableBuffer = [];
  let inTable = false;

  const flushTable = () => {
    if (tableBuffer.length < 2) {
      tableBuffer.forEach(l => elements.push(<p key={elements.length} style={{ margin: "4px 0", color: "inherit", fontSize: 13.5, lineHeight: 1.65 }}>{renderInline(l)}</p>));
      tableBuffer = [];
      inTable = false;
      return;
    }
    const rows = tableBuffer.filter(r => !r.match(/^\|[-| ]+\|$/));
    elements.push(
      <div key={elements.length} style={{ overflowX: "auto", margin: "10px 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
          <tbody>
            {rows.map((row, ri) => {
              const cells = row.split("|").filter((_, ci) => ci > 0 && ci < row.split("|").length - 1);
              const Tag = ri === 0 ? "th" : "td";
              return (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.08)" : "transparent" }}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} style={{ padding: "6px 10px", border: "1px solid rgba(255,255,255,0.15)", textAlign: "left", fontWeight: ri === 0 ? 700 : 400, color: "inherit", whiteSpace: "nowrap" }}>
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
    tableBuffer = [];
    inTable = false;
  };

  const renderInline = (str) => {
    // Bold **text**
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    return parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={pi}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={pi} style={{ background: "rgba(0,0,0,0.25)", padding: "1px 5px", borderRadius: 3, fontSize: "0.9em", fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
      if (part.startsWith("_") && part.endsWith("_")) return <em key={pi}>{part.slice(1, -1)}</em>;
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.startsWith("|")) {
      if (!inTable) inTable = true;
      tableBuffer.push(line);
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(<h2 key={elements.length} style={{ fontSize: 16, fontWeight: 800, margin: "16px 0 8px", color: "inherit", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 4 }}>{renderInline(line.slice(3))}</h2>);
    }
    // H3
    else if (line.startsWith("### ")) {
      elements.push(<h3 key={elements.length} style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 6px", color: "inherit" }}>{renderInline(line.slice(4))}</h3>);
    }
    // HR
    else if (line.startsWith("---")) {
      elements.push(<hr key={elements.length} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "12px 0" }} />);
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      elements.push(<div key={elements.length} style={{ display: "flex", gap: 8, margin: "4px 0" }}>
        <span style={{ minWidth: 18, fontWeight: 700, color: "inherit", opacity: 0.7 }}>{line.match(/^(\d+)\./)?.[1]}.</span>
        <span style={{ fontSize: 13.5, lineHeight: 1.65, color: "inherit" }}>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
      </div>);
    }
    // Bullet
    else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(<div key={elements.length} style={{ display: "flex", gap: 8, margin: "3px 0", paddingLeft: 4 }}>
        <span style={{ color: "inherit", opacity: 0.6, marginTop: 2, flexShrink: 0 }}>•</span>
        <span style={{ fontSize: 13.5, lineHeight: 1.65, color: "inherit" }}>{renderInline(line.slice(2))}</span>
      </div>);
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={elements.length} style={{ height: 8 }} />);
    }
    // Normal paragraph
    else if (line.trim()) {
      elements.push(<p key={elements.length} style={{ margin: "4px 0", color: "inherit", fontSize: 13.5, lineHeight: 1.65 }}>{renderInline(line)}</p>);
    }
    i++;
  }

  if (inTable) flushTable();
  return <div>{elements}</div>;
}

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "## Welcome to CareerIQ AI 👋\n\nI'm powered by an ML-based career matching engine that analyses your profile to give personalised advice.\n\nI can help you:\n- **Discover** careers that match your traits\n- **Compare** career paths side-by-side\n- **Plan** your learning roadmap\n- **Understand** salary ranges and market demand\n\nWhat's on your mind?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
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

  // Auto-grow textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "44px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <BackButton />
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0a2118" }}>AI Career Advisor</h1>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "linear-gradient(135deg, #06a77d, #058a68)",
            color: "#fff", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s ease-in-out infinite" }} />
            ML-POWERED
          </span>
        </div>
        <div style={{ color: "#556b62", fontSize: 13.5 }}>
          Personalised career advice using trait-vector cosine similarity matching.
          {user ? <span style={{ color: "#06a77d", marginLeft: 6 }}>Profile loaded for {user.name.split(" ")[0]} ✓</span> : " Sign in to personalise responses."}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        background: "#fff", borderRadius: 18, border: "1px solid #e0ede6",
        boxShadow: "0 4px 32px rgba(10,30,20,0.08)", overflow: "hidden",
        display: "flex", flexDirection: "column", height: "65vh"
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              maxWidth: msg.role === "user" ? "78%" : "92%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              display: "flex", flexDirection: "column", gap: 2
            }}>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #06a77d, #058a68)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🤖</div>
                  <span style={{ fontSize: 11, color: "#8aa08e", fontWeight: 600 }}>CareerIQ AI</span>
                </div>
              )}
              <div style={{
                padding: msg.role === "user" ? "11px 16px" : "14px 18px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #1a3c34, #0d2a22)"
                  : "linear-gradient(180deg, #f5faf7, #eef7f1)",
                color: msg.role === "user" ? "#fff" : "#0a2118",
                boxShadow: msg.role === "user" ? "0 2px 12px rgba(26,60,52,0.25)" : "0 2px 10px rgba(0,0,0,0.04)",
                border: msg.role === "assistant" ? "1px solid #ddeee5" : "none",
              }}>
                {msg.role === "assistant"
                  ? <MarkdownText text={msg.content} />
                  : <span style={{ fontSize: 13.5, lineHeight: 1.6 }}>{msg.content}</span>
                }
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #06a77d, #058a68)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🤖</div>
                <span style={{ fontSize: 11, color: "#8aa08e", fontWeight: 600 }}>CareerIQ AI is thinking...</span>
              </div>
              <div style={{
                padding: "14px 18px", borderRadius: "4px 18px 18px 18px",
                background: "linear-gradient(180deg, #f5faf7, #eef7f1)",
                border: "1px solid #ddeee5",
                display: "flex", gap: 5, alignItems: "center"
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#06a77d",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: "1px solid #e8f0ec", padding: "12px 16px",
          background: "#fafcfb", display: "flex", gap: 10, alignItems: "flex-end"
        }}>
          <textarea
            ref={textareaRef}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 12,
              border: "1px solid #cddbd4", fontFamily: "inherit", fontSize: 14,
              resize: "none", outline: "none", background: "#fff", color: "#0a2118",
              lineHeight: 1.5, minHeight: 44, maxHeight: 120, transition: "border-color 0.15s"
            }}
            placeholder="Ask about careers, skills, salary, or what path suits you..."
            value={input}
            onChange={handleInput}
            rows={1}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onFocus={e => { e.target.style.borderColor = "#06a77d"; }}
            onBlur={e => { e.target.style.borderColor = "#cddbd4"; }}
          />
          <button
            style={{
              padding: "10px 20px", borderRadius: 12,
              background: loading ? "#6b8c80" : "linear-gradient(135deg, #1a3c34, #0d5c42)",
              color: "#fff", border: "none", cursor: loading ? "default" : "pointer",
              fontWeight: 700, fontSize: 14, transition: "all 0.2s", whiteSpace: "nowrap",
              boxShadow: loading ? "none" : "0 2px 8px rgba(26,60,52,0.3)"
            }}
            onClick={() => sendMessage()}
            disabled={loading}
          >
            {loading ? "..." : "Send ↑"}
          </button>
        </div>
      </div>

      {/* Suggested questions */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#7b8b82", fontWeight: 700, letterSpacing: 0.8, marginBottom: 10 }}>💡 TRY ASKING</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              style={{
                padding: "7px 14px", borderRadius: 20, border: "1px solid #cddbd4",
                fontSize: 12, color: "#1a3c34", background: "#fff", cursor: "pointer",
                transition: "all 0.15s ease", fontFamily: "inherit"
              }}
              onClick={() => sendMessage(q)}
              onMouseEnter={e => { e.target.style.background = "#f0faf4"; e.target.style.borderColor = "#06a77d"; e.target.style.color = "#06a77d"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#cddbd4"; e.target.style.color = "#1a3c34"; }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Source badge */}
      {source && (
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "#9bada6" }}>
          {source === "openai" ? "⚡ Powered by OpenAI GPT-3.5" : "🧠 Powered by CareerIQ ML Engine (TF-IDF + Cosine Similarity)"}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

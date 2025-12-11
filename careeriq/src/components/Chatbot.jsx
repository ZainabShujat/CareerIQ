// src/components/Chatbot.jsx
import React, { useState } from "react";

export default function Chatbot({ initialContext = [] }) {
  const [messages, setMessages] = useState(initialContext);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: json.content || "Sorry, no response" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Error: unable to reach AI" }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ border: "1px solid #e8f2ec", borderRadius: 12, padding: 12, background: "#fff" }}>
      <div style={{ maxHeight: 240, overflow: "auto", padding: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.role === "user" ? "right" : "left" }}>
            <div style={{
              display: "inline-block",
              padding: "8px 10px",
              borderRadius: 8,
              background: m.role === "user" ? "#eaf8f1" : "#f3f6f4",
              fontSize: 14,
            }}>{m.content}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask the career assistant..." className="text-input" />
        <button className="small-cta" onClick={send} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
    </div>
  );
}

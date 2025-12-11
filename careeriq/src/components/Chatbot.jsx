// src/components/Chatbot.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function Chatbot() {
  const { user, fetchProfile } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const profile = user ? await fetchProfile().catch(() => user) : { name: "Guest" };
      const payload = { message: userMsg.content, profile, tests: { topSkill: "programming", scores: { programming: 72 } }, happiness: {} };

      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const botText = data?.content || data?.reply || "Sorry, I couldn't respond.";
      setMessages(prev => [...prev, { role: "assistant", content: botText }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border rounded shadow-sm w-full md:w-80">
      <div style={{maxHeight: 300, overflowY: "auto"}} className="mb-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
            <div className={m.role === "user" ? "inline-block bg-blue-500 text-white p-2 rounded" : "inline-block bg-gray-100 p-2 rounded"}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ask career advice..." />
        <button onClick={sendMessage} disabled={loading} className="btn">{loading ? "..." : "Send"}</button>
      </div>
    </div>
  );
}

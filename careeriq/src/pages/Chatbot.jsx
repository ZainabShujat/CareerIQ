// src/pages/Chatbot.jsx
import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your CareerIQ Assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const containerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input;
    setMessages(prev => [...prev, { sender: "you", text: msg }]);
    setInput("");

    setTimeout(() => {
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, 80);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          user: user ? { name: user.name } : null
        }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { text: data.reply || data.content || "Hmm... something went wrong."}
      ]);

      setTimeout(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
      }, 80);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Network error. Try again later." }
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CareerIQ Chatbot</h1>

      <div
        ref={containerRef}
        className="border rounded-lg p-4 bg-white h-[480px] overflow-y-auto shadow"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-2 p-2 rounded-lg max-w-[70%] ${
              m.sender === "you"
                ? "ml-auto bg-green-100"
                : "mr-auto bg-slate-100"
            }`}
          >
            <strong>{m.sender === "you" ? "You" : "AI"}</strong>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}

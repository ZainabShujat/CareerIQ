// src/pages/PersonalityTest.jsx (replace previous PersonalityTest)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const makeQuestions = () => {
  const arr = [];
  for (let i = 1; i <= 12; i++) {
    arr.push({ id: `p${i}`, text: `Q${i}: sample statement — rate 1-5` });
  }
  return arr;
};

export default function PersonalityTest() {
  const navigate = useNavigate();
  const questions = makeQuestions();
  const [answers, setAnswers] = useState({});

  function setVal(id, val) {
    setAnswers((a) => ({ ...a, [id]: val }));
  }

  async function submit() {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions");
      return;
    }

    const payload = { answers, takenAt: new Date().toISOString() };

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save result");
      }

      const json = await res.json();
      // if backend returns a result id, go to result detail, else to /results
      const id = json.id || json._id;
      if (id) navigate(`/results/${id}`);
      else navigate("/results");
    } catch (e) {
      console.error(e);
      alert("Unable to save result: " + (e.message || ""));
    }
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Personality Test</h1>
      <div className="muted">12-question assessment — takes ~5 minutes.</div>

      <div style={{ marginTop: 18 }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{ marginBottom: 12, background: "#fff", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{i + 1}. {q.text}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === v} onChange={() => setVal(q.id, v)} /> {v}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="ciq-primary" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}

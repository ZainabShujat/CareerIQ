// src/pages/PersonalityTest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const makeQuestions = () => {
  // quick filler 24 q; replace with your real content
  const arr = [];
  for (let i=1;i<=24;i++){
    arr.push({
      id: `p${i}`,
      text: `Question ${i} — sample statement (rate 1-5)`,
    });
  }
  return arr;
};

export default function PersonalityTest(){
  const navigate = useNavigate();
  const questions = makeQuestions();
  const [answers, setAnswers] = useState({});

  function setVal(id, val){
    setAnswers(a => ({...a, [id]: val}));
  }

  async function submit(){
    // minimal validation
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions");
      return;
    }

    // send to backend
    const payload = {
      answers,
      takenAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      // backend should respond with a result id or matches
      const resultId = json.id || "";
      // redirect to results (if you have route)
      navigate("/results");
    } catch(e){
      console.error(e);
      alert("Unable to save result");
    }
  }

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />
      <h1>Personality Test</h1>
      <div className="muted">24-question assessment — takes ~7 minutes.</div>

      <div style={{ marginTop: 18 }}>
        {questions.map((q,i) => (
          <div key={q.id} style={{ marginBottom: 12, background:"#fff", padding:12, borderRadius:8 }}>
            <div style={{ fontWeight:700 }}>{i+1}. {q.text}</div>
            <div style={{ marginTop:8, display:"flex", gap:8 }}>
              {[1,2,3,4,5].map(v => (
                <label key={v}>
                  <input type="radio" name={q.id} checked={answers[q.id]===v} onChange={() => setVal(q.id, v)} /> {v}
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

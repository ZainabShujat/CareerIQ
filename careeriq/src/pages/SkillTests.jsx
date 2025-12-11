// src/pages/SkillTests.jsx
import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";


function TestTile({ meta, onStart }) {
  return (
    <div className="card" style={{ padding:16 }}>
      <h3 style={{ margin:0 }}>{meta.title}</h3>
      <div className="muted" style={{ fontSize:13 }}>{meta.short}</div>
      <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div className="muted">{meta.qcount} questions</div>
        <button className="small-cta" onClick={() => onStart(meta.id)}>Start</button>
      </div>
    </div>
  );
}

function Runner({ testId, onClose }) {
  // for speed: fetch questions from backend or use static sample generation
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    // try fetching /api/tests/:id/questions (if you implement). fallback to generated sample.
    // We'll generate qcount=5 sample with simple multiple choice
    const sampleQuestions = Array.from({length:5}).map((_,i)=>({
      id: `${testId}-q${i+1}`,
      text: `Sample question ${i+1} for ${testId}`,
      options: ["Option A","Option B","Option C","Option D"],
      answer: 0
    }));
    if (mounted) { setQuestions(sampleQuestions); setLoading(false); }
    return () => mounted = false;
  }, [testId]);

  function pick(qid, idx){
    setAnswers(a => ({...a, [qid]: idx}));
  }
  function submit(){
    // score locally
    let score = 0;
    questions.forEach(q => { if (answers[q.id] === q.answer) score++ });
    const payload = {
      testId,
      score,
      total: questions.length,
      answers,
      takenAt: new Date().toISOString()
    };
    localStorage.setItem("ciq_latest_tests", JSON.stringify(payload));
    fetch("/api/tests", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(saved => {
      alert(`Saved — score ${score}/${questions.length}`);
      onClose();
    }).catch(e => { console.error(e); alert("Save failed"); });
  }

  if (loading) return <div>Loading test…</div>
  return (
    <div style={{ marginTop:12 }}>
      <button className="small-cta" onClick={onClose}>← Back</button>
      <h2 style={{ marginTop:12 }}>Test — {testId}</h2>
      {questions.map((q,i)=>(
        <div key={q.id} style={{ marginTop:12, padding:12, borderRadius:8, background:"#fff" }}>
          <div style={{ fontWeight:700 }}>{i+1}. {q.text}</div>
          <div style={{ marginTop:8, display:"flex", gap:8, flexDirection:"column" }}>
            {q.options.map((opt,idx)=>(
              <label key={idx}><input type="radio" name={q.id} checked={answers[q.id]===idx} onChange={() => pick(q.id, idx)} /> {opt}</label>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop:12 }}>
        <button className="ciq-primary" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}

export default function SkillTests(){
  const [meta, setMeta] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch("/api/tests/meta")
      .then(r => r.json())
      .then(setMeta)
      .catch(() => {
        // fallback/sample meta
        setMeta([
          { id: "coding-basics", title: "Coding Basics", qcount:5, short: "Programming fundamentals" },
          { id: "communication", title: "Communication", qcount:5, short:"Interpersonal skills" },
        ]);
      });
  }, []);

  return (
    <div className="ciq-container" style={{ paddingTop: 48 }}>
      <BackButton />  
      <h1>Skill Tests</h1>
      
      {!active ? (
        <>
          <div className="muted">Pick a skill test tile to start. Each test gives you a score and short feedback.</div>
          <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
            {meta.map(m => <TestTile key={m.id} meta={m} onStart={(id)=>setActive(id)} />)}
          </div>
        </>
      ) : (
        <Runner testId={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

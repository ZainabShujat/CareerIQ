import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const QUESTIONS = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  text: `Question ${i + 1}: How much do you enjoy task type ${i + 1}? (1 = not at all, 5 = love it)`
}));

export default function Quiz() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(24).fill(3));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  function setAnswer(idx, val) {
    const next = [...answers];
    next[idx] = Number(val);
    setAnswers(next);
  }

  function submit() {
    // Simple grouping for demo: split questions into 4 buckets
    const buckets = { programming: 0, data: 0, design: 0, teaching: 0 };
    answers.forEach((a, i) => {
      const key = i % 4 === 0 ? "programming" : i % 4 === 1 ? "data" : i % 4 === 2 ? "design" : "teaching";
      buckets[key] += a;
    });
    const scores = {};
    Object.keys(buckets).forEach(k => {
      scores[k] = Math.round((buckets[k] / (5 * 6)) * 100); // percent
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topSkill = sorted[0][0];
    const testsObj = { scores, topSkill, topScore: scores[topSkill], createdAt: new Date().toISOString() };

    // persist locally for Results/Insights to pick up
    localStorage.setItem("ciq_latest_tests", JSON.stringify(testsObj));
    setResult(testsObj);
    setSubmitted(true);

    // navigate to results where Results.jsx will read the latest tests and show matches
    navigate("/results");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personality / Skill Quiz</h1>

      {!submitted && (
        <>
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="mb-4">
              <div className="mb-2">{q.text}</div>
              <input type="range" min="1" max="5" value={answers[i]} onChange={(e) => setAnswer(i, e.target.value)} />
            </div>
          ))}

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 rounded bg-teal-600 text-white" onClick={submit}>Submit Quiz</button>
            <button className="px-4 py-2 rounded border" onClick={() => { setAnswers(Array(24).fill(3)); }}>Reset</button>
          </div>
        </>
      )}

      {submitted && result && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Your result</h3>
          <div>Top skill bucket: <b>{result.topSkill}</b> ({result.topScore}%)</div>
          <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

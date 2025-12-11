// src/pages/Quiz.jsx
import React, { useState } from "react";

const QUESTIONS = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  text: `Question ${i + 1}: How much do you enjoy task ${i + 1}? (1-5)`
}));

export default function Quiz() {
  const [answers, setAnswers] = useState(Array(24).fill(3));
  const [submitted, setSubmitted] = useState(false);
  const [tests, setTests] = useState(null);

  function setAnswer(idx, val) {
    const next = [...answers];
    next[idx] = Number(val);
    setAnswers(next);
  }

  function submit() {
    // simple scoring: group answers into 4 buckets representing skills
    const buckets = {
      programming: 0,
      data: 0,
      design: 0,
      teaching: 0
    };
    answers.forEach((a, i) => {
      const key = i % 4 === 0 ? "programming" : i % 4 === 1 ? "data" : i % 4 === 2 ? "design" : "teaching";
      buckets[key] += a;
    });
    // convert to 0-100
    const scores = {};
    Object.keys(buckets).forEach(k => {
      scores[k] = Math.round((buckets[k] / (5 * 6)) * 100);
    });

    // pick topSkill
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topSkill = sorted[0][0];

    const testsObj = { scores, topSkill, topScore: scores[topSkill] };
    setTests(testsObj);
    setSubmitted(true);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Personality / Skill Quiz</h2>

      {!submitted && (
        <>
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="mb-2">
              <div>{q.text}</div>
              <input type="range" min="1" max="5" value={answers[i]} onChange={(e) => setAnswer(i, e.target.value)} />
            </div>
          ))}
          <button onClick={submit} className="btn mt-3">Submit</button>
        </>
      )}

      {submitted && tests && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h3>Results</h3>
          <div>Top skill: <b>{tests.topSkill}</b> ({tests.topScore}%)</div>
          <pre className="mt-2">{JSON.stringify(tests, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

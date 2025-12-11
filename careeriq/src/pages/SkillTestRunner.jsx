// SkillTestRunner.jsx (FINAL FIXED VERSION)
import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import testsBank from "../data/questions.json";


export default function SkillTestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const testsArray = (testsBank && testsBank.tests) || [];

  const test = useMemo(
    () => testsArray.find((t) => String(t.id) === String(testId)),
    [testsArray, testId]
  );

  if (!test) {
    return (
      <div style={{ padding: 28 }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Test not found</h2>
      </div>
    );
  }

  if (!user) {
    navigate("/skill-tests");
    return null;
  }

  const [answers, setAnswers] = useState({});

  const questionRefs = useMemo(
    () => test.questions.map(() => React.createRef()),
    [test]
  );

  const getQuestionText = (q) =>
    q.text || q.question || q.prompt || "Untitled question";

  const getOptions = (q) => q.options || q.choices || [];

  const handleSingle = (qid, idx, questionIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));

    const nextIndex = questionIndex + 1;

    if (questionRefs[nextIndex]) {
      setTimeout(() => {
        questionRefs[nextIndex].current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // 1️⃣ Compute score
  let score = 0;
  test.questions.forEach((q, i) => {
    const answer = answers[q.id];
    if (answer !== undefined && q.correct !== undefined) {
      if (answer === q.correct) score += 1;
    }
  });

  const token = localStorage.getItem("ciq_token");

  try {
    const res = await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        testId: test.id,
        score,
        details: answers
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save results");

    // Redirect to insights now
    navigate("/insights");

  } catch (err) {
    alert("Failed to save: " + err.message);
  }
};


  return (
    <div style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        ← Back
      </button>

      <h1>{test.title}</h1>
      <p style={{ color: "#556b62" }}>
        {test.description || "Short domain test"}
      </p>

      <form onSubmit={handleSubmit}>
        {test.questions.map((q, i) => {
          const qText = getQuestionText(q);
          const opts = getOptions(q);

          const qType = q.type || "mcq"; // 🌟 DEFAULT TYPE FIX HERE

          return (
            <div
              key={q.id || i}
              ref={questionRefs[i]}
              style={{
                marginTop: 20,
                padding: "12px 0",
                borderBottom: "1px solid #eef6f1",
              }}
            >
              <div style={{ marginBottom: 8, fontWeight: 600 }}>
                {i + 1}. {qText}
              </div>

              {/* MCQ */}
              {qType === "mcq" && opts.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {opts.map((opt, oi) => (
                    <label
                      key={oi}
                      style={{ display: "block", marginBottom: 6 }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        onChange={() => handleSingle(q.id, oi, i)}
                        style={{ marginRight: 6 }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 22 }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              background: "#0a6b55",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

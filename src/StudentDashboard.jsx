import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./Dashboard.css";

export default function StudentDashboard({ user, onLogout }) {
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/get-exams").then(res => res.json()).then(setExams);
    fetch("http://localhost:5001/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username })
    }).then(res => res.json()).then(data => setHistory(data.history));
  }, []);

  const submitExam = async () => {
    const res = await fetch("http://localhost:5001/attempt-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: activeExam.id, username: user.username, answers })
    });
    if ((await res.json()).ok) {
      setActiveExam(null);
      window.location.reload();
    }
  };

  if (activeExam) {
    return (
      <div className="DashScene">
        <div className="DashCard" style={{ overflowY: "auto" }}>
          <h1>{activeExam.title}</h1>
          {activeExam.questions.map((q) => (
            <div key={q.id} className="DashSection" style={{ minHeight: "300px" }}>
              <p><strong>{q.text}</strong></p>
              {q.type === "code" ? (
                <Editor
                  height="250px"
                  theme="vs-dark"
                  defaultLanguage={q.lang || "javascript"}
                  defaultValue={q.template}
                  onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {q.options.map((opt, i) => (
                    <label key={i}><input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: opt })} /> {opt}</label>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button className="DashBtn" onClick={submitExam}>Finalize Submission</button>
        </div>
      </div>
    );
  }

  return (
    <div className="DashScene">
      <div className="DashCard" style={{ overflowY: "auto" }}>
        <div className="DashHeader">
          <h1>Student Dashboard</h1>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>

        <div className="StudentStack">
          <div className="DashSection">
            <h3>Available Exams</h3>
            {exams.map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span>{e.title}</span>
                <button className="DashBtn" onClick={() => setActiveExam(e)}>Start Exam</button>
              </div>
            ))}
          </div>

          <div className="DashSection">
            <h3>Exam History</h3>
            {history.map((h, i) => <div key={i}>ID: {h.examId} — {new Date(h.submittedAt).toLocaleString()}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
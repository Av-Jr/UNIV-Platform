import { useState } from "react";

export default function ExamCreator({ user, onBack }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("");

  const addMCQ = () => {
    setQuestions([...questions, { id: Date.now(), type: "mcq", text: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const addCodeQuestion = () => {
    setQuestions([...questions, { id: Date.now(), type: "code", text: "", template: "// Write your code here", lang: "javascript" }]);
  };

  const saveExam = async () => {
    if (!title || questions.length === 0) return setStatus("Add title and questions");
    try {
      const res = await fetch("http://localhost:5001/save-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher: user.username, title, questions })
      });
      if ((await res.json()).ok) onBack();
    } catch { setStatus("Server Error"); }
  };

  return (
    <div className="DashCard" style={{ overflowY: "auto" }}>
      <h2>Exam Creator</h2>
      <input placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", marginBottom: "20px" }} />

      {questions.map((q, i) => (
        <div key={q.id} className="DashSection" style={{ marginBottom: "15px" }}>
          <h4>Q{i + 1}: {q.type.toUpperCase()}</h4>
          <input placeholder="Question text" value={q.text} onChange={(e) => {
            const copy = [...questions];
            copy[i].text = e.target.value;
            setQuestions(copy);
          }} style={{ width: "100%" }} />

          {q.type === "mcq" && q.options.map((opt, optIdx) => (
            <input key={optIdx} placeholder={`Option ${optIdx + 1}`} value={opt} onChange={(e) => {
              const copy = [...questions];
              copy[i].options[optIdx] = e.target.value;
              setQuestions(copy);
            }} />
          ))}

          {q.type === "code" && (
            <textarea placeholder="Initial Code Template" value={q.template} onChange={(e) => {
              const copy = [...questions];
              copy[i].template = e.target.value;
              setQuestions(copy);
            }} style={{ width: "100%", height: "80px", marginTop: "10px", background: "#333", color: "white" }} />
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button className="DashBtn" onClick={addMCQ}>+ MCQ</button>
        <button className="DashBtn" onClick={addCodeQuestion}>+ Code</button>
        <button className="DashBtn" onClick={saveExam}>Save Exam</button>
        <button className="DashBtn" onClick={onBack}>Cancel</button>
      </div>
      {status && <p>{status}</p>}
    </div>
  );
}
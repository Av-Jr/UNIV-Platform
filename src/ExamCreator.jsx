import { useState } from "react";

export default function ExamCreator({ user, groupId, onBack }) {
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState([]);

  const addMCQ = () => setQuestions([...questions, { id: Date.now(), type: "mcq", text: "", options: ["", ""], correct: 0 }]);
  const addCode = () => setQuestions([...questions, { id: Date.now(), type: "code", text: "", template: "// Write code here" }]);

  const addOption = (idx) => {
    const n = [...questions];
    if (n[idx].options.length < 10) n[idx].options.push("");
    setQuestions(n);
  };

  const saveExam = async () => {
    if (!title || !dueDate) return alert("Fill all details");
    await fetch("http://localhost:5001/save-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher: user.username, groupId, title, timeLimit, dueDate, questions })
    });
    onBack();
  };

  return (
    <div className="DashCard" style={{ overflowY: 'auto' }}>
      <h2>Exam Creator</h2>
      <div className="DashSection">
        <input placeholder="Exam Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      {questions.map((q, i) => (
        <div key={q.id} className="DashSection">
          <input
            placeholder="Question"
            value={q.text}
            onChange={e => {
              const n = [...questions];
              n[i].text = e.target.value;
              setQuestions(n);
            }}
          />
          {q.type === 'mcq' && q.options.map((opt, oIdx) => (
            <input
              key={oIdx}
              value={opt}
              onChange={e => {
                const n = [...questions];
                n[i].options[oIdx] = e.target.value;
                setQuestions(n);
              }}
              placeholder={`Option ${oIdx + 1}`}
            />
          ))}

          {/* New: Selection for the correct answer index */}
          {q.type === 'mcq' && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.9em' }}>Correct Answer:</label>
              <select
                value={q.correct}
                onChange={e => {
                  const n = [...questions];
                  n[i].correct = parseInt(e.target.value);
                  setQuestions(n);
                }}
                style={{ padding: '5px', borderRadius: '4px' }}
              >
                {q.options.map((_, oIdx) => (
                  <option key={oIdx} value={oIdx}>Option {oIdx + 1}</option>
                ))}
              </select>
            </div>
          )}

          {q.type === 'mcq' && (
            <button className="DashBtn" style={{ marginTop: '10px' }} onClick={() => addOption(i)}>
              + Add Option
            </button>
          )}

          {q.type === 'code' && (
            <textarea
              style={{ width: '100%', marginTop: '10px', fontFamily: 'monospace' }}
              rows={4}
              value={q.template}
              onChange={e => {
                const n = [...questions];
                n[i].template = e.target.value;
                setQuestions(n);
              }}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="DashBtn" onClick={addMCQ}>+ MCQ</button>
        <button className="DashBtn" onClick={addCode}>+ Code</button>
        <button className="DashBtn" style={{ background: '#2ecc71' }} onClick={saveExam}>Save Exam</button>
        <button className="DashBtn" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
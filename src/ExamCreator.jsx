import { useState } from "react";

export default function ExamCreator({ user, onBack }) {
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState([]);

  const addMCQ = () => {
    setQuestions([...questions, {
      id: "q-" + Date.now(),
      type: "mcq",
      text: "",
      options: ["", ""],
      correct: 0
    }]);
  };

  const addCodeQuest = () => {
    setQuestions([...questions, {
      id: "q-" + Date.now(),
      type: "code",
      text: "",
      template: "// Write your code here",
      lang: "javascript"
    }]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIdx] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const saveExam = async () => {
    const examData = { teacher: user.username, title, timeLimit, dueDate, questions };

    // Ensure this matches the route in your server.js
    const res = await fetch("http://localhost:5001/save-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examData)
    });
    const data = await res.json();
    if (data.ok) onBack();
  };

  return (
    <div className="DashCard" style={{ overflowY: "auto" }}>
      <h2>Exam Creator</h2>
      <div className="SettingsRow" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="number" placeholder="Time (mins)" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
        <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="DashSection">
          <h4>Q{i+1}: {q.type.toUpperCase()}</h4>
          <input
            placeholder="Question text"
            value={q.text}
            onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
          />

          {q.type === "mcq" && q.options.map((opt, optIdx) => (
            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="radio"
                name={`correct-${q.id}`}
                checked={q.correct === optIdx}
                onChange={() => updateQuestion(q.id, "correct", optIdx)}
              />
              <input
                placeholder={`Option ${optIdx+1}`}
                value={opt}
                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
              />
            </div>
          ))}

          {q.type === "code" && (
            <textarea
              placeholder="Code Template"
              value={q.template}
              onChange={(e) => updateQuestion(q.id, "template", e.target.value)}
              style={{ width: '100%', height: '80px', marginTop: '10px' }}
            />
          )}

          <div style={{ marginTop: '10px' }}>
            {q.type === "mcq" && (
              <button onClick={() => {
                const newOpts = [...q.options, ""];
                updateQuestion(q.id, "options", newOpts);
              }}>+ Add Option</button>
            )}
            <button
              onClick={() => setQuestions(questions.filter(quest => quest.id !== q.id))}
              style={{ color: 'red', marginLeft: '10px' }}
            >Delete Question</button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="DashBtn" onClick={addMCQ}>+ MCQ</button>
        <button className="DashBtn" onClick={addCodeQuest}>+ Coding</button>
        <button className="DashBtn" onClick={saveExam} style={{ background: '#2ecc71' }}>Save Exam</button>
        <button className="DashBtn" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
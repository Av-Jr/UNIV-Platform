import { useState, useEffect } from "react";

export default function StudentDashboard({ user, onLogout }) {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch all exams and the user's attempt history
    Promise.all([
      fetch("http://localhost:5001/get-exams").then(r => r.json()),
      fetch("http://localhost:5001/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username })
      }).then(r => r.json())
    ]).then(([examData, historyData]) => {
      setExams(examData);
      setHistory(historyData.history || []);
    });
  }, [user.username]);

  const getStatus = (examId) => {
    const attempted = history.find(h => h.examId === examId.toString() || h.examId === examId);
    return attempted ? "✅ Attempted" : "❌ Not Attempted";
  };

  return (
    <div className="DashScene">
      <div className="DashCard">
        <h1>Available Exams</h1>
        {exams.map(e => (
          <div key={e.id} className="DashSection" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{e.title}</strong>
              <p style={{ fontSize: '12px', margin: 0 }}>
                Due: {new Date(e.dueDate).toLocaleString()} | Time: {e.timeLimit}m
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>{getStatus(e.id)}</span>
              {!history.find(h => h.examId === e.id.toString()) && (
                <button className="DashBtn" onClick={() => startExam(e)}>Start</button>
              )}
            </div>
          </div>
        ))}
        <button className="DashBtn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
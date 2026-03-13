import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import GroupChat from "./GroupChat.jsx";
import "./Dashboard.css";

export default function StudentDashboard({ user, onLogout }) {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [answers, setAnswers] = useState({});
  const [groupCode, setGroupCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const loadData = async () => {
    try {
      const [eRes, hRes, gRes] = await Promise.all([
        fetch("http://localhost:5001/get-exams").then(r => r.json()),
        fetch("http://localhost:5001/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username })
        }).then(r => r.json()),
        fetch(`http://localhost:5001/my-groups/${user.username}/student`).then(r => r.json())
      ]);

      if (eRes.ok) setExams(eRes.exams || []);
      if (hRes.ok) setHistory(hRes.history || []);
      if (gRes.ok) setJoinedGroups(gRes.groups || []);
    } catch (err) {
      console.error("Load error", err);
    }
  };

  useEffect(() => { loadData(); }, [user.username]);

  useEffect(() => {
    if (activeExam && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeExam) {
      alert("Time is up!");
      submitExam();
    }
    return () => clearInterval(timerRef.current);
  }, [activeExam, timeLeft]);

  const startExam = (exam) => {
    setActiveExam(exam);
    setAnswers({});
    setTimeLeft((exam.timeLimit || 60) * 60);
  };

  const submitExam = async () => {
    clearInterval(timerRef.current);
    const res = await fetch("http://localhost:5001/attempt-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId: activeExam.id,
        username: user.username,
        answers
      })
    });
    if ((await res.json()).ok) {
      setActiveExam(null);
      loadData();
    }
  };

  if (activeChat) return <GroupChat groupId={activeChat} user={user} onBack={() => setActiveChat(null)} />;

  if (activeExam) {
    return (
      <div className="DashScene">
        <div className="DashCard" style={{ overflowY: "auto" }}>
          <div className="TimerBox" style={{ position: 'sticky', top: 0, background: '#333', padding: '10px', zIndex: 10 }}>
            <h2>{activeExam.title}</h2>
            <h3>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h3>
          </div>
          {activeExam.questions.map((q, i) => (
            <div key={q.id} className="DashSection">
              <p>Q{i + 1}: {q.text}</p>
              {q.type === "code" ? (
                <div style={{ border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' }}>
                  <Editor
                    height="250px"
                    theme="vs-dark"
                    defaultLanguage="javascript"
                    defaultValue={q.template}
                    onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                  />
                </div>
              ) : (
                q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={{ display: 'block', margin: '5px 0' }}>
                    <input
                      type="radio"
                      name={q.id}
                      onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                    /> {opt}
                  </label>
                ))
              )}
            </div>
          ))}
          <button className="DashBtn" onClick={submitExam}>Submit Exam</button>
        </div>
      </div>
    );
  }

  return (
    <div className="DashCard">
      <div className="DashHeader">
        <h1>Student: {user.realName}</h1>
        <button className="DashBtn logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="DashGrid">
        <div className="DashSection">
          <h3>Joined Classes</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input value={groupCode} onChange={e => setGroupCode(e.target.value)} placeholder="Enter Group Code" />
            <button className="DashBtn" onClick={async () => {
              const res = await fetch("http://localhost:5001/join-group", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username, groupCode })
              });
              if ((await res.json()).ok) { setGroupCode(""); loadData(); }
            }}>Join</button>
          </div>
          <div className="List">
            {joinedGroups.map(g => (
              <div key={g.id} className="Item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{g.name}</span>
                <button className="DashBtn" onClick={() => setActiveChat(g.id)}>Chat</button>
              </div>
            ))}
          </div>
        </div>

        {/* MODIFIED: Exams Section showing marks */}
        <div className="DashSection">
          <h3>Available Exams</h3>
          <div className="List">
            {exams.filter(e => joinedGroups.some(g => g.id === e.groupId)).map(e => {
              const attemptRecord = history.find(h => String(h.examId) === String(e.id));
              const isAttempted = !!attemptRecord;

              return (
                <div key={e.id} className="Item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{e.title}</strong>
                    <p style={{ margin: 0, fontSize: '0.8em' }}>Due: {new Date(e.dueDate).toLocaleString()}</p>
                  </div>
                  {isAttempted ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#2ecc71', fontWeight: 'bold', display: 'block' }}>✅ Completed</span>
                      <span style={{ fontSize: '0.9em', color: '#888' }}>
                        Marks: {attemptRecord.score} / {attemptRecord.total}
                      </span>
                    </div>
                  ) : (
                    <button className="DashBtn" onClick={() => startExam(e)}>Start</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
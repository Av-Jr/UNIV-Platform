import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import GroupChat from "./GroupChat.jsx"; // Ensure this component is created in your src folder
import "./Dashboard.css";

export default function StudentDashboard({ user, onLogout }) {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // Tracks which group chat is open
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [groupCode, setGroupCode] = useState("");

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

  useEffect(() => {
    loadData();
  }, [user.username]);

  const handleJoinGroup = async () => {
    if (!groupCode) return;
    try {
      const res = await fetch("http://localhost:5001/join-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, groupCode })
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Successfully joined: ${data.groupName}`);
        setGroupCode("");
        loadData();
      } else {
        alert(data.message || "Invalid Code");
      }
    } catch (err) {
      alert("Error joining group");
    }
  };

  // Timer Countdown Logic
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
    setTimeLeft((exam.timeLimit || 60) * 60);
  };

  const submitExam = async () => {
    clearInterval(timerRef.current);
    const res = await fetch("http://localhost:5001/attempt-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: activeExam.id, username: user.username, answers })
    });
    if ((await res.json()).ok) {
      setActiveExam(null);
      loadData();
    }
  };

  // 1. Render Group Chat View if a chat is active
  if (activeChat) {
    return (
      <div className="DashScene">
        <GroupChat
          groupId={activeChat}
          user={user}
          onBack={() => setActiveChat(null)}
        />
      </div>
    );
  }

  // 2. Render Active Exam View if an exam is started
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
                <Editor height="200px" theme="vs-dark" defaultLanguage="javascript" defaultValue={q.template} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
              ) : (
                q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={{ display: 'block' }}><input type="radio" name={q.id} onChange={() => setAnswers({ ...answers, [q.id]: optIdx })} /> {opt}</label>
                ))
              )}
            </div>
          ))}
          <button className="DashBtn" onClick={submitExam}>Submit Exam</button>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard View
  return (
    <div className="DashScene">
      <div className="DashCard">
        <div className="DashHeader">
          <h1>Student Dashboard</h1>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>

        <div className="DashGrid">
          {/* Join Group Section */}
          <div className="DashSection">
            <h3>Join a Group</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="Enter Group Code"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
              />
              <button className="DashBtn" onClick={handleJoinGroup}>Join</button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>My Classes</h4>
              <div className="List">
                {joinedGroups.length > 0 ? joinedGroups.map(g => (
                  <div key={g.id} className="Item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{g.name}</strong> <span style={{fontSize: '0.8em', color: '#888'}}>(ID: {g.code})</span>
                    </div>
                    {/* Trigger for the new Group Chat feature */}
                    <button
                      className="DashBtn"
                      style={{ padding: '5px 10px', fontSize: '0.8em' }}
                      onClick={() => setActiveChat(g.id)}
                    >
                      Chat / Members
                    </button>
                  </div>
                )) : <p style={{fontSize: '0.8em'}}>You haven't joined any classes yet.</p>}
              </div>
            </div>
          </div>

          {/* Exams Section */}
          <div className="DashSection">
            <h3>Available Exams</h3>
            <div className="List">
              {exams.length > 0 ? exams.map(e => {
                const isDone = history.some(h => String(h.examId) === String(e.id));
                return (
                  <div key={e.id} className="Item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{e.title}</strong>
                      <p style={{ margin: 0, fontSize: '0.8em' }}>Limit: {e.timeLimit}m</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9em' }}>{isDone ? "✅ Done" : "⏳ Pending"}</span>
                      {!isDone && <button className="DashBtn" onClick={() => startExam(e)}>Start</button>}
                    </div>
                  </div>
                );
              }) : <p>No exams available.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
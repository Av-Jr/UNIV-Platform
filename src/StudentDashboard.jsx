import { useState, useEffect } from "react";
import "./Dashboard.css";

export default function StudentDashboard({ user, onLogout }) {

  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  const joinClass = async () => {
    if (!joinCode) {
      setStatus("Enter class code");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/join-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          code: joinCode
        })
      });

      const data = await res.json();
      setStatus(data.ok ? "Joined successfully" : "Invalid code");
    } catch {
      setStatus("Server error");
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:5001/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username
        })
      });

      const data = await res.json();
      if (data.ok) {
        setHistory(data.history);
      }
    } catch {
      console.log("History load failed");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="DashScene">
      <div className="DashCard">

        <div className="DashHeader">
          <div>
            <h1>Student Dashboard</h1>
            <p>Welcome {user.realName}</p>
          </div>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>

        <div className="StudentStack">

          {/* Join Class */}
          <div className="DashSection">
            <h3>Join Class</h3>

            <input
              placeholder="Enter Class Code"
              value={joinCode}
              onChange={(e)=>setJoinCode(e.target.value)}
            />

            <button className="DashBtn" onClick={joinClass}>
              Join
            </button>
          </div>

          {/* Exam History */}
          <div className="DashSection">
            <h3>Exam History</h3>

            {history.length === 0 && <p>No attempts yet</p>}

            {history.map((h, i) => (
              <div key={i}>
                Exam: {h.examId} — {new Date(h.submittedAt).toLocaleString()}
              </div>
            ))}
          </div>

        </div>

        {status && <p>{status}</p>}

      </div>
    </div>
  );
}
import { useState } from "react";
import "./Dashboard.css";

export default function TeacherDashboard({ user, onLogout }) {

  const [groupEmail, setGroupEmail] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [status, setStatus] = useState("");

  const createGroup = async () => {
    if (!groupCode) {
      setStatus("Enter group code");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: user.username,
          email: groupEmail,
          code: groupCode
        })
      });

      const data = await res.json();
      setStatus(data.ok ? "Group created" : "Failed");
    } catch (err) {
      setStatus("Server error");
    }
  };

  const createExam = async () => {
    setStatus("Creating exam...");

    try {
      const res = await fetch("http://localhost:5001/create-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: user.username,
          questions: []
        })
      });

      const data = await res.json();
      setStatus(data.ok ? "Exam created" : "Error creating exam");
    } catch {
      setStatus("Server error");
    }
  };

  return (
    <div className="DashScene">
      <div className="DashCard">

        <div className="DashHeader">
          <div>
            <h1>Teacher Dashboard</h1>
            <p>Welcome {user.realName}</p>
          </div>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>

        <div className="DashGrid">

          {/* Create Group */}
          <div className="DashSection">
            <h3>Create Student Group</h3>

            <input
              placeholder="Student Email (optional)"
              value={groupEmail}
              onChange={(e)=>setGroupEmail(e.target.value)}
            />

            <input
              placeholder="Group Code"
              value={groupCode}
              onChange={(e)=>setGroupCode(e.target.value)}
            />

            <button className="DashBtn" onClick={createGroup}>
              Create Group
            </button>
          </div>

          {/* Create Exam */}
          <div className="DashSection">
            <h3>Create Exam</h3>
            <p>MCQ • Short Answer • Coding</p>

            <button className="DashBtn" onClick={createExam}>
              Create Empty Exam
            </button>
          </div>

        </div>

        {status && <p>{status}</p>}

      </div>
    </div>
  );
}
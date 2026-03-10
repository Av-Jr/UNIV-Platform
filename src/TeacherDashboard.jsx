import { useState } from "react";
import ExamCreator from "./ExamCreator.jsx";
import "./Dashboard.css";

export default function TeacherDashboard({ user, onLogout }) {
  const [isCreating, setIsCreating] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [status, setStatus] = useState("");

  const createGroup = async () => {
    const res = await fetch("http://localhost:5001/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher: user.username, code: groupCode })
    });
    if ((await res.json()).ok) setStatus("Group Created!");
  };

  if (isCreating) return <div className="DashScene"><ExamCreator user={user} onBack={() => setIsCreating(false)} /></div>;

  return (
    <div className="DashScene">
      <div className="DashCard">
        <div className="DashHeader">
          <h1>Teacher Dashboard</h1>
          <button className="DashBtn" onClick={onLogout}>Logout</button>
        </div>
        <div className="DashGrid">
          <div className="DashSection">
            <h3>Groups</h3>
            <input placeholder="Group Code" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} />
            <button className="DashBtn" onClick={createGroup}>Create Group</button>
          </div>
          <div className="DashSection">
            <h3>Exams</h3>
            <button className="DashBtn" onClick={() => setIsCreating(true)}>Launch Exam Creator</button>
          </div>
        </div>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}
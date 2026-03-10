import { useState } from "react";
import "./Dashboard.css";
import ExamCreator from "./ExamCreator.jsx";

export default function TeacherDashboard({ user, onLogout }) {
  const [groupEmail, setGroupEmail] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  // Helper for status messages
  const showStatus = (msg, type = "info") => {
    setStatus({ message: msg, type });
    setTimeout(() => setStatus({ message: "", type: "" }), 3000);
  };

  const createGroup = async () => {
    if (!groupCode) {
      showStatus("Please enter a group code", "error");
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
      if (data.ok) {
        showStatus("Group created successfully!", "success");
        setGroupEmail("");
        setGroupCode("");
      } else {
        showStatus("Failed to create group", "error");
      }
    } catch (err) {
      showStatus("Server error connecting to backend", "error");
    }
  };

  // Switch to Exam Creator View
  if (isCreatingExam) {
    return (
      <div className="DashScene">
        <ExamCreator
          user={user}
          onBack={() => setIsCreatingExam(false)}
          onSuccess={() => {
            setIsCreatingExam(false);
            showStatus("Exam saved to Exams.json!", "success");
          }}
        />
      </div>
    );
  }

  return (
    <div className="DashScene">
      <div className="DashCard">
        <div className="DashHeader">
          <div>
            <h1>Teacher Dashboard</h1>
            <p className="welcome-text">Logged in as: <strong>{user.realName}</strong></p>
          </div>
          <button className="DashBtn logout-btn" onClick={onLogout}>Logout</button>
        </div>

        <div className="DashGrid">
          {/* Group Management Section */}
          <div className="DashSection">
            <div className="section-icon">👥</div>
            <h3>Student Groups</h3>
            <p>Create a code for students to join your class.</p>

            <div className="input-group">
              <input
                placeholder="Student Email (optional)"
                value={groupEmail}
                onChange={(e) => setGroupEmail(e.target.value)}
              />
              <input
                placeholder="Group Access Code"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
              />
            </div>

            <button className="DashBtn primary" onClick={createGroup}>
              Generate Group
            </button>
          </div>

          {/* Exam Management Section */}
          <div className="DashSection">
            <div className="section-icon">📝</div>
            <h3>Assessment Center</h3>
            <p>Design MCQs and Coding challenges with Monaco Editor.</p>

            <div className="features-list">
              <span>• Custom MCQ Options</span>
              <span>• Monaco Code Editor</span>
              <span>• Stored in Exams.json</span>
            </div>

            <button className="DashBtn secondary" onClick={() => setIsCreatingExam(true)}>
              Open Exam Creator
            </button>
          </div>
        </div>

        {status.message && (
          <div className={`status-bar ${status.type}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
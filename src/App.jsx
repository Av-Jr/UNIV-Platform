import { useState, useEffect } from "react";
import LogSign from "./LogSign.jsx";
// Import both specific dashboards
import StudentDashboard from "./StudentDashboard.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";
import "./App.css"

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem("authUser");
    if (cached) {
      setUser(JSON.parse(cached));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <>
      {user ? (
        // Check the role stored in the user state
        user.role === "teacher" ? (
          <TeacherDashboard user={user} onLogout={handleLogout} />
        ) : (
          <StudentDashboard user={user} onLogout={handleLogout} />
        )
      ) : (
        <LogSign onAuthSuccess={handleLogin} />
      )}
    </>
  );
}

export default App;
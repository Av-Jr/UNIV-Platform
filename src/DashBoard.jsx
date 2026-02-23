import TeacherDashboard from "./TeacherDashboard.jsx";
import StudentDashboard from "./StudentDashboard.jsx";

export default function Dashboard({ user, onLogout }) {

  if (user.role === "teacher") {
    return <TeacherDashboard user={user} onLogout={onLogout} />;
  }

  if (user.role === "student") {
    return <StudentDashboard user={user} onLogout={onLogout} />;
  }

  return <div>Unknown role</div>;
}
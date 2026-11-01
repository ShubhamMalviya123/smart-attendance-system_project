import React from "react";
import { useNavigate } from "react-router-dom";

// Home page: choose Admin or Teacher login
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="login-shell">
      <div className="login-blob b1" />
      <div className="login-blob b2" />

      <div className="home-inner">
        <div className="ai-badge" style={{ marginBottom: 16 }}>
          <span>✦</span> AI ATTENDANCE SYSTEM
        </div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>Smart AI Classroom Attendance</h1>
        <p className="text-muted" style={{ fontSize: "1rem", marginBottom: 36 }}>
          Mark attendance automatically from a photo or video using face recognition
        </p>

        <div className="role-grid">
          <button className="role-card" onClick={() => navigate("/login/admin")}>
            <div className="role-icon">🛡️</div>
            <h3>Admin Login</h3>
            <p>Manage teachers and subjects</p>
          </button>

          <button className="role-card" onClick={() => navigate("/login/teacher")}>
            <div className="role-icon">👩‍🏫</div>
            <h3>Teacher Login</h3>
            <p>Add students and take attendance</p>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateClass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subjectId: "", semester: "", section: "", classDate: "", classTime: "",
  });
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get("/admin/subjects").then((res) => setSubjects(res.data)).catch(() => {});
    api.get("/teacher/students").then((res) => setStudents(res.data)).catch(() => {});
  }, []);

  // Semester / Section options come from the students already added, so they always match.
  const semesters = [...new Set(students.map((s) => s.semester))];
  const sections = [...new Set(students.filter((s) => s.semester === form.semester).map((s) => s.section))];
  const matchedCount = students.filter((s) => s.semester === form.semester && s.section === form.section).length;
  const readyToSubmit = form.semester && form.section && matchedCount > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/teacher/class", form);
      navigate(`/teacher/class/${res.data.id}/attendance`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create class");
    }
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand"><span className="mark">A</span> Attendance Register</div>
      </div>
      <div className="page-narrow">
        <h2 style={{ marginBottom: 20 }}>Create class</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Subject</label>
              <select className="input" required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">-- Select a subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.subjectName} ({s.semester})</option>
                ))}
              </select>
              {subjects.length === 0 && (
                <div className="text-muted" style={{ marginTop: 4 }}>No subjects yet. Ask the Admin to add a subject first.</div>
              )}
            </div>
            <div className="field"><label>Semester</label>
              <select className="input" required value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value, section: "" })}>
                <option value="">-- Select semester --</option>
                {semesters.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              {students.length === 0 && (
                <div className="text-muted" style={{ marginTop: 4 }}>No students yet. Add students first (Students page).</div>
              )}
            </div>
            <div className="field"><label>Section</label>
              <select className="input" required value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })} disabled={!form.semester}>
                <option value="">-- Select section --</option>
                {sections.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              {form.semester && form.section && (
                <div className="text-muted" style={{ marginTop: 4 }}>{matchedCount} student(s) in {form.semester} / {form.section} will be marked.</div>
              )}
            </div>
            <div className="field"><label>Date</label>
              <input className="input" type="date" required
                value={form.classDate} onChange={(e) => setForm({ ...form, classDate: e.target.value })} />
            </div>
            <div className="field"><label>Time</label>
              <input className="input" type="time" required
                value={form.classTime} onChange={(e) => setForm({ ...form, classTime: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={!readyToSubmit}>
              Create &amp; take attendance
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

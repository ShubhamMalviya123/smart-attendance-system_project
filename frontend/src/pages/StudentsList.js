import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function StudentsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ---- Add-student form (available to both teacher and admin) ----
  const emptyForm = { rollNo: "", name: "", email: "", branch: "", semester: "", section: "" };
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [adding, setAdding] = useState(false);

  const basePath = user?.role === "ADMIN" ? "/admin" : "/teacher";

  const load = () => {
    api.get(`${basePath}/students`)
      .then((res) => setStudents(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load students"));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (photos.length < 1 || photos.length > 5) {
      setError("Please choose 1 to 5 clear photos (only that student's face).");
      return;
    }
    setAdding(true);
    let createdId = null;
    try {
      // Step 1: save the student in the database
      const created = await api.post("/admin/student", form);
      createdId = created.data.id;

      // Step 2: register the face from the photos
      const fd = new FormData();
      photos.forEach((f) => fd.append("images", f));
      await api.post(`/admin/student/${encodeURIComponent(form.rollNo)}/register-face`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(`${form.name} was added and the face was registered.`);
      setForm(emptyForm);
      setPhotos([]);
      document.getElementById("student-photos").value = "";
      load();
    } catch (err) {
      // If face registration fails, remove the half-created student so it can be retried
      if (createdId) { try { await api.delete(`/teacher/student/${createdId}`); } catch (e2) {} }
      setError(err.response?.data?.error || "Could not add the student. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This also removes their attendance history. This cannot be undone.`)) return;
    setError(""); setMessage("");
    try {
      await api.delete(`${basePath}/student/${id}`);
      setMessage(`${name} deleted.`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete student");
    }
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand"><span className="mark">A</span> Attendance Register</div>
      </div>
      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2>Students <span className="text-muted" style={{ fontSize: "1rem", fontFamily: "Inter" }}>({students.length} total)</span></h2>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Add new student</div>
          <form onSubmit={handleAdd}>
            <div className="grid-2">
              <div className="field"><label>Roll No</label>
                <input className="input mono" required value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} /></div>
              <div className="field"><label>Name</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Semester</label>
                <input className="input" placeholder="e.g. MCA 3rd" required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              <div className="field"><label>Section</label>
                <input className="input" placeholder="e.g. A" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
              <div className="field"><label>Email (optional)</label>
                <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Branch (optional)</label>
                <input className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
            </div>
            <div className="field"><label>Student photos (1 to 5, clear and front-facing, one face only)</label>
              <input id="student-photos" className="input" type="file" accept="image/*" multiple
                onChange={(e) => setPhotos(Array.from(e.target.files))} />
            </div>
            <div className="text-muted" style={{ marginBottom: 12 }}>
              Note: attendance is marked only for students whose Semester and Section exactly match the class's Semester and Section.
            </div>
            <button className="btn btn-primary" disabled={adding}>{adding ? "Registering face… please wait" : "Add student"}</button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="ledger">
            <thead>
              <tr><th>Roll</th><th>Name</th><th>Semester</th><th>Section</th><th>Face registered</th><th></th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="roll">{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>{s.semester}</td>
                  <td>{s.section}</td>
                  <td>
                    <span className={`stamp ${s.faceRegistered ? "stamp-present" : "stamp-pending"}`}>
                      {s.faceRegistered ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger-outline" style={{ padding: "5px 12px", fontSize: "0.8rem" }}
                      onClick={() => handleDelete(s.id, s.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 32 }} className="text-muted">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

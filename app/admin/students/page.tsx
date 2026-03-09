"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "http://127.0.0.1:8000";

export default function StudentsPage() {
  const { students, setStudents } = useData();
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/students/`)
      .then(r => r.json())
      .then(data => {
        setStudents(data.map((s: any) => ({ id: s.id, regNo: s.registration_number, name: s.name })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addStudent = () => {
    if (!regNo || !name) { alert("Fill all fields"); return; }
    if (students.find((s: any) => s.regNo === regNo)) { alert("Student already exists"); return; }
    fetch(`${API}/api/students/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_number: regNo, name })
    })
      .then(r => r.json())
      .then(data => {
        setStudents([...students, { id: data.id, regNo, name }]);
        setRegNo(""); setName("");
        setShowForm(false);
      })
      .catch(() => alert("Failed to add student"));
  };

  const deleteStudent = (id: number, regNo: string) => {
    fetch(`${API}/api/students/${id}/`, { method: "DELETE" })
      .then(() => setStudents(students.filter((s: any) => s.regNo !== regNo)))
      .catch(() => alert("Failed to delete student"));
  };

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Students</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{students.length} student{students.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Student</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
            <input className="input-dark" placeholder="Registration Number (e.g. 21BCE1234)" value={regNo} onChange={e => setRegNo(e.target.value)} />
            <input className="input-dark" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <button className="btn-primary" onClick={addStudent}>Add</button>
          </div>
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14 }}>No students added yet.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Reg No</th><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.regNo}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-green)" }}>{s.regNo}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.name}</td>
                  <td><button className="btn-danger" onClick={() => deleteStudent(s.id, s.regNo)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
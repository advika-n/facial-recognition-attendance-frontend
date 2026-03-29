"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function StudentsPage() {
  const { students, setStudents, dataLoaded } = useData();
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (dataLoaded) { setLoading(false); return; }
    fetch(`${API}/api/students/`)
      .then(r => r.json())
      .then(data => {
        setStudents(data.map((s: any) => ({
          id: s.id, regNo: s.registration_number, name: s.name, dept: s.department || ""
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataLoaded]);

  const openForm = () => { setShowForm(true); setFormError(""); };
  const closeForm = () => { setShowForm(false); setFormError(""); setRegNo(""); setName(""); setDept(""); };

  const addStudent = () => {
    if (!regNo || !name || !dept) { setFormError("Please fill in all fields."); return; }
    if (students.find((s: any) => s.regNo === regNo)) { setFormError("A student with this registration number already exists."); return; }
    setFormError("");
    fetch(`${API}/api/students/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_number: regNo, name, department: dept })
    })
      .then(r => r.json())
      .then(data => {
        setStudents([...students, { id: data.id, regNo, name, dept }]);
        closeForm();
      })
      .catch(() => setFormError("Failed to add student. Please try again."));
  };

  const deleteStudent = (id: number, regNo: string) => {
    fetch(`${API}/api/students/${id}/`, { method: "DELETE" })
      .then(() => { setStudents(students.filter((s: any) => s.regNo !== regNo)); setConfirmDeleteId(null); })
      .catch(() => setConfirmDeleteId(null));
  };

  const filtered = students.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    (s.dept || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Students</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{students.length} student{students.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-primary" onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      <div style={{
        display: "grid", gridTemplateRows: showForm ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease", marginBottom: showForm ? 24 : 0,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Student</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
              <input className="input-dark" placeholder="Registration Number (e.g. 21BCE1234)" value={regNo}
                onChange={e => { setRegNo(e.target.value); setFormError(""); }} onKeyDown={e => e.key === "Enter" && addStudent()} />
              <input className="input-dark" placeholder="Full Name" value={name}
                onChange={e => { setName(e.target.value); setFormError(""); }} onKeyDown={e => e.key === "Enter" && addStudent()} />
              <input className="input-dark" placeholder="Department (e.g. CSE)" value={dept}
                onChange={e => { setDept(e.target.value); setFormError(""); }} onKeyDown={e => e.key === "Enter" && addStudent()} />
              <button className="btn-primary" onClick={addStudent}>Add</button>
            </div>
            {formError && (
              <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
                ⚠ {formError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {!loading && students.length > 0 && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <input className="input-dark" placeholder="Search by name, reg no or department..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
        )}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14 }}>No students added yet.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No students match "{search}".</div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Reg No</th><th>Name</th><th>Department</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.regNo}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-green)" }}>{s.regNo}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{s.dept || "—"}</span></td>
                  <td>
                    {confirmDeleteId === s.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
                        <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deleteStudent(s.id, s.regNo)}>Yes</button>
                        <button style={{ padding: "4px 10px", fontSize: 12, background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn-danger" onClick={() => setConfirmDeleteId(s.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

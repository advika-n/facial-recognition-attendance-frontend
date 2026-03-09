"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "http://127.0.0.1:8000";

export default function ProfessorsPage() {
  const { professors, setProfessors } = useData();
  const [profId, setProfId] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/professors/`)
      .then(r => r.json())
      .then(data => {
        setProfessors(data.map((p: any) => ({ id: p.id, profId: p.professor_id, name: p.name, dept: p.department })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addProfessor = () => {
    if (!profId || !name || !dept) { alert("Fill all fields"); return; }
    if (professors.find((p: any) => p.profId === profId)) { alert("Professor ID already exists"); return; }
    fetch(`${API}/api/professors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professor_id: profId, name, department: dept })
    })
      .then(r => r.json())
      .then(data => {
        setProfessors([...professors, { id: data.id, profId, name, dept }]);
        setProfId(""); setName(""); setDept("");
        setShowForm(false);
      })
      .catch(() => alert("Failed to add professor"));
  };

  const deleteProfessor = (id: number, profId: string) => {
    fetch(`${API}/api/professors/${id}/`, { method: "DELETE" })
      .then(() => setProfessors(professors.filter((p: any) => p.profId !== profId)))
      .catch(() => alert("Failed to delete professor"));
  };

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Professors</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {professors.length} professor{professors.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Professor"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Professor</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
            <input className="input-dark" placeholder="Professor ID (e.g. P101)" value={profId} onChange={e => setProfId(e.target.value)} />
            <input className="input-dark" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-dark" placeholder="Department" value={dept} onChange={e => setDept(e.target.value)} />
            <button className="btn-primary" onClick={addProfessor} style={{ whiteSpace: "nowrap" }}>Add</button>
          </div>
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : professors.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 14 }}>No professors added yet.</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "var(--accent-blue)", cursor: "pointer" }} onClick={() => setShowForm(true)}>
              + Add your first professor
            </div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Professor ID</th><th>Name</th><th>Department</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {professors.map((p: any) => (
                <tr key={p.profId}>
                  <td><span className="badge badge-blue" style={{ fontFamily: "monospace", fontSize: 11 }}>{p.profId}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</td>
                  <td><span className="badge badge-purple">{p.dept}</span></td>
                  <td><button className="btn-danger" onClick={() => deleteProfessor(p.id, p.profId)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
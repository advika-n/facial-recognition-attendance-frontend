"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ProfessorsPage() {
  const { professors, setProfessors } = useData();
  const [profId, setProfId] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/api/professors/`)
      .then(r => r.json())
      .then(data => {
        setProfessors(data.map((p: any) => ({ id: p.id, profId: p.professor_id, name: p.name, dept: p.department })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openForm = () => { setShowForm(true); setFormError(""); };
  const closeForm = () => { setShowForm(false); setFormError(""); setProfId(""); setName(""); setDept(""); };

  const addProfessor = () => {
    if (!profId || !name || !dept) { setFormError("Please fill in all fields."); return; }
    if (professors.find((p: any) => p.profId === profId)) { setFormError("A professor with this ID already exists."); return; }
    setFormError("");
    fetch(`${API}/api/professors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professor_id: profId, name, department: dept })
    })
      .then(r => r.json())
      .then(data => {
        setProfessors([...professors, { id: data.id, profId, name, dept }]);
        closeForm();
      })
      .catch(() => setFormError("Failed to add professor. Please try again."));
  };

  const deleteProfessor = (id: number, pId: string) => {
    fetch(`${API}/api/professors/${id}/`, { method: "DELETE" })
      .then(() => { setProfessors(professors.filter((p: any) => p.profId !== pId)); setConfirmDeleteId(null); })
      .catch(() => setConfirmDeleteId(null));
  };

  const filtered = professors.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.profId.toLowerCase().includes(search.toLowerCase()) ||
    (p.dept || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Professors</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {professors.length} professor{professors.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button className="btn-primary" onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "+ Add Professor"}
        </button>
      </div>

      <div style={{
        display: "grid", gridTemplateRows: showForm ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease", marginBottom: showForm ? 24 : 0,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Professor</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
              <input className="input-dark" placeholder="Professor ID (e.g. P101)" value={profId}
                onChange={e => { setProfId(e.target.value); setFormError(""); }} />
              <input className="input-dark" placeholder="Full Name" value={name}
                onChange={e => { setName(e.target.value); setFormError(""); }} />
              <input className="input-dark" placeholder="Department (e.g. CSE)" value={dept}
                onChange={e => { setDept(e.target.value); setFormError(""); }} />
              <button className="btn-primary" onClick={addProfessor} style={{ whiteSpace: "nowrap" }}>Add</button>
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
        {!loading && professors.length > 0 && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <input className="input-dark" placeholder="Search by name, ID or department..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
        )}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : professors.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 14 }}>No professors added yet.</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "var(--accent-blue)", cursor: "pointer" }} onClick={openForm}>
              + Add your first professor
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No professors match "{search}".</div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Professor ID</th><th>Name</th><th>Department</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.profId}>
                  <td><span className="badge badge-blue" style={{ fontFamily: "monospace", fontSize: 11 }}>{p.profId}</span></td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</td>
                  <td><span className="badge badge-purple">{p.dept}</span></td>
                  <td>
                    {confirmDeleteId === p.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
                        <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deleteProfessor(p.id, p.profId)}>Yes</button>
                        <button style={{ padding: "4px 10px", fontSize: 12, background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn-danger" onClick={() => setConfirmDeleteId(p.id)}>Delete</button>
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

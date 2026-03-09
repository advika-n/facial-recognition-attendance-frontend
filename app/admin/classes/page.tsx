"use client";

import { useState } from "react";
import { useData } from "@/app/store/dataStore";

export default function ClassesPage() {
  const { classes, setClasses, professors } = useData();
  const [classId, setClassId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [profId, setProfId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addClass = () => {
    if (!classId || !courseName || !courseCode || !profId) { alert("Fill all fields"); return; }
    if (classes.find((c: any) => c.classId === classId)) { alert("ClassID already exists"); return; }
    setClasses([...classes, { classId, courseName, courseCode, profId }]);
    setClassId(""); setCourseName(""); setCourseCode(""); setProfId("");
    setShowForm(false);
  };

  const deleteClass = (id: string) => setClasses(classes.filter((c: any) => c.classId !== id));

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Classes</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{classes.length} class{classes.length !== 1 ? "es" : ""} created</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Class"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
            New Class
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Class ID</label>
              <input className="input-dark" placeholder="e.g. CH202526010001" value={classId} onChange={e => setClassId(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Course Name</label>
              <input className="input-dark" placeholder="e.g. Data Structures" value={courseName} onChange={e => setCourseName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Course Code</label>
              <input className="input-dark" placeholder="e.g. CSE201" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Assign Professor</label>
              <select className="input-dark" value={profId} onChange={e => setProfId(e.target.value)}>
                <option value="">Select Professor</option>
                {professors.map((p: any) => (
                  <option key={p.profId} value={p.profId}>{p.profId} — {p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-primary" onClick={addClass}>Create Class</button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {classes.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⬡</div>
            <div style={{ fontSize: 14 }}>No classes created yet.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr>
                <th>Class ID</th>
                <th>Course Name</th>
                <th>Code</th>
                <th>Professor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c: any) => {
                const prof = professors.find((p: any) => p.profId === c.profId);
                return (
                  <tr key={c.classId}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{c.classId}</span></td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.courseName}</td>
                    <td><span className="badge badge-amber">{c.courseCode}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{prof ? prof.name : <span style={{ color: "var(--accent-red)", fontSize: 12 }}>Unknown</span>}</td>
                    <td><button className="btn-danger" onClick={() => deleteClass(c.classId)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

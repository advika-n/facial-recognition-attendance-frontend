"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "http://127.0.0.1:8000";

const THEORY_SLOTS = [
  "A1","A2","B1","B2","C1","C2","D1","D2","E1","E2","F1","F2","G1","G2",
  "TB1","TB2","TC1","TC2","TD1","TD2","TE1","TE2","TF1","TF2","TG1","TG2",
  "S1","S2","S3","S4"
];
const LAB_SLOTS = Array.from({ length: 60 }, (_, i) => `L${i + 1}`);
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function TimetablePage() {
  const { timetable, setTimetable, classes, classrooms } = useData();
  const [type, setType] = useState("Theory");
  const [day, setDay] = useState("Monday");
  const [slot, setSlot] = useState("A1");
  const [classId, setClassId] = useState("");
  const [classroom, setClassroom] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const slots = type === "Lab" ? LAB_SLOTS : THEORY_SLOTS;

  useEffect(() => {
    fetch(`${API}/api/timetable/`)
      .then(r => r.json())
      .then(data => {
        setTimetable(data.map((e: any) => ({
          id: e.id,
          type: e.slot_type,
          day: e.day,
          slot: e.slot,
          classId: e.class_id,
          classroom: e.classroom,
          courseName: e.course_name
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addEntry = () => {
    if (!classId || !classroom) { alert("Fill all fields"); return; }
    const conflict = timetable.find((e: any) =>
      e.day === day && e.slot === slot && (e.classroom === classroom || e.classId === classId)
    );
    if (conflict) { alert(`Conflict detected! ${classroom} or ${classId} already scheduled on ${day} ${slot}`); return; }
    const cls = classes.find((c: any) => c.classId === classId);
    fetch(`${API}/api/timetable/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: classId,
        course_name: cls?.courseName || "",
        slot_type: type,
        day,
        slot,
        classroom
      })
    })
      .then(r => r.json())
      .then(data => {
        setTimetable([...timetable, { id: data.id, type, day, slot, classId, classroom, courseName: cls?.courseName || "" }]);
        setClassId(""); setClassroom("");
        setShowForm(false);
      })
      .catch(() => alert("Failed to add timetable entry"));
  };

  const deleteEntry = (id: number) => {
    fetch(`${API}/api/timetable/${id}/`, { method: "DELETE" })
      .then(() => setTimetable(timetable.filter((e: any) => e.id !== id)))
      .catch(() => alert("Failed to delete entry"));
  };

  const getClass = (id: string) => classes.find((c: any) => c.classId === id);

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Timetable Builder</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{timetable.length} slot{timetable.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Schedule Slot"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Timetable Entry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Type</label>
              <select className="input-dark" value={type} onChange={e => { setType(e.target.value); setSlot(e.target.value === "Lab" ? "L1" : "A1"); }}>
                <option>Theory</option>
                <option>Tutorial</option>
                <option>Lab</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Day</label>
              <select className="input-dark" value={day} onChange={e => setDay(e.target.value)}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Slot</label>
              <select className="input-dark" value={slot} onChange={e => setSlot(e.target.value)}>
                {slots.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Class ID</label>
              <select className="input-dark" value={classId} onChange={e => setClassId(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map((c: any) => (
                  <option key={c.classId} value={c.classId}>{c.classId} — {c.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Classroom</label>
              <select className="input-dark" value={classroom} onChange={e => setClassroom(e.target.value)}>
                <option value="">Select Room</option>
                {classrooms.map((r: any) => (
                  <option key={r.roomName} value={r.roomName}>{r.roomName} ({r.roomType})</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={addEntry}>Add to Timetable</button>
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : timetable.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⊞</div>
            <div style={{ fontSize: 14 }}>No timetable entries yet.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Type</th><th>Day</th><th>Slot</th><th>Class ID</th><th>Course</th><th>Room</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {timetable.map((e: any) => {
                const cls = getClass(e.classId);
                return (
                  <tr key={e.id}>
                    <td>
                      <span className={e.type === "Lab" ? "badge badge-purple" : e.type === "Tutorial" ? "badge badge-amber" : "badge badge-blue"}>
                        {e.type}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{e.day}</td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-surface)", padding: "2px 8px", borderRadius: 4 }}>
                        {e.slot}
                      </span>
                    </td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{e.classId}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{cls?.courseName || e.courseName || "—"}</td>
                    <td><span className="badge badge-green">{e.classroom}</span></td>
                    <td><button className="btn-danger" onClick={() => deleteEntry(e.id)}>Delete</button></td>
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
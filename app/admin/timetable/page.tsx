"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const { timetable, setTimetable, classes, classrooms } = useData();
  const [type, setType] = useState("Theory");
  const [day, setDay] = useState("Monday");
  const [slot, setSlot] = useState("");
  const [classId, setClassId] = useState("");
  const [classroom, setClassroom] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
          courseName: e.course_name,
          profId: e.professor_id
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addEntry = () => {
    if (!classId || !classroom || !slot) { alert("Fill all fields"); return; }
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
        classroom,
        professor_id: cls?.profId || ""
      })
    })
      .then(r => r.json())
      .then(data => {
        setTimetable([...timetable, { id: data.id, type, day, slot, classId, classroom, courseName: cls?.courseName || "", profId: cls?.profId || "" }]);
        setSlot(""); setClassId(""); setClassroom("");
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
              <select className="input-dark" value={type} onChange={e => setType(e.target.value)}>
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
              <input className="input-dark" placeholder="e.g. A1 or L31" value={slot} onChange={e => setSlot(e.target.value)} />
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

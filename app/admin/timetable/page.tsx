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
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  const openForm = () => { setShowForm(true); setFormError(""); };
  const closeForm = () => { setShowForm(false); setFormError(""); setSlot(""); setClassId(""); setClassroom(""); };

  const addEntry = () => {
    if (!classId || !classroom || !slot) { setFormError("Please fill in all fields."); return; }
    const conflict = timetable.find((e: any) =>
      e.day === day && e.slot === slot && (e.classroom === classroom || e.classId === classId)
    );
    if (conflict) { setFormError(`Conflict: ${classroom} or ${classId} is already scheduled on ${day} ${slot}.`); return; }
    setFormError("");
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
        closeForm();
      })
      .catch(() => setFormError("Failed to add timetable entry. Please try again."));
  };

  const deleteEntry = (id: number) => {
    fetch(`${API}/api/timetable/${id}/`, { method: "DELETE" })
      .then(() => { setTimetable(timetable.filter((e: any) => e.id !== id)); setConfirmDeleteId(null); })
      .catch(() => setConfirmDeleteId(null));
  };

  const getClass = (id: string) => classes.find((c: any) => c.classId === id);

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Timetable Builder</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{timetable.length} slot{timetable.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <button className="btn-primary" onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "+ Schedule Slot"}
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateRows: showForm ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease",
        marginBottom: showForm ? 24 : 0,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-bright)",
            borderRadius: 16, padding: 24,
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
                <input className="input-dark" placeholder="e.g. A1 or L31" value={slot} onChange={e => { setSlot(e.target.value); setFormError(""); }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Class ID</label>
                <select className="input-dark" value={classId} onChange={e => { setClassId(e.target.value); setFormError(""); }}>
                  <option value="">Select Class</option>
                  {classes.map((c: any) => (
                    <option key={c.classId} value={c.classId}>{c.classId} — {c.courseName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Classroom</label>
                <select className="input-dark" value={classroom} onChange={e => { setClassroom(e.target.value); setFormError(""); }}>
                  <option value="">Select Room</option>
                  {classrooms.map((r: any) => (
                    <option key={r.roomName} value={r.roomName}>{r.roomName} ({r.roomType})</option>
                  ))}
                </select>
              </div>
            </div>
            {formError && (
              <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
                ⚠ {formError}
              </div>
            )}
            <button className="btn-primary" onClick={addEntry}>Add to Timetable</button>
          </div>
        </div>
      </div>

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
                    <td>
                      {confirmDeleteId === e.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
                          <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => deleteEntry(e.id)}>Yes</button>
                          <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn-danger" onClick={() => setConfirmDeleteId(e.id)}>Delete</button>
                      )}
                    </td>
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

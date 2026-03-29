"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  Theory:   { badge: "badge-blue",   icon: "▦" },
  Tutorial: { badge: "badge-amber",  icon: "◈" },
  Lab:      { badge: "badge-purple", icon: "⚗" },
};

export default function TimetablePage() {
  const { timetable, setTimetable, classes, classrooms, dataLoaded } = useData();
  const [type, setType] = useState("Theory");
  const [day, setDay] = useState("Monday");
  const [slot, setSlot] = useState("");
  const [classId, setClassId] = useState("");
  const [classroom, setClassroom] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("All");

  useEffect(() => {
    if (dataLoaded) { setLoading(false); return; }
    fetch(`${API}/api/timetable/`)
      .then(r => r.json())
      .then(data => {
        setTimetable(data.map((e: any) => ({
          id: e.id, type: e.slot_type, day: e.day, slot: e.slot,
          classId: e.class_id, classroom: e.classroom,
          courseName: e.course_name, profId: e.professor_id
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataLoaded]);

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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: classId, course_name: cls?.courseName || "",
        slot_type: type, day, slot, classroom,
        professor_id: cls?.profId || ""
      })
    })
      .then(r => {
        if (!r.ok) { r.json().then(d => setFormError(d.error || "Failed to add entry.")); return; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setTimetable([...timetable, { id: data.id, type, day, slot, classId, classroom, courseName: cls?.courseName || "", profId: cls?.profId || "" }]);
        closeForm();
      })
      .catch(() => setFormError("Failed to add timetable entry."));
  };

  const deleteEntry = (id: number) => {
    fetch(`${API}/api/timetable/${id}/`, { method: "DELETE" })
      .then(() => { setTimetable(timetable.filter((e: any) => e.id !== id)); setConfirmDeleteId(null); })
      .catch(() => setConfirmDeleteId(null));
  };

  const days = ["All", ...DAYS.filter(d => timetable.some((e: any) => e.day === d))];
  const visible = selectedDay === "All" ? timetable : timetable.filter((e: any) => e.day === selectedDay);

  // Group by day, preserving DAYS order
  const grouped: Record<string, any[]> = {};
  for (const d of DAYS) {
    const entries = visible.filter((e: any) => e.day === d);
    if (entries.length > 0) grouped[d] = entries;
  }

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Timetable</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {timetable.length} slot{timetable.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <button className="btn-primary" onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "+ Schedule Slot"}
        </button>
      </div>

      {/* Add form */}
      <div style={{
        display: "grid", gridTemplateRows: showForm ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease", marginBottom: showForm ? 24 : 0,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Timetable Entry</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 12 }}>
              {[
                { label: "Type", content: (
                  <select className="input-dark" value={type} onChange={e => setType(e.target.value)}>
                    <option>Theory</option><option>Tutorial</option><option>Lab</option>
                  </select>
                )},
                { label: "Day", content: (
                  <select className="input-dark" value={day} onChange={e => setDay(e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                )},
                { label: "Slot", content: (
                  <input className="input-dark" placeholder="e.g. A1 or L31" value={slot} onChange={e => { setSlot(e.target.value); setFormError(""); }} />
                )},
                { label: "Class", content: (
                  <select className="input-dark" value={classId} onChange={e => { setClassId(e.target.value); setFormError(""); }}>
                    <option value="">Select Class</option>
                    {classes.map((c: any) => <option key={c.classId} value={c.classId}>{c.classId} — {c.courseName}</option>)}
                  </select>
                )},
                { label: "Room", content: (
                  <select className="input-dark" value={classroom} onChange={e => { setClassroom(e.target.value); setFormError(""); }}>
                    <option value="">Select Room</option>
                    {classrooms.map((r: any) => <option key={r.roomName} value={r.roomName}>{r.roomName} ({r.roomType})</option>)}
                  </select>
                )},
              ].map(({ label, content }) => (
                <div key={label}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>{label}</label>
                  {content}
                </div>
              ))}
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

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
      ) : timetable.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⊞</div>
          <div style={{ fontSize: 14 }}>No timetable entries yet.</div>
        </div>
      ) : (
        <>
          {/* Day filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: selectedDay === d ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                background: selectedDay === d ? "var(--accent-blue-dim)" : "var(--bg-card)",
                color: selectedDay === d ? "var(--accent-blue)" : "var(--text-muted)",
                transition: "all 0.15s"
              }}>{d}</button>
            ))}
          </div>

          {/* Cards grouped by day */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {Object.entries(grouped).map(([dayName, entries]) => (
              <div key={dayName}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  {dayName}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {entries.map((e: any) => {
                    const typeStyle = TYPE_STYLES[e.type] || TYPE_STYLES.Theory;
                    return (
                      <div key={e.id} style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: 14, padding: "16px 18px",
                        display: "flex", flexDirection: "column", gap: 10,
                        transition: "border-color 0.2s",
                      }}>
                        {/* Top row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className={`badge ${typeStyle.badge}`} style={{ fontSize: 11 }}>
                              {typeStyle.icon} {e.type}
                            </span>
                            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-surface)", padding: "2px 8px", borderRadius: 4 }}>
                              {e.slot}
                            </span>
                          </div>
                          <span className="badge badge-green" style={{ fontSize: 11 }}>{e.classroom}</span>
                        </div>

                        {/* Course name */}
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                          {e.courseName || "—"}
                        </div>

                        {/* Class ID */}
                        <div style={{ fontSize: 11, color: "var(--accent-blue)", fontFamily: "monospace" }}>
                          {e.classId}
                        </div>

                        {/* Delete */}
                        <div style={{ marginTop: 4 }}>
                          {confirmDeleteId === e.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Are you sure?</span>
                              <button className="btn-danger" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => deleteEntry(e.id)}>Yes</button>
                              <button style={{ padding: "3px 8px", fontSize: 11, background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn-danger" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setConfirmDeleteId(e.id)}>Delete</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

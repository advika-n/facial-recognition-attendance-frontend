"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

// ─── Inline error box ────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
      ⚠ {message}
    </div>
  );
}

// ─── Delete confirm inline ───────────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Are you sure?</span>
      <button className="btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={onConfirm}>Yes</button>
      <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={onCancel}>Cancel</button>
    </div>
  );
}

// ─── Slide wrapper ───────────────────────────────────────────────────────────
function SlideDown({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
      <div style={{ overflow: "hidden" }}>{children}</div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ClassesSetupPage() {
  const { classes, setClasses, classrooms, setClassrooms, enrollments, setEnrollments, professors, students } = useData();

  // ── Class form state
  const [showClassForm, setShowClassForm] = useState(false);
  const [classId, setClassId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [profId, setProfId] = useState("");
  const [classFormError, setClassFormError] = useState("");
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<number | null>(null);

  // ── Expanded class rows
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // ── Enroll state (per class)
  const [enrollStudentReg, setEnrollStudentReg] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [confirmDeleteEnrollId, setConfirmDeleteEnrollId] = useState<number | null>(null);

  // ── Classroom section
  const [showRoomSection, setShowRoomSection] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("Lecture");
  const [cameraId, setCameraId] = useState("");
  const [roomFormError, setRoomFormError] = useState("");
  const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  // ── Fetch everything on load
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/classes/`).then(r => r.json()),
      fetch(`${API}/api/classrooms/`).then(r => r.json()),
      fetch(`${API}/api/enrollments/`).then(r => r.json()),
    ]).then(([cls, rooms, enr]) => {
      setClasses(cls.map((c: any) => ({
        id: c.id, classId: c.class_id, courseName: c.course_name,
        courseCode: c.course_code, profId: c.professor_id
      })));
      setClassrooms(rooms.map((r: any) => ({
        id: r.id, roomName: r.room_name, roomType: r.room_type, cameraId: r.camera_id
      })));
      setEnrollments(enr.map((e: any) => ({
        id: e.id, studentReg: e.student__registration_number,
        classId: e.course__course_code, courseName: e.course__course_name
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ── Add class
  const addClass = () => {
    if (!classId || !courseName || !courseCode || !profId) { setClassFormError("Please fill in all fields."); return; }
    if (classes.find((c: any) => c.classId === classId)) { setClassFormError("A class with this ID already exists."); return; }
    setClassFormError("");
    fetch(`${API}/api/classes/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: classId, course_code: courseCode, course_name: courseName, professor_id: profId })
    }).then(r => r.json()).then(data => {
      setClasses([...classes, { id: data.id, classId, courseName, courseCode, profId }]);
      setClassId(""); setCourseName(""); setCourseCode(""); setProfId("");
      setShowClassForm(false);
    }).catch(() => setClassFormError("Failed to create class. Please try again."));
  };

  // ── Delete class
  const deleteClass = (id: number, cId: string) => {
    fetch(`${API}/api/classes/${id}/`, { method: "DELETE" })
      .then(() => { setClasses(classes.filter((c: any) => c.classId !== cId)); setConfirmDeleteClassId(null); if (expandedClassId === cId) setExpandedClassId(null); })
      .catch(() => setConfirmDeleteClassId(null));
  };

  // ── Enroll student
  const enrollStudent = (cls: any) => {
    if (!enrollStudentReg) { setEnrollError("Please select a student."); return; }
    const exists = enrollments.find((e: any) => e.studentReg === enrollStudentReg && e.classId === cls.classId);
    if (exists) { setEnrollError("This student is already enrolled."); return; }
    setEnrollError("");
    fetch(`${API}/api/enrollments/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_number: enrollStudentReg, course_code: cls.courseCode })
    }).then(r => r.json()).then(data => {
      setEnrollments([...enrollments, { id: data.id, studentReg: enrollStudentReg, classId: cls.classId, courseName: cls.courseName }]);
      setEnrollStudentReg("");
    }).catch(() => setEnrollError("Failed to enroll student. Please try again."));
  };

  // ── Remove enrollment
  const removeEnrollment = (id: number) => {
    fetch(`${API}/api/enrollments/${id}/`, { method: "DELETE" })
      .then(() => { setEnrollments(enrollments.filter((e: any) => e.id !== id)); setConfirmDeleteEnrollId(null); })
      .catch(() => setConfirmDeleteEnrollId(null));
  };

  // ── Add room
  const addRoom = () => {
    if (!roomName) { setRoomFormError("Please enter a room name."); return; }
    if (classrooms.find((r: any) => r.roomName === roomName)) { setRoomFormError("A room with this name already exists."); return; }
    setRoomFormError("");
    fetch(`${API}/api/classrooms/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_name: roomName, room_type: roomType, camera_id: cameraId })
    }).then(r => r.json()).then(data => {
      setClassrooms([...classrooms, { id: data.id, roomName, roomType, cameraId }]);
      setRoomName(""); setRoomType("Lecture"); setCameraId(""); setShowRoomForm(false);
    }).catch(() => setRoomFormError("Failed to add classroom. Please try again."));
  };

  // ── Delete room
  const deleteRoom = (id: number) => {
    fetch(`${API}/api/classrooms/${id}/`, { method: "DELETE" })
      .then(() => { setClassrooms(classrooms.filter((r: any) => r.id !== id)); setConfirmDeleteRoomId(null); })
      .catch(() => setConfirmDeleteRoomId(null));
  };

  const getProf = (pId: string) => professors.find((p: any) => p.profId === pId);
  const getClassEnrollments = (cId: string) => enrollments.filter((e: any) => e.classId === cId);
  const getStudent = (reg: string) => students.find((s: any) => s.regNo === reg);
  const unenrolledStudents = (cId: string) => students.filter((s: any) => !enrollments.find((e: any) => e.studentReg === s.regNo && e.classId === cId));

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Classes</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {classes.length} class{classes.length !== 1 ? "es" : ""} · {enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setShowClassForm(!showClassForm); setClassFormError(""); }}>
          {showClassForm ? "Cancel" : "+ New Class"}
        </button>
      </div>

      {/* ── New class form ── */}
      <SlideDown open={showClassForm}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Class</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Class ID</label>
              <input className="input-dark" placeholder="e.g. CH202526010001" value={classId} onChange={e => { setClassId(e.target.value); setClassFormError(""); }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Course Name</label>
              <input className="input-dark" placeholder="e.g. Data Structures" value={courseName} onChange={e => { setCourseName(e.target.value); setClassFormError(""); }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Course Code</label>
              <input className="input-dark" placeholder="e.g. CS301" value={courseCode} onChange={e => { setCourseCode(e.target.value); setClassFormError(""); }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Assign Professor</label>
              {professors.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--accent-amber)", padding: "10px 0" }}>⚠ Add professors first.</div>
              ) : (
                <select className="input-dark" value={profId} onChange={e => { setProfId(e.target.value); setClassFormError(""); }}>
                  <option value="">Select Professor</option>
                  {professors.map((p: any) => <option key={p.profId} value={p.profId}>{p.profId} — {p.name}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-primary" onClick={addClass}>Create</button>
            </div>
          </div>
          <ErrorBox message={classFormError} />
        </div>
      </SlideDown>

      {/* ── Class list ── */}
      {classes.length === 0 ? (
        <div className="animate-in-delay-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⬡</div>
          <div style={{ fontSize: 14 }}>No classes created yet.</div>
        </div>
      ) : (
        <div className="animate-in-delay-1" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map((c: any) => {
            const prof = getProf(c.profId);
            const isOpen = expandedClassId === c.classId;
            const classEnrollments = getClassEnrollments(c.classId);
            const available = unenrolledStudents(c.classId);

            return (
              <div key={c.classId} style={{ background: "var(--bg-card)", border: `1px solid ${isOpen ? "var(--border-bright)" : "var(--border)"}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}>

                {/* ── Class row ── */}
                <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
                    <div>
                      <div style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{c.courseName}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent-blue)" }}>{c.classId}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>·</span>
                        <span className="badge badge-amber" style={{ fontSize: 11 }}>{c.courseCode}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{prof ? prof.name : <span style={{ color: "var(--accent-red)" }}>No professor</span>}</span>
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {classEnrollments.length} student{classEnrollments.length !== 1 ? "s" : ""}
                      </span>
                      {confirmDeleteClassId === c.id ? (
                        <DeleteConfirm onConfirm={() => deleteClass(c.id, c.classId)} onCancel={() => setConfirmDeleteClassId(null)} />
                      ) : (
                        <button className="btn-danger" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setConfirmDeleteClassId(c.id)}>Delete</button>
                      )}
                      <button onClick={() => { setExpandedClassId(isOpen ? null : c.classId); setEnrollStudentReg(""); setEnrollError(""); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: "0 4px", transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▾
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Expanded section ── */}
                <SlideDown open={isOpen}>
                  <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", background: "var(--bg-surface)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                      {/* Enrolled students */}
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Enrolled Students</div>
                        {classEnrollments.length === 0 ? (
                          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>No students enrolled yet.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                            {classEnrollments.map((e: any) => {
                              const stu = getStudent(e.studentReg);
                              return (
                                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                  <div>
                                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{stu?.name || e.studentReg}</span>
                                    <span style={{ fontSize: 11, color: "var(--accent-green)", fontFamily: "monospace", marginLeft: 8 }}>{e.studentReg}</span>
                                  </div>
                                  {confirmDeleteEnrollId === e.id ? (
                                    <DeleteConfirm onConfirm={() => removeEnrollment(e.id)} onCancel={() => setConfirmDeleteEnrollId(null)} />
                                  ) : (
                                    <button className="btn-danger" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setConfirmDeleteEnrollId(e.id)}>Remove</button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add student */}
                        {available.length > 0 ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <select className="input-dark" style={{ flex: 1, fontSize: 13 }} value={enrollStudentReg} onChange={e => { setEnrollStudentReg(e.target.value); setEnrollError(""); }}>
                              <option value="">Add student...</option>
                              {available.map((s: any) => <option key={s.regNo} value={s.regNo}>{s.regNo} — {s.name}</option>)}
                            </select>
                            <button className="btn-primary" style={{ fontSize: 13, padding: "8px 14px", whiteSpace: "nowrap" }} onClick={() => enrollStudent(c)}>+ Enroll</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>All students enrolled.</div>
                        )}
                        <ErrorBox message={enrollError} />
                      </div>

                      {/* Class info */}
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Class Info</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "Class ID", value: c.classId, mono: true, color: "var(--accent-blue)" },
                            { label: "Course Code", value: c.courseCode, mono: false, color: "var(--accent-amber)" },
                            { label: "Professor", value: prof ? `${prof.name} (${prof.profId})` : "Not assigned", mono: false, color: prof ? "var(--text-primary)" : "var(--accent-red)" },
                            { label: "Department", value: prof?.dept || "—", mono: false, color: "var(--text-secondary)" },
                          ].map(row => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.label}</span>
                              <span style={{ fontSize: 13, color: row.color, fontFamily: row.mono ? "monospace" : "inherit", fontWeight: 500 }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SlideDown>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Classrooms section ── */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, cursor: "pointer" }}
          onClick={() => setShowRoomSection(!showRoomSection)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Classrooms</h2>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{classrooms.length} room{classrooms.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {showRoomSection && (
              <button className="btn-primary" style={{ fontSize: 13, padding: "7px 14px" }}
                onClick={e => { e.stopPropagation(); setShowRoomForm(!showRoomForm); setRoomFormError(""); }}>
                {showRoomForm ? "Cancel" : "+ Add Room"}
              </button>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: 18, transition: "transform 0.25s", display: "inline-block", transform: showRoomSection ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </div>
        </div>

        <SlideDown open={showRoomSection}>
          <div>
            {/* Add room form */}
            <SlideDown open={showRoomForm}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
                  <input className="input-dark" placeholder="Room name (e.g. 301)" value={roomName} onChange={e => { setRoomName(e.target.value); setRoomFormError(""); }} />
                  <select className="input-dark" value={roomType} onChange={e => setRoomType(e.target.value)}>
                    <option>Lecture</option>
                    <option>Lab</option>
                  </select>
                  <input className="input-dark" placeholder="Camera ID (optional)" value={cameraId} onChange={e => setCameraId(e.target.value)} />
                  <button className="btn-primary" onClick={addRoom}>Add</button>
                </div>
                <ErrorBox message={roomFormError} />
              </div>
            </SlideDown>

            {/* Rooms table */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              {classrooms.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⬜</div>
                  No classrooms registered yet.
                </div>
              ) : (
                <table className="dark-table">
                  <thead>
                    <tr><th>Room</th><th>Type</th><th>Camera ID</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {classrooms.map((r: any) => (
                      <tr key={r.id}>
                        <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{r.roomName}</td>
                        <td><span className={r.roomType === "Lab" ? "badge badge-purple" : "badge badge-green"}>{r.roomType}</span></td>
                        <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{r.cameraId || "—"}</td>
                        <td>
                          {confirmDeleteRoomId === r.id ? (
                            <DeleteConfirm onConfirm={() => deleteRoom(r.id)} onCancel={() => setConfirmDeleteRoomId(null)} />
                          ) : (
                            <button className="btn-danger" onClick={() => setConfirmDeleteRoomId(r.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </SlideDown>
      </div>
    </div>
  );
}

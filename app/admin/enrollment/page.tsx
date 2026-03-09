"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "http://127.0.0.1:8000";

export default function EnrollmentPage() {
  const { students, classes, enrollments, setEnrollments } = useData();
  const [studentReg, setStudentReg] = useState("");
  const [classId, setClassId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/enrollments/`)
      .then(r => r.json())
      .then(data => {
        setEnrollments(data.map((e: any) => ({
          id: e.id,
          studentReg: e.student__registration_number,
          classId: e.course__course_code,
          courseName: e.course__course_name
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const assignClass = () => {
    if (!studentReg || !classId) { alert("Select student and class"); return; }
    const exists = enrollments.find((e: any) => e.studentReg === studentReg && e.classId === classId);
    if (exists) { alert("Student already enrolled in this class"); return; }
    const cls = classes.find((c: any) => c.classId === classId);
    fetch(`${API}/api/enrollments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registration_number: studentReg, course_code: cls?.courseCode || classId })
    })
      .then(r => r.json())
      .then(data => {
        setEnrollments([...enrollments, { id: data.id, studentReg, classId, courseName: cls?.courseName || "" }]);
        setStudentReg(""); setClassId("");
        setShowForm(false);
      })
      .catch(() => alert("Failed to enroll student"));
  };

  const removeEnrollment = (id: number) => {
    fetch(`${API}/api/enrollments/${id}/`, { method: "DELETE" })
      .then(() => setEnrollments(enrollments.filter((e: any) => e.id !== id)))
      .catch(() => alert("Failed to remove enrollment"));
  };

  const getStudent = (reg: string) => students.find((s: any) => s.regNo === reg);
  const getClass = (id: string) => classes.find((c: any) => c.classId === id);

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Enrollment</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            Assign students to classes — {enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Enroll Student"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Enrollment</h3>
          {students.length === 0 || classes.length === 0 ? (
            <div style={{ color: "var(--accent-amber)", fontSize: 13, padding: "8px 0" }}>
              ⚠ Add students and classes first before enrolling.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
              <select className="input-dark" value={studentReg} onChange={e => setStudentReg(e.target.value)}>
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s.regNo} value={s.regNo}>{s.regNo} — {s.name}</option>
                ))}
              </select>
              <select className="input-dark" value={classId} onChange={e => setClassId(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map((c: any) => (
                  <option key={c.classId} value={c.classId}>{c.classId} — {c.courseName}</option>
                ))}
              </select>
              <button className="btn-primary" onClick={assignClass}>Enroll</button>
            </div>
          )}
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⊕</div>
            <div style={{ fontSize: 14 }}>No enrollments yet.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Student</th><th>Reg No</th><th>Class ID</th><th>Course</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {enrollments.map((e: any) => {
                const student = getStudent(e.studentReg);
                const cls = getClass(e.classId);
                return (
                  <tr key={e.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{student?.name || e.studentReg}</td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-green)" }}>{e.studentReg}</span></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{e.classId}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{cls?.courseName || e.courseName || "—"}</td>
                    <td><button className="btn-danger" onClick={() => removeEnrollment(e.id)}>Remove</button></td>
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
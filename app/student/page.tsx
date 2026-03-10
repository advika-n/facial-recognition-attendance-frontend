"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/store/dataStore";
import { useRouter } from "next/navigation";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function StudentPage() {
  const { currentUser } = useData();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not logged in, redirect to login
    if (!currentUser || currentUser.role !== "student") {
      router.push("/login");
      return;
    }

    // Fetch real attendance data using the student's DB id
    fetch(`${API}/api/student/${currentUser.id}/attendance/`)
      .then(r => r.json())
      .then(data => {
        const attendance = data.attendance || {};
        const mapped = Object.entries(attendance).map(([code, info]: any) => ({
          course: info.course_name,
          classId: code,
          total: info.total,
          attended: info.attended,
        }));
        setCourses(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const overall = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + (c.total > 0 ? (c.attended / c.total) * 100 : 0), 0) / courses.length)
    : 0;

  const atRisk = courses.filter(c => c.total > 0 && (c.attended / c.total) * 100 < 75).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            My Attendance
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {currentUser?.registration_number} · {currentUser?.name} · 2025–26 Sem 1
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-green">Student</span>
          <a href="/login" style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", color: "var(--text-muted)",
            textDecoration: "none", fontSize: 13
          }}>⊗ Sign Out</a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Overall Attendance", value: `${overall}%`, color: overall < 75 ? "var(--accent-red)" : "var(--accent-green)", icon: "◎" },
          { label: "Courses Enrolled", value: courses.length, color: "var(--accent-blue)", icon: "⬡" },
          { label: "At Risk", value: atRisk, color: atRisk > 0 ? "var(--accent-red)" : "var(--accent-green)", icon: "⚠" },
        ].map((s, i) => (
          <div key={s.label} className={`animate-in-delay-${i + 1}`} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div className="animate-in-delay-2" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Course-wise Attendance
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No courses found.</div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Course</th><th>Code</th><th>Total</th><th>Attended</th><th>Attendance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {courses.map((c, i) => {
                const pct = c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0;
                const isLow = c.total > 0 && pct < 75;
                return (
                  <tr key={i}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{c.course}</td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent-blue)" }}>{c.classId}</span></td>
                    <td style={{ color: "var(--text-muted)" }}>{c.total || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.attended || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 80, height: 4, background: "var(--bg-surface)", borderRadius: 2 }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 2,
                            background: isLow ? "var(--accent-red)" : pct < 85 ? "var(--accent-amber)" : "var(--accent-green)"
                          }} />
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: isLow ? "var(--accent-red)" : pct < 85 ? "var(--accent-amber)" : "var(--accent-green)"
                        }}>{c.total > 0 ? `${pct}%` : "—"}</span>
                      </div>
                    </td>
                    <td>
                      {c.total === 0
                        ? <span className="badge badge-blue">Pending</span>
                        : isLow
                          ? <span className="badge badge-red">⚠ Low Attendance</span>
                          : <span className="badge badge-green">Safe</span>
                      }
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

"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ReportsPage() {
  const { students, dataLoaded } = useData();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataLoaded) return;  // wait for dataStore to finish loading
    if (students.length === 0) { setLoading(false); return; }

    const fetchAll = async () => {
      const all: any[] = [];
      for (const student of students) {
        try {
          const res = await fetch(`${API}/api/student/${student.id}/attendance/`);
          const data = await res.json();
          if (data.attendance) {
            for (const [code, info] of Object.entries(data.attendance) as any) {
              all.push({
                regNo: student.regNo,
                name: student.name,
                course: info.course_name,
                total: info.total,
                attended: info.attended,
              });
            }
          }
        } catch {}
      }
      setRecords(all);
      setLoading(false);
    };

    fetchAll();
  }, [students, dataLoaded]);

  const exportCSV = () => {
    const header = "Reg No,Name,Course,Total,Attended,Attendance %\n";
    const rows = records.map(r => {
      const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
      return `${r.regNo},${r.name},${r.course},${r.total},${r.attended},${pct}%`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendance_report.csv"; a.click();
  };

  const below75 = records.filter(r => r.total > 0 && (r.attended / r.total) * 100 < 75).length;

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Reports</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Live attendance data from backend</p>
        </div>
        <button className="btn-primary" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          ↓ Export CSV
        </button>
      </div>

      <div className="animate-in" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "var(--accent-blue)", fontSize: 20 }}>◎</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Syne" }}>{records.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Records</div>
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "var(--accent-red)", fontSize: 20 }}>⚠</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-red)", fontFamily: "Syne" }}>{below75}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Below 75%</div>
          </div>
        </div>
      </div>

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14 }}>No attendance data yet.</div>
            <div style={{ fontSize: 12, marginTop: 4, color: "var(--text-muted)" }}>Data will appear once lectures are conducted and attendance is marked.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Reg No</th><th>Name</th><th>Course</th><th>Total</th><th>Attended</th><th>Attendance</th></tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
                return (
                  <tr key={i}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-green)" }}>{r.regNo}</span></td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.course}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.total}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.attended}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, maxWidth: 80, height: 4, background: "var(--bg-surface)", borderRadius: 2 }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 2,
                            background: pct < 75 ? "var(--accent-red)" : pct < 85 ? "var(--accent-amber)" : "var(--accent-green)",
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: pct < 75 ? "var(--accent-red)" : pct < 85 ? "var(--accent-amber)" : "var(--accent-green)"
                        }}>{pct}%</span>
                        {pct < 75 && <span className="badge badge-red" style={{ fontSize: 10 }}>Low</span>}
                      </div>
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

"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ReportsPage() {
  const { students, dataLoaded } = useData();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "safe" | "at-risk">("all");

  useEffect(() => {
    if (!dataLoaded) return;
    if (students.length === 0) { setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true);
      setRecords([]);  // clear before re-fetching to prevent duplicates

      const results = await Promise.all(
        students.map(async (student: any) => {
          try {
            const res = await fetch(`${API}/api/student/${student.id}/attendance/`);
            const data = await res.json();
            if (!data.attendance) return [];
            return Object.entries(data.attendance).map(([code, info]: any) => ({
              regNo: student.regNo,
              name: student.name,
              dept: student.dept,
              course: info.course_name,
              courseCode: code,
              total: info.total,
              attended: info.attended,
            }));
          } catch {
            return [];
          }
        })
      );

      setRecords(results.flat());
      setLoading(false);
    };

    fetchAll();
  }, [dataLoaded]);  // only run when dataLoaded changes, not on every students update

  const exportCSV = () => {
    const header = "Reg No,Name,Department,Course,Total,Attended,Attendance %\n";
    const rows = records.map(r => {
      const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
      return `${r.regNo},${r.name},${r.dept},${r.course},${r.total},${r.attended},${pct}%`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendance_report.csv"; a.click();
  };

  const withAttendance = records.filter(r => r.total > 0);
  const below75 = records.filter(r => r.total > 0 && (r.attended / r.total) * 100 < 75);
  const avgPct = withAttendance.length > 0
    ? Math.round(withAttendance.reduce((sum, r) => sum + (r.attended / r.total) * 100, 0) / withAttendance.length)
    : 0;
  const perfect = records.filter(r => r.total > 0 && r.attended === r.total).length;

  const filtered = records.filter(r => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.regNo.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase());
    const pct = r.total > 0 ? (r.attended / r.total) * 100 : 0;
    const matchFilter =
      filter === "all" ||
      (filter === "safe" && pct >= 75) ||
      (filter === "at-risk" && r.total > 0 && pct < 75);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Reports</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Live attendance data across all courses</p>
        </div>
        <button className="btn-primary" onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Records", value: records.length, icon: "◎", color: "var(--accent-blue)" },
          { label: "Avg Attendance", value: loading ? "—" : `${avgPct}%`, icon: "◷", color: avgPct >= 75 ? "var(--accent-green)" : "var(--accent-amber)" },
          { label: "At Risk", value: below75.length, icon: "⚠", color: below75.length > 0 ? "var(--accent-red)" : "var(--accent-green)" },
          { label: "100% Attendance", value: perfect, icon: "✓", color: "var(--accent-green)" },
        ].map((s, i) => (
          <div key={s.label} className={`animate-in-delay-${i + 1}`} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 14
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: `${s.color}22`, border: `1px solid ${s.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color
            }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="animate-in-delay-1" style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input
          className="input-dark"
          placeholder="Search by name, reg no or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 360 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "safe", "at-risk"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
              border: filter === f ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
              background: filter === f ? "var(--accent-blue-dim)" : "transparent",
              color: filter === f ? "var(--accent-blue)" : "var(--text-muted)",
            }}>
              {f === "all" ? "All" : f === "safe" ? "✓ Safe" : "⚠ At Risk"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="animate-in-delay-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading attendance data...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14 }}>{records.length === 0 ? "No attendance data yet." : "No results match your search."}</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const pct = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
                const isLow = r.total > 0 && pct < 75;
                const barColor = r.total === 0
                  ? "var(--border)"
                  : pct < 75 ? "var(--accent-red)"
                  : pct < 85 ? "var(--accent-amber)"
                  : "var(--accent-green)";
                return (
                  <tr key={`${r.regNo}-${r.courseCode}`}>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 13 }}>{r.name}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent-green)" }}>{r.regNo}</span>
                        {r.dept && <span className="badge badge-blue" style={{ fontSize: 10 }}>{r.dept}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{r.course}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {r.attended}/{r.total} classes
                      </div>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--bg-surface)", borderRadius: 3 }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 3,
                            background: barColor, transition: "width 0.5s ease"
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: barColor, minWidth: 36 }}>
                          {r.total > 0 ? `${pct}%` : "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {r.total === 0
                        ? <span className="badge badge-blue">No classes</span>
                        : isLow
                          ? <span className="badge badge-red">⚠ At Risk</span>
                          : pct === 100
                            ? <span className="badge badge-green">Perfect</span>
                            : <span className="badge badge-green">Safe</span>}
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

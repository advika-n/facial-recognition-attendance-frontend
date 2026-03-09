"use client";

import { useData } from "@/app/store/dataStore";

function StatCard({ label, value, icon, color, delay }: any) {
  return (
    <div className={`card-glow animate-in-delay-${delay}`} style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      transition: "transform 0.2s, border-color 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}22`,
          border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>{icon}</div>
        <span className="badge" style={{
          background: `${color}15`, color: color,
          border: `1px solid ${color}25`, fontSize: 11
        }}>Active</span>
      </div>
      <div>
        <div style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { students, professors, classes, enrollments, timetable } = useData();

  const stats = [
    { label: "Total Students", value: students.length || 0, icon: "◎", color: "#3b82f6", delay: 1 },
    { label: "Professors", value: professors.length || 0, icon: "◈", color: "#8b5cf6", delay: 2 },
    { label: "Active Classes", value: classes.length || 0, icon: "⬡", color: "#10b981", delay: 3 },
    { label: "Enrollments", value: enrollments.length || 0, icon: "⊕", color: "#f59e0b", delay: 4 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Welcome back — here's your system overview.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent classes */}
        <div className="animate-in-delay-2" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden"
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Recent Classes
            </h2>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{classes.length} total</span>
          </div>
          {classes.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No classes created yet.<br />
              <span style={{ color: "var(--accent-blue)", fontSize: 12 }}>Go to Classes → Create one</span>
            </div>
          ) : (
            <div>
              {classes.slice(0, 5).map((c: any) => (
                <div key={c.classId} style={{
                  padding: "14px 24px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.courseName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.classId}</div>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{c.courseCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="animate-in-delay-3" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden"
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              System Status
            </h2>
          </div>
          <div style={{ padding: "8px 0" }}>
            {[
              { label: "Timetable entries", value: timetable.length, icon: "⊞", color: "var(--accent-blue)" },
              { label: "Classrooms registered", value: 0, icon: "⬜", color: "var(--accent-purple)" },
              { label: "Active semester", value: "2025–26 Sem 1", icon: "◷", color: "var(--accent-green)" },
            ].map(item => (
              <div key={item.label} style={{
                padding: "14px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: item.color, fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

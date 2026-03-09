"use client";

import { useState } from "react";

const todaysClasses = [
  { classId: "CH202526010001", course: "Data Structures", section: "CSE-A", slot: "A1", room: "301", type: "Theory" },
  { classId: "CH202526010002", course: "DS Lab", section: "CSE-A", slot: "L31", room: "Lab3", type: "Lab" },
  { classId: "CH202526010003", course: "DS Tutorial", section: "CSE-A", slot: "TD1", room: "305", type: "Tutorial" },
];

export default function ProfessorPage() {
  const [activeSession, setActiveSession] = useState<any>(null);

  const startAttendance = (c: any) => {
    setActiveSession({ ...c, startTime: Date.now() });
  };

  const endSession = () => setActiveSession(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Professor Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Dr. Rao · CSE Department</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="badge badge-blue">Professor</span>
          <a href="/login" style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", color: "var(--text-muted)",
            textDecoration: "none", fontSize: 13
          }}>⊗ Sign Out</a>
        </div>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <div className="animate-in" style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 28,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="pulse-active" style={{
              width: 10, height: 10, borderRadius: "50%", background: "var(--accent-green)", flexShrink: 0
            }} />
            <div>
              <div style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 700, color: "var(--accent-green)" }}>
                Attendance Session Active
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {activeSession.course} · {activeSession.classId} · Room {activeSession.room} · Slot {activeSession.slot}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Camera device</div>
              <div style={{ fontSize: 13, color: "var(--accent-green)", fontWeight: 600 }}>● Scanning…</div>
            </div>
            <button className="btn-danger" onClick={endSession} style={{ padding: "8px 16px", fontSize: 13 }}>
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Today's Classes */}
      <div className="animate-in-delay-1">
        <h2 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
          Today's Schedule
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {todaysClasses.map((c) => {
            const isActive = activeSession?.classId === c.classId;
            return (
              <div key={c.classId} style={{
                background: isActive ? "rgba(16,185,129,0.08)" : "var(--bg-card)",
                border: `1px solid ${isActive ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                borderRadius: 14, padding: "18px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: c.type === "Lab" ? "var(--accent-purple-dim)" : c.type === "Tutorial" ? "var(--accent-amber-dim)" : "var(--accent-blue-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                  }}>
                    {c.type === "Lab" ? "⚗" : c.type === "Tutorial" ? "◈" : "▦"}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{c.course}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, display: "flex", gap: 8 }}>
                      <span>{c.section}</span>
                      <span>·</span>
                      <span style={{ fontFamily: "monospace", color: "var(--accent-blue)" }}>{c.slot}</span>
                      <span>·</span>
                      <span>Room {c.room}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={c.type === "Lab" ? "badge badge-purple" : c.type === "Tutorial" ? "badge badge-amber" : "badge badge-blue"}>
                    {c.type}
                  </span>
                  {isActive ? (
                    <span className="badge badge-green">● Active</span>
                  ) : (
                    <button className="btn-success" onClick={() => startAttendance(c)} style={{ padding: "8px 16px", fontSize: 13 }}>
                      Start Attendance
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

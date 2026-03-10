"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/store/dataStore";
import { useRouter } from "next/navigation";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ProfessorPage() {
  const { currentUser } = useData();
  const router = useRouter();
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "professor") {
      router.push("/login");
      return;
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    fetch(`${API}/api/timetable/`)
      .then(r => r.json())
      .then(data => {
        const filtered = data
          .filter((t: any) => t.day === today)
          .map((t: any) => ({
            classId: t.class_id,
            course: t.course_name,
            slot: t.slot,
            room: t.classroom,
            type: t.slot_type,
          }));
        setTodaysClasses(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const startAttendance = (c: any) => setActiveSession({ ...c, startTime: Date.now() });
  const endSession = () => setActiveSession(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Professor Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {currentUser?.name} · {currentUser?.department}
          </p>
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

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : todaysClasses.length === 0 ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 40, textAlign: "center", color: "var(--text-muted)"
          }}>
            No classes scheduled for today.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

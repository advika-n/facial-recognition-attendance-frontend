"use client";

import { useEffect, useState, useRef } from "react";
import { useData } from "@/app/store/dataStore";
import { useRouter } from "next/navigation";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ProfessorPage() {
  const { currentUser } = useData();
  const router = useRouter();
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [liveAttendance, setLiveAttendance] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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
          .filter((t: any) => t.day === today && t.professor_id === currentUser.professor_id)
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

  // Poll live attendance every 5 seconds when session is active
  useEffect(() => {
    if (activeSession?.lectureId) {
      setLiveLoading(true);
      const fetchAttendance = () => {
        fetch(`${API}/api/lecture/${activeSession.lectureId}/attendance/`)
          .then(r => r.json())
          .then(data => {
            setLiveAttendance(data.attendance || []);
            setLiveLoading(false);
          })
          .catch(() => setLiveLoading(false));
      };
      fetchAttendance();
      pollRef.current = setInterval(fetchAttendance, 5000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      setLiveAttendance([]);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeSession]);

  const startAttendance = async (c: any) => {
    setSessionError("");
    try {
      const res = await fetch(`${API}/api/start-lecture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: c.classId, classroom: c.room, duration_minutes: 60 })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSession({ ...c, startTime: Date.now(), lectureId: data.lecture_id });
      } else {
        setSessionError(data.error || "Failed to start session");
      }
    } catch {
      setSessionError("Could not connect to backend");
    }
  };

  const endSession = () => {
    setActiveSession(null);
    setSessionError("");
    setLiveAttendance([]);
  };

  const formatTime = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const sessionDuration = activeSession
    ? Math.floor((Date.now() - activeSession.startTime) / 60000)
    : 0;

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

      {/* Error */}
      {sessionError && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          color: "var(--accent-red)", fontSize: 13
        }}>
          ⚠ {sessionError}
        </div>
      )}

      {/* Active session banner */}
      {activeSession && (
        <div className="animate-in" style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 24,
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
                {activeSession.course} · Room {activeSession.room} · Slot {activeSession.slot} · {sessionDuration}m elapsed
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Present</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-green)", fontFamily: "Syne" }}>{liveAttendance.length}</div>
            </div>
            <button className="btn-danger" onClick={endSession} style={{ padding: "8px 16px", fontSize: 13 }}>
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Live attendance table */}
      {activeSession && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden", marginBottom: 28
        }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Live Attendance
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-ring 2s infinite" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Auto-refreshing every 5s</span>
            </div>
          </div>

          {liveLoading && liveAttendance.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
          ) : liveAttendance.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              No students marked yet. Waiting for face recognition...
            </div>
          ) : (
            <table className="dark-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Reg No</th><th>Department</th><th>Time Marked</th></tr>
              </thead>
              <tbody>
                {liveAttendance.map((a: any, i: number) => (
                  <tr key={a.registration_number}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{a.name}</td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-green)" }}>{a.registration_number}</span></td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{a.department || "—"}</span></td>
                    <td style={{ color: "var(--accent-amber)", fontFamily: "monospace", fontSize: 12 }}>{formatTime(a.time_marked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Today's schedule */}
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    router.push(`/${role}`);
  };

  const roles = [
    { value: "admin", label: "Administrator", icon: "⬡", desc: "Full system control" },
    { value: "professor", label: "Professor", icon: "◈", desc: "Manage attendance" },
    { value: "student", label: "Student", icon: "◎", desc: "View your records" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "10%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ width: 420, animation: "fadeIn 0.5s ease both" }} className="animate-in">
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            marginBottom: 16, fontSize: 24
          }}>◈</div>
          <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Attendance Manager
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "32px 32px",
          backdropFilter: "blur(12px)",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>
            Select Role
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: role === r.value
                    ? "1px solid var(--accent-blue)"
                    : "1px solid var(--border)",
                  background: role === r.value
                    ? "var(--accent-blue-dim)"
                    : "var(--bg-surface)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 22, color: role === r.value ? "var(--accent-blue)" : "var(--text-muted)" }}>
                  {r.icon}
                </span>
                <span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: role === r.value ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{r.desc}</div>
                </span>
              </button>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 600, borderRadius: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 20 }}>
          Attendance Manager v1.0 · Demo Mode
        </p>
      </div>
    </div>
  );
}

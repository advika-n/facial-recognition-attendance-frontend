"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useData();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!userId || !password) { setError("Please enter your ID and password"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      setCurrentUser(data);
      router.push(`/${data.role}`);
    } catch {
      setError("Could not connect to server");
      setLoading(false);
    }
  };

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
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Student Reg No / Professor ID
              </label>
              <input
                className="input-dark"
                style={{ width: "100%", boxSizing: "border-box" }}
                placeholder="e.g. 21BCE1234 or P101"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                className="input-dark"
                style={{ width: "100%", boxSizing: "border-box" }}
                type="password"
                placeholder="Your default password is your ID"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              fontSize: 13, color: "var(--accent-red)"
            }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 600, borderRadius: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16, textAlign: "center" }}>
            Default password is your registration number / professor ID
          </p>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 20 }}>
          Attendance Manager v1.0
        </p>
      </div>
    </div>
  );
}

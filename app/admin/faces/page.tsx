"use client";

import { useState, useEffect, useRef } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function FacesPage() {
  const { students, setStudents } = useData();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [status, setStatus] = useState<"idle" | "capturing" | "processing" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load students if not already loaded
  useEffect(() => {
    if (students.length === 0) {
      fetch(`${API}/api/students/`)
        .then(r => r.json())
        .then(data => setStudents(data.map((s: any) => ({
          id: s.id, regNo: s.registration_number, name: s.name, dept: s.department || ""
        }))));
    }
  }, []);

  // Start webcam
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus("capturing");
    } catch (err) {
      setCameraError("Could not access camera. Please allow camera permissions and try again.");
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setStatusMessage("");
  };

  // Capture snapshot and send to backend
  const captureAndRegister = async () => {
    if (!selectedStudentId) {
      setStatusMessage("Please select a student first.");
      setStatus("error");
      return;
    }
    if (!videoRef.current || !canvasRef.current) return;

    // Draw current frame to canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Convert to base64 JPEG
    const imageB64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];

    setStatus("processing");
    setStatusMessage("Processing face...");

    try {
      const res = await fetch(`${API}/api/register-face/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: parseInt(selectedStudentId),
          image: imageB64
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusMessage(data.message || "Face registered successfully.");
        setRegisteredIds(prev => new Set([...prev, parseInt(selectedStudentId)]));
        stopCamera();
        setSelectedStudentId("");
      } else {
        setStatus("error");
        setStatusMessage(data.error || "Failed to register face.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Could not connect to backend. Please try again.");
    }
  };

  const selectedStudent = students.find((s: any) => s.id === parseInt(selectedStudentId));

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Face Registration
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          Register student faces for attendance recognition
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Left — Camera */}
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden"
        }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ● Live Camera Feed
            </span>
          </div>

          {/* Video area */}
          <div style={{
            aspectRatio: "4/3", background: "#050810", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: status === "capturing" || status === "processing" ? "block" : "none"
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Placeholder when camera is off */}
            {status === "idle" && (
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📷</div>
                <div style={{ fontSize: 13 }}>Camera is off</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>Select a student and click Start Camera</div>
              </div>
            )}

            {/* Processing overlay */}
            {status === "processing" && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(8,13,20,0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12
              }}>
                <div style={{ fontSize: 32 }}>⟳</div>
                <div style={{ fontSize: 13, color: "var(--text-primary)" }}>Processing face...</div>
              </div>
            )}

            {/* Corner brackets when camera active */}
            {(status === "capturing" || status === "processing") && (
              <>
                {[["tl", "2px 0 0 2px", "12px 12px auto auto"], ["tr", "2px 2px 0 0", "12px auto auto 12px"], ["bl", "0 0 2px 2px", "auto 12px 12px auto"], ["br", "0 2px 2px 0", "auto auto 12px 12px"]].map(([key, borderW, pos]) => (
                  <div key={key} style={{
                    position: "absolute",
                    width: 24, height: 24,
                    borderColor: "var(--accent-blue)",
                    borderStyle: "solid",
                    borderWidth: borderW,
                    opacity: 0.6,
                    top: pos.split(" ")[0] === "auto" ? "auto" : pos.split(" ")[0],
                    right: pos.split(" ")[1] === "auto" ? "auto" : pos.split(" ")[1],
                    bottom: pos.split(" ")[2] === "auto" ? "auto" : pos.split(" ")[2],
                    left: pos.split(" ")[3] === "auto" ? "auto" : pos.split(" ")[3],
                  }} />
                ))}
              </>
            )}
          </div>

          {/* Camera error */}
          {cameraError && (
            <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.1)", borderTop: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--accent-red)" }}>
              ⚠ {cameraError}
            </div>
          )}

          {/* Camera controls */}
          <div style={{ padding: 16, display: "flex", gap: 10 }}>
            {status === "idle" ? (
              <button className="btn-primary" style={{ flex: 1 }} onClick={startCamera}>
                Start Camera
              </button>
            ) : (
              <>
                <button
                  className="btn-success"
                  style={{ flex: 1, opacity: status === "processing" ? 0.6 : 1 }}
                  onClick={captureAndRegister}
                  disabled={status === "processing"}
                >
                  {status === "processing" ? "Processing..." : "📸 Capture & Register"}
                </button>
                <button
                  style={{
                    padding: "9px 14px", background: "transparent",
                    border: "1px solid var(--border)", borderRadius: 8,
                    color: "var(--text-muted)", cursor: "pointer", fontSize: 13
                  }}
                  onClick={stopCamera}
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — Student selection + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Student selector */}
          <div className="animate-in-delay-1" style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: 24
          }}>
            <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>
              Select Student
            </h3>

            {students.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--accent-amber)" }}>
                ⚠ No students found. Add students first.
              </div>
            ) : (
              <select
                className="input-dark"
                value={selectedStudentId}
                onChange={e => {
                  setSelectedStudentId(e.target.value);
                  setStatus("idle");
                  setStatusMessage("");
                  stopCamera();
                }}
              >
                <option value="">Select a student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.regNo} — {s.name} {registeredIds.has(s.id) ? "✓" : ""}
                  </option>
                ))}
              </select>
            )}

            {selectedStudent && (
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: "var(--bg-surface)", borderRadius: 10,
                display: "flex", flexDirection: "column", gap: 6
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: 12, color: "var(--accent-green)", fontFamily: "monospace" }}>{selectedStudent.regNo}</div>
                {selectedStudent.dept && (
                  <span className="badge badge-blue" style={{ fontSize: 11, alignSelf: "flex-start" }}>{selectedStudent.dept}</span>
                )}
                {registeredIds.has(selectedStudent.id) && (
                  <span className="badge badge-green" style={{ fontSize: 11, alignSelf: "flex-start" }}>✓ Face Registered</span>
                )}
              </div>
            )}
          </div>

          {/* Status card */}
          {statusMessage && (
            <div className="animate-in" style={{
              background: status === "success" ? "rgba(16,185,129,0.08)" : status === "error" ? "rgba(239,68,68,0.08)" : "var(--bg-card)",
              border: `1px solid ${status === "success" ? "rgba(16,185,129,0.3)" : status === "error" ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
              borderRadius: 16, padding: 20
            }}>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: status === "success" ? "var(--accent-green)" : status === "error" ? "var(--accent-red)" : "var(--text-primary)"
              }}>
                {status === "success" ? "✓ Success" : status === "error" ? "✗ Failed" : "Processing"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
                {statusMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="animate-in-delay-2" style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 16, padding: 20
          }}>
            <h3 style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 14px" }}>
              Instructions
            </h3>
            {[
              ["1", "Select the student from the dropdown"],
              ["2", "Click Start Camera to open webcam"],
              ["3", "Ask the student to look straight at the camera"],
              ["4", "Ensure good lighting and only one face visible"],
              ["5", "Click Capture & Register"],
            ].map(([num, text]) => (
              <div key={num} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "var(--accent-blue-dim)", border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "var(--accent-blue)"
                }}>{num}</div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", paddingTop: 2 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

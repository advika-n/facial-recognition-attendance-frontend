"use client";

import { useState, useEffect, useRef } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

const SHOTS = [
  { label: "straight", instruction: "Look straight at the camera", emoji: "😐" },
  { label: "left",     instruction: "Turn your head slightly LEFT",  emoji: "👈" },
  { label: "right",    instruction: "Turn your head slightly RIGHT", emoji: "👉" },
];

export default function FacesPage() {
  const { students, setStudents } = useData();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [shotIndex, setShotIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "capturing" | "processing" | "done" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
  const [completedShots, setCompletedShots] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (students.length === 0) {
      fetch(`${API}/api/students/`)
        .then(r => r.json())
        .then(data => setStudents(data.map((s: any) => ({
          id: s.id, regNo: s.registration_number, name: s.name, dept: s.department || ""
        }))));
    }
  }, []);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShotIndex(0);
      setCompletedShots([]);
      setStatus("capturing");
      setStatusMessage("");
    } catch {
      setCameraError("Could not access camera. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setStatusMessage("");
    setShotIndex(0);
    setCompletedShots([]);
  };

  const captureShot = async () => {
    if (!selectedStudentId) {
      setStatusMessage("Please select a student first.");
      setStatus("error");
      return;
    }
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const imageB64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
    const currentShot = SHOTS[shotIndex];

    setStatus("processing");
    setStatusMessage(`Processing photo ${shotIndex + 1} of ${SHOTS.length}...`);

    try {
      const res = await fetch(`${API}/api/register-face/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: parseInt(selectedStudentId),
          image: imageB64,
          label: currentShot.label
        })
      });

      const data = await res.json();

      if (res.ok) {
        const newCompleted = [...completedShots, currentShot.label];
        setCompletedShots(newCompleted);

        if (shotIndex + 1 < SHOTS.length) {
          // More shots remaining
          setShotIndex(shotIndex + 1);
          setStatus("capturing");
          setStatusMessage(`✓ Photo ${shotIndex + 1} saved! Now take photo ${shotIndex + 2}.`);
        } else {
          // All 3 done
          setStatus("done");
          setStatusMessage(
            `All ${SHOTS.length} photos registered for ${data.student}. Recognition will be much more accurate now.`
          );
          setRegisteredIds(prev => new Set([...prev, parseInt(selectedStudentId)]));
          stopCamera();
          setSelectedStudentId("");
        }
      } else {
        // Let them retry the same shot
        setStatus("capturing");
        setStatusMessage(`⚠ ${data.error || "Failed to process photo. Try again."}`);
      }
    } catch {
      setStatus("capturing");
      setStatusMessage("Could not connect to backend. Please try again.");
    }
  };

  const selectedStudent = students.find((s: any) => s.id === parseInt(selectedStudentId));
  const currentShot = SHOTS[shotIndex];

  return (
    <div>

      {/* Header */}
      <div className="animate-in" style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "Syne", fontSize: 26, fontWeight: 700,
          color: "var(--text-primary)", margin: 0
        }}>
          Face Registration
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
          3 photos per student — straight, left, right — for accurate recognition
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Left — Camera panel */}
        <div className="animate-in" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden"
        }}>

          {/* Camera panel header with progress dots */}
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{
              fontSize: 11, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.1em"
            }}>
              ● Live Camera Feed
            </span>

            {/* Three dots showing shot progress */}
            {status !== "idle" && status !== "done" && (
              <div style={{ display: "flex", gap: 6 }}>
                {SHOTS.map((s, i) => (
                  <div key={s.label} style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: completedShots.includes(s.label)
                      ? "var(--accent-green)"      // completed = green
                      : i === shotIndex
                        ? "var(--accent-blue)"     // current = blue
                        : "var(--border)"          // upcoming = grey
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Video area */}
          <div style={{
            aspectRatio: "4/3",
            background: "#050810",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
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
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                  Select a student and click Start Camera
                </div>
              </div>
            )}

            {/* All done screen */}
            {status === "done" && (
              <div style={{ textAlign: "center", color: "var(--accent-green)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>All 3 photos registered!</div>
              </div>
            )}

            {/* Instruction overlay — which angle to pose */}
            {status === "capturing" && (
              <div style={{
                position: "absolute", bottom: 12, left: 12, right: 12,
                background: "rgba(8,13,20,0.8)",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{ fontSize: 24 }}>{currentShot.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Photo {shotIndex + 1} of {SHOTS.length}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                    {currentShot.instruction}
                  </div>
                </div>
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
                <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                  {statusMessage}
                </div>
              </div>
            )}

            {/* Corner brackets when camera is active */}
            {(status === "capturing" || status === "processing") && (
              <>
                {[
                  ["tl", "2px 0 0 2px", "12px 12px auto auto"],
                  ["tr", "2px 2px 0 0", "12px auto auto 12px"],
                  ["bl", "0 0 2px 2px", "auto 12px 12px auto"],
                  ["br", "0 2px 2px 0", "auto auto 12px 12px"],
                ].map(([key, borderW, pos]) => (
                  <div key={key} style={{
                    position: "absolute",
                    width: 24, height: 24,
                    borderColor: "var(--accent-blue)",
                    borderStyle: "solid",
                    borderWidth: borderW,
                    opacity: 0.6,
                    top:    pos.split(" ")[0] === "auto" ? "auto" : pos.split(" ")[0],
                    right:  pos.split(" ")[1] === "auto" ? "auto" : pos.split(" ")[1],
                    bottom: pos.split(" ")[2] === "auto" ? "auto" : pos.split(" ")[2],
                    left:   pos.split(" ")[3] === "auto" ? "auto" : pos.split(" ")[3],
                  }} />
                ))}
              </>
            )}
          </div>

          {/* Camera error */}
          {cameraError && (
            <div style={{
              padding: "10px 16px",
              background: "rgba(239,68,68,0.1)",
              borderTop: "1px solid rgba(239,68,68,0.2)",
              fontSize: 13, color: "var(--accent-red)"
            }}>
              ⚠ {cameraError}
            </div>
          )}

          {/* Camera controls */}
          <div style={{ padding: 16, display: "flex", gap: 10 }}>
            {status === "idle" || status === "done" ? (
              <button className="btn-primary" style={{ flex: 1 }} onClick={startCamera}>
                {status === "done" ? "Register Another Student" : "Start Camera"}
              </button>
            ) : (
              <>
                <button
                  className="btn-success"
                  style={{ flex: 1, opacity: status === "processing" ? 0.6 : 1 }}
                  onClick={captureShot}
                  disabled={status === "processing"}
                >
                  {status === "processing" ? "Processing..." : `📸 Capture Photo ${shotIndex + 1}`}
                </button>
                <button
                  style={{
                    padding: "9px 14px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 13
                  }}
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — Student selection + status + instructions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Student selector */}
          <div className="animate-in-delay-1" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24
          }}>
            <h3 style={{
              fontFamily: "Syne", fontSize: 14, fontWeight: 600,
              color: "var(--text-primary)", margin: "0 0 16px"
            }}>
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
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                  {selectedStudent.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--accent-green)", fontFamily: "monospace" }}>
                  {selectedStudent.regNo}
                </div>
                {selectedStudent.dept && (
                  <span className="badge badge-blue" style={{ fontSize: 11, alignSelf: "flex-start" }}>
                    {selectedStudent.dept}
                  </span>
                )}
                {registeredIds.has(selectedStudent.id) && (
                  <span className="badge badge-green" style={{ fontSize: 11, alignSelf: "flex-start" }}>
                    ✓ Face Registered (3 photos)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Status card */}
          {statusMessage && status !== "processing" && (
            <div className="animate-in" style={{
              background: status === "done"
                ? "rgba(16,185,129,0.08)"
                : status === "error"
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(59,130,246,0.08)",
              border: `1px solid ${
                status === "done"
                  ? "rgba(16,185,129,0.3)"
                  : status === "error"
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(59,130,246,0.3)"
              }`,
              borderRadius: 16,
              padding: 20
            }}>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: status === "done"
                  ? "var(--accent-green)"
                  : status === "error"
                    ? "var(--accent-red)"
                    : "var(--accent-blue)"
              }}>
                {status === "done"
                  ? "✓ Registration Complete"
                  : status === "error"
                    ? "✗ Error"
                    : "ℹ Info"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
                {statusMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="animate-in-delay-2" style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20
          }}>
            <h3 style={{
              fontFamily: "Syne", fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)", margin: "0 0 14px"
            }}>
              Instructions
            </h3>
            {[
              ["1", "Select the student from the dropdown"],
              ["2", "Click Start Camera"],
              ["3", "Photo 1 — look straight at the camera 😐"],
              ["4", "Photo 2 — turn head slightly left 👈"],
              ["5", "Photo 3 — turn head slightly right 👉"],
              ["6", "Good lighting, only one face visible"],
            ].map(([num, text]) => (
              <div key={num} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "var(--accent-blue-dim)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "var(--accent-blue)"
                }}>
                  {num}
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", paddingTop: 2 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

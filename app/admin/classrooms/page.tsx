"use client";

import { useState, useEffect } from "react";
import { useData } from "@/app/store/dataStore";

const API = "https://facial-recognition-attendance-backend-production.up.railway.app";

export default function ClassroomsPage() {
  const { classrooms, setClassrooms } = useData();
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("Lecture");
  const [cameraId, setCameraId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/classrooms/`)
      .then(r => r.json())
      .then(data => {
        setClassrooms(data.map((r: any) => ({ id: r.id, roomName: r.room_name, roomType: r.room_type, cameraId: r.camera_id })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addRoom = () => {
    if (!roomName) { alert("Enter room name"); return; }
    if (classrooms.find((r: any) => r.roomName === roomName)) { alert("Room already exists"); return; }
    fetch(`${API}/api/classrooms/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_name: roomName, room_type: roomType, camera_id: cameraId })
    })
      .then(r => r.json())
      .then(data => {
        setClassrooms([...classrooms, { id: data.id, roomName, roomType, cameraId }]);
        setRoomName(""); setRoomType("Lecture"); setCameraId("");
        setShowForm(false);
      })
      .catch(() => alert("Failed to add classroom"));
  };

  const deleteRoom = (id: number) => {
    fetch(`${API}/api/classrooms/${id}/`, { method: "DELETE" })
      .then(() => setClassrooms(classrooms.filter((r: any) => r.id !== id)))
      .catch(() => alert("Failed to delete classroom"));
  };

  return (
    <div>
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Classrooms</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>{classrooms.length} room{classrooms.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Room"}
        </button>
      </div>

      {showForm && (
        <div className="animate-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-bright)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>New Classroom</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
            <input className="input-dark" placeholder="Room name (e.g. 301 or Lab3)" value={roomName} onChange={e => setRoomName(e.target.value)} />
            <select className="input-dark" value={roomType} onChange={e => setRoomType(e.target.value)}>
              <option>Lecture</option>
              <option>Lab</option>
            </select>
            <input className="input-dark" placeholder="Camera ID (e.g. CAM301)" value={cameraId} onChange={e => setCameraId(e.target.value)} />
            <button className="btn-primary" onClick={addRoom}>Add Room</button>
          </div>
        </div>
      )}

      <div className="animate-in-delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : classrooms.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⬜</div>
            <div style={{ fontSize: 14 }}>No classrooms registered yet.</div>
          </div>
        ) : (
          <table className="dark-table">
            <thead>
              <tr><th>#</th><th>Room</th><th>Camera ID</th><th>Type</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {classrooms.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{r.id}</td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15 }}>{r.roomName}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-blue)" }}>{r.cameraId || "—"}</td>
                  <td>
                    <span className={r.roomType === "Lab" ? "badge badge-purple" : "badge badge-green"}>
                      {r.roomType}
                    </span>
                  </td>
                  <td><button className="btn-danger" onClick={() => deleteRoom(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
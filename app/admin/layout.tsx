"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DataProvider } from "../store/dataStore";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/professors", label: "Professors", icon: "◈" },
  { href: "/admin/classes", label: "Classes", icon: "⬡" },
  { href: "/admin/students", label: "Students", icon: "◎" },
  { href: "/admin/enrollment", label: "Enrollment", icon: "⊕" },
  { href: "/admin/classrooms", label: "Classrooms", icon: "⬜" },
  { href: "/admin/timetable", label: "Timetable", icon: "⊞" },
  { href: "/admin/reports", label: "Reports", icon: "▤" },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{
      width: "var(--sidebar-width)",
      minHeight: "100vh",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0
          }}>◈</div>
          <div>
            <div style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Attendance
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Manager</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <div className="badge badge-blue" style={{ fontSize: 11 }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-blue-dim)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent-blue)" : "2px solid transparent",
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <Link href="/login" style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--text-muted)", fontSize: 13, textDecoration: "none",
          padding: "8px 0",
        }}>
          <span style={{ fontSize: 16 }}>⊗</span> Sign Out
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </DataProvider>
  );
}

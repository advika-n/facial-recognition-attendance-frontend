import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/app/store/dataStore";

export const metadata: Metadata = {
  title: "Attendance Manager",
  description: "Smart Attendance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
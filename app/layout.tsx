/* layout.tsx is a required structural file containing the root layout for the entire app using App Router,; will include side bar and navi bar later */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import FloatingNavTrigger from "@/components/FloatingNavTrigger";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "CPARL Payroll",
    template: "%s | Payroll | CPARL", // Page titles become "Page Title | CPARL" such as Users | CPARL
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />

        {/* --- Main Page Content --- */}
        {/* Padding-top ensures content isn't hidden under the fixed navbar */}
        <main style={{ paddingTop: "70px" }}>{children}</main>
        {/* This component handles its own visibility based on scroll 
        <FloatingNavTrigger />*/}
      </body>
    </html>
  );
}
// Simple inline styles for demonstration
const navStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center", // Keeps items vertically centered
  padding: "1rem 2rem",
  background: "#333",
  color: "#fff",
  /*if want to stick the navbar to the top
  position: "sticky",
  top: 0,
  zIndex: 100,
  */
};

const logoStyles: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.5rem",
};

const searchContainerStyles: React.CSSProperties = {
  flex: 1, // Makes the search container grow to fill space
  margin: "0 40px", // Adds breathing room between Logo and Links
  maxWidth: "400px", // Prevents the search bar from getting too wide
};

const inputStyles: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "4px",
  border: "none",
  outline: "none",
};

const listStyles: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  listStyle: "none",
};

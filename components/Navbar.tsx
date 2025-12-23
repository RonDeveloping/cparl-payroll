"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // If scrolling down, hide it. If scrolling up, show it.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <nav
      style={{
        ...navStyles,
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div style={logoStyles}>BrandLogo</div>
      <ul style={listStyles}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
}

// Styles
const navStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 2rem",
  background: "#333",
  color: "#fff",
  zIndex: 1000,
};

const logoStyles: React.CSSProperties = { fontWeight: "bold" };
const listStyles: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  listStyle: "none",
};

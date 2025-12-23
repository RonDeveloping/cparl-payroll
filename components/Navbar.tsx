"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

//The Navbar component itself is a client component that handles its own visibility state based on scroll position; this bar is a "Smart Header," which stays out of the way while the user is reading (scrolling down) but slides back in instantly the moment they start scrolling up.
export default function Navbar() {
  const [isVisible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // If scrolling down, hide it. If scrolling up, show it.
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-16 bg-zinc-900 text-white flex items-center justify-between px-8 z-50 transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="text-xl font-bold">BrandLogo</div>
      {/* Search Field */}
      <div className="flex-1 max-w-md mx-10">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <ul className="flex gap-6">
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

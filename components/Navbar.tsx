"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
//Icons library perfectly Tailwind CSS per Gemini
import { LayoutDashboard, Settings, Home, Search } from "lucide-react";

//The Navbar component itself is a client component that handles its own visibility state based on scroll position; this bar is a "Smart Header," which stays out of the way while the user is reading (scrolling down) but slides back in instantly the moment they start scrolling up.
export default function Navbar() {
  const lastScrollY = useRef(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // HIDE: If scrolling down past 70px
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        setIsScrolledDown(true);
      }
      // If scrolling up near top, reset
      else if (currentScrollY < 1) {
        setIsScrolledDown(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, []);

  // Determine final visibility
  const shouldShow = !isScrolledDown || isHovered;

  return (
    <div
      //wrapper ensures coverage by the hover state
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- THE INDICATOR LINE/ TRIGGER ZONE (visible upon nav's hidden) --- */}
      <div
        className={`fixed top-0 left-0 w-full z-[60] transition-opacity duration-300 ${
          shouldShow ? "opacity-0" : "opacity-100 bg-black"
        }`}
        style={{ height: "6px" }} // Slightly thicker for easier hovering
      />

      {/* --- THE NAVIGATION BAR --- */}
      <nav
        className={`fixed top-0 left-0 w-full h-16 bg-zinc-900 text-white flex items-center justify-between px-6 z-50 transition-transform duration-500 ease-in-out ${
          shouldShow ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link
          href="/"
          className="font-bold text-xl hover:text-blue-400 transition-colors"
        >
          BrandLogo
        </Link>

        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            title="Home"
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <Home />
          </Link>
          <Link
            href="/dashboard"
            title="Dashboard"
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <LayoutDashboard />
          </Link>
          <Link
            href="/settings"
            title="Settings"
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <Settings />
          </Link>
        </div>
      </nav>
    </div>
  );
}

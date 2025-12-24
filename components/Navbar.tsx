"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

//Icons library perfectly Tailwind CSS per Gemini
import {
  LayoutDashboard,
  Settings,
  Home,
  Search,
  Plus,
  HelpCircle,
  UserCircle,
} from "lucide-react";

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
      {/* ---INDICATOR LINE/TRIGGER ZONE (visible upon nav's hidden) starting with a blue on the left with transitions through a layered mix in the middle and ending in a green on the right  --- */}
      <div
        className={`fixed top-0 left-0 w-full z-[60] transition-opacity duration-300 ${
          shouldShow ? "opacity-0" : "opacity-100"
        } bg-gradient-to-r from-blue-200 via-emerald-100 to-green-200`}
        style={{ height: "6px" }} // Slightly thicker for easier hovering
      />

      {/* --- THE NAVIGATION BAR (Off-White & Green)--- */}
      <nav
        className={`fixed top-0 left-0 w-full h-16bg-stone-50 border-b border-stone-200 text-stone-800 flex items-center justify-between px-6 z-50 transition-transform duration-500 ease-in-out ${
          shouldShow ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/logo.png"
            alt="CPAL"
            width={38}
            height={38}
            priority
          />
          <span className="font-bold text-xl text-emerald-700 hidden sm:block">
            CPARL
          </span>
        </Link>

        {/* Search Field */}
        <div className="flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>

        {/* Icon Navigation (Green) */}
        <div className="flex items-center gap-2 sm:gap-4 text-emerald-600">
          {/* NEW: Add Icon with a subtle border to make it pop */}
          <Link
            href="/create"
            title="Add New"
            className="p-2 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
          >
            <Plus className="w-6 h-6" />
          </Link>
          <Link
            href="/"
            title="Home"
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link
            href="/dashboard"
            title="Dashboard"
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <LayoutDashboard className="w-6 h-6" />
          </Link>
          <Link
            href="/settings"
            title="Settings"
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6" />
          </Link>
          {/* NEW: Help Button */}
          <Link
            href="/help"
            title="Help & Support"
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          {/* NEW: User Profile Icon */}
          <Link
            href="/contacts"
            title="Your Profile"
            className="ml-1 p-1 hover:text-emerald-800 transition-colors border-l border-stone-200 pl-3"
          >
            <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
          </Link>
        </div>
      </nav>
    </div>
  );
}

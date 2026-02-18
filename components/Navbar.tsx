"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/lib/actions/auth-actions";
import {
  LayoutDashboard,
  Settings,
  Home,
  Search,
  Plus,
  HelpCircle,
  UserCircle,
  LogOut,
} from "lucide-react";

type NavbarUser = {
  email: string;
  givenName?: string | null;
  familyName?: string | null;
  displayName?: string | null;
  nickName?: string | null;
};

//The Navbar component itself is a client component that handles its own visibility state based on scroll position; this bar is a "Smart Header," which stays out of the way while the user is reading (scrolling down) but slides back in instantly the moment they start scrolling up.
export default function Navbar({ user }: { user: NavbarUser | null }) {
  const lastScrollY = useRef(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

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

  const givenName = user?.givenName?.trim() || "";
  const familyName = user?.familyName?.trim() || "";
  const fallbackName =
    user?.displayName?.trim() || user?.nickName?.trim() || "";
  const profileName = givenName || fallbackName || "Account";
  const fullName = [givenName || fallbackName, familyName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const avatarInitial = (
    profileName[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();

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
        className={`fixed top-0 left-0 w-full h-16 bg-stone-50 border-b border-stone-200 text-stone-800 flex items-center justify-between px-6 z-50 transition-transform duration-500 ease-in-out ${
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
          {/* Profile Menu */}
          {user ? (
            <div
              className="relative ml-1 pl-3 pt-2 border-l border-stone-200"
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  window.clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
                setIsMenuOpen(true);
              }}
              onMouseLeave={() => {
                if (closeTimeoutRef.current) {
                  window.clearTimeout(closeTimeoutRef.current);
                }
                closeTimeoutRef.current = window.setTimeout(() => {
                  setIsMenuOpen(false);
                }, 300);
              }}
            >
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                title="User icon"
                className="flex items-center rounded-full border border-emerald-100 bg-white p-1 hover:bg-emerald-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-semibold">
                  {avatarInitial}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full w-auto min-w-[200px] max-w-[260px] rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {fullName || profileName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="border-t border-stone-100">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              title="Sign in"
              className="ml-1 pl-3 border-l border-stone-200 p-1 rounded-full hover:bg-emerald-50 text-emerald-700 transition-colors"
            >
              <UserCircle className="h-7 w-7 sm:h-8 sm:w-8 stroke-[1.5]" />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

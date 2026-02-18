"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import { navbarStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";
import { broadcastLogout } from "@/lib/logout-sync";
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
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const settingsCloseTimeoutRef = useRef<number | null>(null);

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
    return () => {
      window.removeEventListener("scroll", controlNavbar);
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (settingsCloseTimeoutRef.current) {
        window.clearTimeout(settingsCloseTimeoutRef.current);
      }
    };
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
  const isPayrollDashboard = pathname?.startsWith("/payroll");
  const createHref = isPayrollDashboard
    ? "/employees/new"
    : "/tenants/new/edit";
  const createTitle = isPayrollDashboard ? "Create Employee" : "Create Tenant";
  const isAuthenticated = Boolean(user);
  const iconLinkClass = cn(
    navbarStyles.iconLink,
    !isAuthenticated && navbarStyles.iconLinkDisabled,
  );
  const iconLinkPrimaryClass = cn(
    navbarStyles.iconLinkPrimary,
    !isAuthenticated && navbarStyles.iconLinkPrimaryDisabled,
  );
  const settingsButtonClass = cn(
    navbarStyles.settingsMenuButton,
    !isAuthenticated && navbarStyles.settingsMenuButtonDisabled,
  );

  // Determine final visibility
  const shouldShow = !isScrolledDown || isHovered;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          navbarStyles.scrollIndicator,
          shouldShow
            ? navbarStyles.scrollIndicatorHidden
            : navbarStyles.scrollIndicatorVisible,
        )}
        style={{ height: "6px" }}
      />

      <nav
        className={cn(
          navbarStyles.nav,
          shouldShow ? navbarStyles.navVisible : navbarStyles.navHidden,
        )}
      >
        {/* Logo Section */}
        <Link href="/" className={navbarStyles.logoLink}>
          <Image
            className={navbarStyles.logoImage}
            src="/logo.png"
            alt="CPAL"
            width={38}
            height={38}
            priority
          />
          <span className={navbarStyles.logoText}>CPARL</span>
        </Link>

        {/* Search Field */}
        <div className={navbarStyles.searchContainer}>
          <Search className={navbarStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={navbarStyles.searchInput}
          />
        </div>

        {/* Icon Navigation (Green) */}
        <div className={navbarStyles.iconNavigation}>
          {/* Create action icon */}
          <Link
            href={createHref}
            title={createTitle}
            className={iconLinkPrimaryClass}
          >
            <Plus className="w-6 h-6" />
          </Link>
          <Link
            href={user ? "/tenants" : "/auth/login"}
            title="Home"
            className={iconLinkClass}
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link href="/dashboard" title="Dashboard" className={iconLinkClass}>
            <LayoutDashboard className="w-6 h-6" />
          </Link>
          <div
            className={navbarStyles.settingsMenuContainer}
            onMouseEnter={() => {
              if (!isAuthenticated) return;
              if (settingsCloseTimeoutRef.current) {
                window.clearTimeout(settingsCloseTimeoutRef.current);
                settingsCloseTimeoutRef.current = null;
              }
              setIsSettingsOpen(true);
            }}
            onMouseLeave={() => {
              if (!isAuthenticated) return;
              if (settingsCloseTimeoutRef.current) {
                window.clearTimeout(settingsCloseTimeoutRef.current);
              }
              settingsCloseTimeoutRef.current = window.setTimeout(() => {
                setIsSettingsOpen(false);
              }, 200);
            }}
          >
            <button
              type="button"
              title="Settings"
              className={settingsButtonClass}
              onClick={() => setIsSettingsOpen((open) => !open)}
              aria-expanded={isSettingsOpen}
            >
              <Settings className="w-6 h-6" />
            </button>

            {isSettingsOpen && (
              <div className={navbarStyles.settingsMenuDropdown}>
                <Link
                  href="/settings/chart-of-accounts"
                  className={navbarStyles.settingsMenuItem}
                >
                  Chart of accounts
                </Link>
                <Link
                  href="/settings/recurring-transactions"
                  className={navbarStyles.settingsMenuItem}
                >
                  Recurring transactions
                </Link>
                <div className={navbarStyles.settingsMenuDivider} />
                <Link
                  href="/settings/import-data"
                  className={navbarStyles.settingsMenuItem}
                >
                  Import data
                </Link>
                <Link
                  href="/settings/export-data"
                  className={navbarStyles.settingsMenuItem}
                >
                  Export data
                </Link>
                <Link
                  href="/settings/audit-log"
                  className={navbarStyles.settingsMenuItem}
                >
                  Audit log
                </Link>
                <div className={navbarStyles.settingsMenuDivider} />
                <Link
                  href="/settings/share-screen"
                  className={navbarStyles.settingsMenuItem}
                >
                  Share screen
                </Link>
                <Link
                  href="/settings/your-team"
                  className={navbarStyles.settingsMenuItem}
                >
                  Your team
                </Link>
              </div>
            )}
          </div>
          {/* NEW: Help Button */}
          <Link href="/help" title="Help & Support" className={iconLinkClass}>
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          {/* Profile Menu */}
          {user ? (
            <div
              className={navbarStyles.profileMenuContainer}
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
                className={navbarStyles.profileButton}
              >
                <span className={navbarStyles.profileAvatar}>
                  {avatarInitial}
                </span>
              </button>

              {isMenuOpen && (
                <div className={navbarStyles.profileMenuDropdown}>
                  <div className={navbarStyles.profileMenuHeader}>
                    <p className={navbarStyles.profileMenuName}>
                      {fullName || profileName}
                    </p>
                    <p className={navbarStyles.profileMenuEmail}>
                      {user.email}
                    </p>
                  </div>
                  <div className={navbarStyles.profileMenuFooter}>
                    <form
                      action={logoutAction}
                      onSubmit={() => broadcastLogout()}
                    >
                      <button
                        type="submit"
                        className={navbarStyles.logoutButton}
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
              className={navbarStyles.loginLink}
            >
              <UserCircle className={navbarStyles.loginIcon} />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

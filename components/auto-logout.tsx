"use client";
// components/auto-logout.tsx

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { broadcastLogout } from "@/lib/logout-sync";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const COUNTDOWN_WINDOW_MS = 60 * 1000;

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);
  const [remainingMs, setRemainingMs] = useState(INACTIVITY_TIMEOUT_MS);

  useEffect(() => {
    if (pathname?.startsWith("/auth")) {
      return;
    }

    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };

    const clearIntervalTimer = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };

    const performLogout = async () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      try {
        await fetch("/api/logout", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Even if request fails, continue with client-side redirect/broadcast.
      }

      broadcastLogout();
      router.replace(ROUTES.AUTH.LOGIN);
      router.refresh();
    };

    const scheduleLogout = () => {
      clearTimer();
      const deadline = Date.now() + INACTIVITY_TIMEOUT_MS;
      deadlineRef.current = deadline;
      setRemainingMs(INACTIVITY_TIMEOUT_MS);

      timeoutRef.current = window.setTimeout(() => {
        void performLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const updateCountdown = () => {
      if (!deadlineRef.current || isLoggingOutRef.current) return;

      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(remaining);
    };

    const handleActivity = () => {
      if (!isLoggingOutRef.current) {
        scheduleLogout();
      }
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    scheduleLogout();
    intervalRef.current = window.setInterval(updateCountdown, 250);

    return () => {
      clearTimer();
      clearIntervalTimer();
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [pathname, router]);

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const showCountdown =
    remainingMs > 0 &&
    remainingMs <= COUNTDOWN_WINDOW_MS &&
    !isLoggingOutRef.current;

  return showCountdown ? (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-md"
      role="status"
      aria-live="polite"
    >
      Auto log off in {formatCountdown(remainingMs)}
    </div>
  ) : null;
}

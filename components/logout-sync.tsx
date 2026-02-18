"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { LOGOUT_CHANNEL, LOGOUT_SIGNAL_KEY } from "@/lib/logout-sync";

export default function LogoutSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectToLogin = () => {
      if (pathname !== ROUTES.AUTH.LOGIN) {
        router.replace(ROUTES.AUTH.LOGIN);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_SIGNAL_KEY) {
        redirectToLogin();
      }
    };

    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(LOGOUT_CHANNEL);
      channel.onmessage = (event) => {
        if (event?.data?.type === "logout") {
          redirectToLogin();
        }
      };
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [pathname, router]);

  return null;
}

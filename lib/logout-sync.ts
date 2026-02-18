export const LOGOUT_SIGNAL_KEY = "cparl:logout";
export const LOGOUT_CHANNEL = "cparl-auth";

export function broadcastLogout(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOGOUT_SIGNAL_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(LOGOUT_CHANNEL);
    channel.postMessage({ type: "logout" });
    channel.close();
  }
}

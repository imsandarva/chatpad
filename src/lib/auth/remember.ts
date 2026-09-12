import type { Session } from "./bridge";

const STORAGE_KEY = "chatpad.auth.who";

export type Who = { email: string; name: string };

/** Last name we showed — paint it before the store is rechecked. */
export function loadWho(): Who | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const who = JSON.parse(raw) as Who;
    if (typeof who.email === "string" && who.email && typeof who.name === "string") return who;
  } catch { /* private mode */ }
  return null;
}

export function remember(session: Session) {
  try {
    if (session.status !== "logged-in") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: session.email, name: session.name }));
  } catch { /* private mode */ }
}

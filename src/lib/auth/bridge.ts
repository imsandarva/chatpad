import { invoke } from "@tauri-apps/api/core";

export type Session =
  | { status: "logged-out" }
  | { status: "logged-in"; email: string; name: string };

export function isNativeShell(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function cursorSession(action: "status" | "login" | "logout"): Promise<Session> {
  return invoke<Session>("cursor_session", { action });
}

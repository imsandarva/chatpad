import { invoke } from "@tauri-apps/api/core";
import { isNativeShell } from "$lib/platform";

export type Session =
  | { status: "logged-out" }
  | { status: "logged-in"; email: string; name: string };

export { isNativeShell };

export async function cursorSession(action: "status" | "login" | "logout"): Promise<Session> {
  return invoke<Session>("cursor_session", { action });
}

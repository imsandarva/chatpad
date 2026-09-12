import { Cursor } from "@cursor/sdk";

export type Session =
  | { status: "logged-out" }
  | { status: "logged-in"; email: string; name: string };

function displayName(email?: string, first?: string, last?: string): string {
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || email || "Signed in";
}

/** Who is signed in, without ever handing the API key to the UI. */
export async function readSession(): Promise<Session> {
  const status = await Cursor.auth.status();
  if (status.status !== "logged-in") return { status: "logged-out" };

  try {
    const me = await Cursor.me();
    const email = me.userEmail ?? status.email ?? "";
    return { status: "logged-in", email, name: displayName(email, me.userFirstName, me.userLastName) };
  } catch {
    const email = status.email ?? "";
    return { status: "logged-in", email, name: displayName(email) };
  }
}

export async function login(): Promise<Session> {
  await Cursor.auth.login({ apiKeyName: "Chatpad" });
  return readSession();
}

export async function logout(): Promise<Session> {
  await Cursor.auth.logout();
  return { status: "logged-out" };
}

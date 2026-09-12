import { cursorSession, isNativeShell, type Session } from "./bridge";

export const auth = $state({
  session: { status: "logged-out" } as Session,
  busy: false,
  ready: false,
  error: "",
});

function fail(message: string): Session {
  auth.error = message;
  return auth.session;
}

async function run(action: "status" | "login" | "logout"): Promise<Session> {
  if (!isNativeShell()) return fail("Open the Chatpad window to sign in.");

  auth.busy = true;
  auth.error = "";
  try {
    auth.session = await cursorSession(action);
    return auth.session;
  } catch {
    return fail(action === "login" ? "Couldn’t sign in. Try again." : "Couldn’t update your account.");
  } finally {
    auth.busy = false;
    auth.ready = true;
  }
}

export async function refresh(): Promise<Session> {
  if (!isNativeShell()) {
    auth.ready = true;
    return auth.session;
  }
  return run("status");
}

export const signIn = () => run("login");
export const signOut = () => run("logout");

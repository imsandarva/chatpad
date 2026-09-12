import { cursorSession, isNativeShell, type Session } from "./bridge";
import { loadWho, remember } from "./remember";

function hydrate(): Session {
  const who = loadWho();
  return who ? { status: "logged-in", email: who.email, name: who.name } : { status: "logged-out" };
}

export const auth = $state({
  session: hydrate(),
  busy: false,
  waiting: false,
  ready: false,
  error: "",
});

function fail(message: string): Session {
  auth.error = message;
  return auth.session;
}

function apply(session: Session): Session {
  auth.session = session;
  remember(session);
  return session;
}

async function run(action: "login" | "logout"): Promise<Session> {
  if (!isNativeShell()) return fail("Open the Chatpad window to sign in.");

  auth.busy = true;
  auth.waiting = action === "login";
  auth.error = "";
  try {
    return apply(await cursorSession(action));
  } catch {
    return fail(action === "login" ? "Couldn’t sign in. Try again." : "Couldn’t update your account.");
  } finally {
    auth.busy = false;
    auth.waiting = false;
    auth.ready = true;
  }
}

/** Recheck the local store without a waiting label. */
export async function refresh(): Promise<Session> {
  if (!isNativeShell()) {
    auth.ready = true;
    return auth.session;
  }
  try {
    const next = await cursorSession("status");
    if (next.status === "logged-in") {
      const who = loadWho();
      if (who && who.email === next.email) next.name = who.name;
    }
    return apply(next);
  } catch {
    return auth.session;
  } finally {
    auth.ready = true;
  }
}

export const signIn = () => run("login");
export const signOut = () => run("logout");

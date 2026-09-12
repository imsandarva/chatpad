import { invoke } from "@tauri-apps/api/core";
import { isNativeShell } from "$lib/platform";

const STORAGE_KEY = "chatpad.workspace.cwd";

/** Browser fallback — the native shell asks Rust for this repo instead. */
const FALLBACK_CWD = "/home/sandarva3/Desktop/chatpad";

export const workspace = $state({
  cwd: FALLBACK_CWD,
  ready: false,
  error: "",
});

export function folderName(cwd: string): string {
  const name = cwd.replace(/\/+$/, "").split("/").pop();
  return name || cwd;
}

function persist(cwd: string) {
  workspace.cwd = cwd;
  workspace.error = "";
  try { localStorage.setItem(STORAGE_KEY, cwd); } catch { /* private mode */ }
}

async function defaultCwd(): Promise<string> {
  if (!isNativeShell()) return FALLBACK_CWD;
  try { return await invoke<string>("default_workspace"); } catch { return FALLBACK_CWD; }
}

let loading: Promise<void> | undefined;

export function loadWorkspace(): Promise<void> {
  return loading ??= (async () => {
    const stored = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })();
    persist(stored || await defaultCwd());
    workspace.ready = true;
  })();
}

export async function pickFolder() {
  if (!isNativeShell()) {
    workspace.error = "Open the Chatpad window to choose a folder.";
    return;
  }

  try {
    const selected = await invoke<string | null>("pick_workspace", { current: workspace.cwd });
    if (selected) persist(selected);
  } catch {
    workspace.error = "Couldn’t open the folder picker.";
  }
}

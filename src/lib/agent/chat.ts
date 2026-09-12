import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { auth } from "$lib/auth/session.svelte";
import { addAssistant, addUser, appendDelta, applyWork, conversation, failAssistant, settleStopped } from "$lib/conversation/conversation.svelte";
import { isNativeShell } from "$lib/platform";
import { workspace } from "$lib/workspace/workspace.svelte";

type HostEvent =
  | { type: "start"; agentId: string }
  | { type: "delta"; text: string }
  | { type: "work"; id: string; name: string; label: string; detail?: string; status: "running" | "done" | "error" }
  | { type: "done"; agentId: string }
  | { type: "cancelled"; agentId: string }
  | { type: "error"; message: string };

function apply(event: HostEvent) {
  if (event.type === "start" || event.type === "done" || event.type === "cancelled") conversation.agentId = event.agentId;
  if (event.type === "delta") appendDelta(event.text);
  else if (event.type === "work") applyWork({ id: event.id, name: event.name, label: event.label, detail: event.detail, status: event.status });
  else if (event.type === "error") failAssistant(event.message);
  else if (event.type === "cancelled") settleStopped();
}

export async function startAgentListener(): Promise<UnlistenFn> {
  if (!isNativeShell()) return () => {};
  return listen<HostEvent>("agent-event", (event) => apply(event.payload));
}

export async function sendPrompt(prompt: string) {
  conversation.busy = true;
  conversation.stopping = false;
  conversation.error = "";
  if (conversation.cwd !== workspace.cwd) {
    conversation.agentId = null;
    conversation.cwd = workspace.cwd;
  }

  addUser(prompt);
  addAssistant();

  if (!isNativeShell()) {
    failAssistant("Open the Chatpad window to send.");
    conversation.busy = false;
    return;
  }
  if (auth.session.status !== "logged-in") {
    failAssistant("Sign in first — then send.");
    conversation.busy = false;
    return;
  }

  try {
    await invoke("cursor_send", { prompt, cwd: workspace.cwd, agentId: conversation.agentId });
  } catch {
    if (conversation.stopping) settleStopped();
    else failAssistant("Couldn’t reach the agent. Try again.");
  } finally {
    conversation.busy = false;
    conversation.stopping = false;
  }
}

/** Cancel the in-flight `agent.send()` — the original send settles on its own. */
export async function stopPrompt() {
  if (!conversation.busy || conversation.stopping || !isNativeShell()) return;
  conversation.stopping = true;
  try {
    await invoke("cursor_stop");
  } catch {
    conversation.stopping = false;
  }
}

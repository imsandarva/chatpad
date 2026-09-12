import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { auth } from "$lib/auth/session.svelte";
import { addAssistant, addUser, appendDelta, conversation, failAssistant } from "$lib/conversation/conversation.svelte";
import { isNativeShell } from "$lib/platform";
import { workspace } from "$lib/workspace/workspace.svelte";

type HostEvent =
  | { type: "start"; agentId: string }
  | { type: "delta"; text: string }
  | { type: "done"; agentId: string }
  | { type: "error"; message: string };

function apply(event: HostEvent) {
  if (event.type === "start" || event.type === "done") conversation.agentId = event.agentId;
  else if (event.type === "delta") appendDelta(event.text);
  else if (event.type === "error") failAssistant(event.message);
}

export async function startAgentListener(): Promise<UnlistenFn> {
  if (!isNativeShell()) return () => {};
  return listen<HostEvent>("agent-event", (event) => apply(event.payload));
}

export async function sendPrompt(prompt: string) {
  conversation.busy = true;
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
    failAssistant("Couldn’t reach the agent. Try again.");
  } finally {
    conversation.busy = false;
  }
}

import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { auth } from "$lib/auth/session.svelte";
import { release, toPayload, type DraftPic } from "$lib/composer/images";
import { take } from "$lib/composer/queue.svelte";
import { addAssistant, addUser, appendDelta, applyWork, conversation, failAssistant, settleStopped } from "$lib/conversation/conversation.svelte";
import { flush, forgetAgent, note, openFolder } from "$lib/conversation/persist";
import { rememberPics } from "$lib/conversation/store";
import { isNativeShell } from "$lib/platform";
import { selectionOf } from "$lib/settings/models";
import { settings, whenModelChanges } from "$lib/settings/settings.svelte";
import { loadWorkspace, workspace } from "$lib/workspace/workspace.svelte";

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
  note();
}

export async function startAgentListener(): Promise<UnlistenFn> {
  whenModelChanges(() => { void forgetAgent(); });
  if (!isNativeShell()) return () => {};
  return listen<HostEvent>("agent-event", (event) => apply(event.payload));
}

export async function sendPrompt(prompt: string, pics: DraftPic[] = []) {
  await loadWorkspace();
  await openFolder(workspace.cwd);
  const thread = conversation.threadId;
  conversation.busy = true;
  conversation.stopping = false;
  conversation.error = "";
  if (pics.length) await rememberPics(pics);
  addUser(prompt, pics.map(({ id, name, mime, url }) => ({ id, name, mime, url })));
  addAssistant();
  note();

  try {
    if (!isNativeShell()) {
      failAssistant("Open the Chatpad window to send.");
      return;
    }
    if (auth.session.status !== "logged-in") {
      failAssistant("Sign in first — then send.");
      return;
    }
    const images = pics.length ? await toPayload(pics) : [];
    await invoke("cursor_send", { prompt, cwd: workspace.cwd, agentId: conversation.agentId, images, model: selectionOf(settings.model) });
  } catch {
    if (conversation.stopping) settleStopped();
    else failAssistant("Couldn’t reach the agent. Try again.");
  } finally {
    conversation.busy = false;
    conversation.stopping = false;
    await flush();
    const next = take();
    if (!next) return;
    if (conversation.threadId !== thread) { for (const pic of next.pics) release(pic); return; }
    await sendPrompt(next.text, next.pics);
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

import { isNativeShell } from "$lib/platform";
import { conversation } from "./conversation.svelte";
import { decodeThread, encodeThread, forgetPics, readThread, writeThread } from "./store";
import type { Message } from "$lib/types/message";
import { loadWorkspace } from "$lib/workspace/workspace.svelte";

const WAIT = 320;
let timer = 0;
let last = "";
let gate = Promise.resolve();

/** Debounced write — streaming should not hit the disk on every token. */
export function note() {
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => { void flush(); }, WAIT);
}

export async function flush() {
  if (timer) { clearTimeout(timer); timer = 0; }
  const thread = encodeThread(conversation.cwd, conversation.agentId, conversation.messages);
  if (!thread) return;
  const body = JSON.stringify(thread);
  if (body === last) return;
  last = body;
  await writeThread(thread);
}

export function openFolder(cwd: string) {
  if (!cwd) return gate;
  gate = gate.then(() => switchTo(cwd));
  return gate;
}

export async function startPersistence(): Promise<() => void> {
  await loadWorkspace();
  const onhide = () => { if (document.hidden) void flush(); };
  document.addEventListener("visibilitychange", onhide);
  window.addEventListener("pagehide", flush);
  const stopClose = await listenClose();
  return () => {
    document.removeEventListener("visibilitychange", onhide);
    window.removeEventListener("pagehide", flush);
    stopClose();
    void flush();
  };
}

async function switchTo(cwd: string) {
  if (conversation.cwd === cwd && conversation.ready) return;
  await flush();
  forgetPics(conversation.messages);
  last = "";
  const stored = await readThread(cwd);
  const next = stored ? await decodeThread(stored) : { agentId: null, messages: [] as Message[] };
  conversation.messages = next.messages;
  conversation.agentId = next.agentId;
  conversation.cwd = cwd;
  conversation.busy = false;
  conversation.stopping = false;
  conversation.error = "";
  conversation.ready = true;
}

async function listenClose(): Promise<() => void> {
  if (!isNativeShell()) return () => {};
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const win = getCurrentWindow();
  return win.onCloseRequested(async (event) => {
    event.preventDefault();
    await flush();
    await win.destroy();
  });
}

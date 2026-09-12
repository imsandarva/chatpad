import { invoke } from "@tauri-apps/api/core";
import { isNativeShell } from "$lib/platform";
import { conversation } from "./conversation.svelte";
import { setCatalog } from "./chats.svelte";
import { decodeChat, emptyFolder, encodeChat, forgetPics, indexOf, readFolder, upsertChat, writeFolder, type StoredFolder } from "./store";
import type { Message } from "$lib/types/message";
import { loadWorkspace } from "$lib/workspace/workspace.svelte";

const WAIT = 320;
let timer = 0;
let last = "";
let cache: StoredFolder | null = null;
let gate = Promise.resolve();

/** Debounced write — streaming should not hit the disk on every token. */
export function note() {
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => { void flush(); }, WAIT);
}

export async function flush() {
  if (timer) { clearTimeout(timer); timer = 0; }
  const { cwd, threadId } = conversation;
  if (!cwd || !threadId) return;
  const chat = encodeChat(threadId, conversation.agentId, conversation.messages);
  cache = upsertChat(cache?.cwd === cwd ? cache : emptyFolder(cwd, threadId), chat, threadId);
  setCatalog(indexOf(cache, threadId));
  const body = JSON.stringify(cache);
  if (body === last) return;
  last = body;
  await writeFolder(cache);
}

export function openFolder(cwd: string) {
  if (!cwd) return gate;
  gate = gate.then(() => switchTo(cwd));
  return gate;
}

/** Put this day away and open a blank page in the same folder. */
export function newChat() {
  if (conversation.busy || !conversation.ready) return gate;
  if (!conversation.messages.length && !conversation.agentId) return gate;
  gate = gate.then(() => startFresh());
  return gate;
}

export function openChat(id: string) {
  if (conversation.busy || !conversation.ready || id === conversation.threadId) return gate;
  gate = gate.then(() => showChat(id));
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
  const leaving = conversation.cwd;
  await flush();
  forgetPics(conversation.messages);
  last = "";
  cache = await readFolder(cwd);
  const id = cache?.activeId || crypto.randomUUID();
  const chat = cache?.chats.find((item) => item.id === id);
  await show(cwd, id, chat ? await decodeChat(chat) : { agentId: null, messages: [] as Message[] });
  if (!cache) cache = emptyFolder(cwd, id);
  setCatalog(indexOf(cache, id));
  if (leaving && leaving !== cwd) await dropLiveAgent();
}

async function startFresh() {
  await flush();
  forgetPics(conversation.messages);
  last = "";
  const id = crypto.randomUUID();
  await show(conversation.cwd, id, { agentId: null, messages: [] });
  if (cache) { cache = { ...cache, activeId: id }; setCatalog(indexOf(cache, id)); }
  await flush();
  await dropLiveAgent();
}

async function showChat(id: string) {
  await flush();
  const chat = cache?.chats.find((item) => item.id === id);
  if (!chat || !cache) return;
  forgetPics(conversation.messages);
  last = "";
  await show(conversation.cwd, id, await decodeChat(chat));
  cache = { ...cache, activeId: id };
  setCatalog(indexOf(cache, id));
  await flush();
  await dropLiveAgent();
}

async function show(cwd: string, threadId: string, next: { agentId: string | null; messages: Message[] }) {
  conversation.messages = next.messages;
  conversation.agentId = next.agentId;
  conversation.threadId = threadId;
  conversation.cwd = cwd;
  conversation.busy = false;
  conversation.stopping = false;
  conversation.error = "";
  conversation.ready = true;
}

/** Close the live agent so the next send is a new session, not a follow-up. */
async function dropLiveAgent() {
  if (!isNativeShell()) return;
  try { await invoke("cursor_dispose"); } catch { /* host not up */ }
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

import { invoke } from "@tauri-apps/api/core";
import { release } from "$lib/composer/images";
import type { DraftPic } from "$lib/composer/images";
import { isNativeShell } from "$lib/platform";
import type { Block, Message, Pic } from "$lib/types/message";

export type StoredPic = { id: string; name: string; mime: string; data: string };
export type StoredMessage = Omit<Message, "pics"> & { pics?: StoredPic[] };
export type StoredThread = { v: 1; cwd: string; agentId: string | null; messages: StoredMessage[] };

const pics = new Map<string, StoredPic>();

/** Keep picture bytes so a reopen can show the same thumbnails. */
export async function rememberPics(drafts: DraftPic[]) {
  await Promise.all(drafts.map(async (pic) => {
    pics.set(pic.id, { id: pic.id, name: pic.name, mime: pic.mime, data: await toB64(pic.blob) });
  }));
}

export function encodeThread(cwd: string, agentId: string | null, messages: Message[]): StoredThread | null {
  if (!cwd || (!messages.length && !agentId)) return null;
  return { v: 1, cwd, agentId, messages: messages.map(encodeMessage) };
}

export async function decodeThread(raw: StoredThread): Promise<{ agentId: string | null; messages: Message[] }> {
  const messages = await Promise.all(raw.messages.map(decodeMessage));
  const last = messages.at(-1);
  if (last?.role === "assistant" && !last.text && !last.blocks?.length && !last.failed) last.stopped = true;
  return { agentId: raw.agentId, messages };
}

export function forgetPics(messages: Message[]) {
  for (const message of messages) for (const pic of message.pics ?? []) release(pic);
}

export async function readThread(cwd: string): Promise<StoredThread | null> {
  if (!cwd) return null;
  try {
    const raw = isNativeShell() ? await invoke<string | null>("thread_load", { cwd }) : localStorage.getItem(webKey(cwd));
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredThread;
    return stored.v === 1 && stored.cwd === cwd && Array.isArray(stored.messages) ? stored : null;
  } catch {
    return null;
  }
}

export async function writeThread(thread: StoredThread) {
  const body = JSON.stringify(thread);
  try {
    if (isNativeShell()) await invoke("thread_save", { cwd: thread.cwd, body });
    else localStorage.setItem(webKey(thread.cwd), body);
  } catch { /* disk or quota */ }
}

function encodeMessage(message: Message): StoredMessage {
  const { pics: attached, ...rest } = message;
  const stored = attached?.map((pic) => pics.get(pic.id)).filter((pic): pic is StoredPic => Boolean(pic));
  return stored?.length ? { ...rest, pics: stored } : rest;
}

async function decodeMessage(message: StoredMessage): Promise<Message> {
  const { pics: attached, blocks, ...rest } = message;
  const next: Message = { ...rest, blocks: settleBlocks(blocks) };
  if (!attached?.length) return next;
  next.pics = await Promise.all(attached.map(async (pic) => {
    pics.set(pic.id, pic);
    const blob = await fetch(`data:${pic.mime};base64,${pic.data}`).then((res) => res.blob());
    return { id: pic.id, name: pic.name, mime: pic.mime, url: URL.createObjectURL(blob) } satisfies Pic;
  }));
  return next;
}

function settleBlocks(blocks?: Block[]): Block[] | undefined {
  if (!blocks?.length) return blocks;
  return blocks.map((block) => (block.kind === "work" && block.status === "running" ? { ...block, status: "done" as const } : block));
}

function webKey(cwd: string): string {
  return `chatpad.thread:${cwd}`;
}

function toB64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const url = String(reader.result ?? ""); resolve(url.slice(url.indexOf(",") + 1)); };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

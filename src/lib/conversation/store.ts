import { invoke } from "@tauri-apps/api/core";
import { release } from "$lib/composer/images";
import type { DraftPic } from "$lib/composer/images";
import { isNativeShell } from "$lib/platform";
import type { Block, Message, Pic } from "$lib/types/message";

export type StoredPic = { id: string; name: string; mime: string; data: string };
export type StoredMessage = Omit<Message, "pics"> & { pics?: StoredPic[] };
export type StoredChat = { id: string; title: string; updatedAt: number; agentId: string | null; messages: StoredMessage[] };
export type StoredFolder = { v: 2; cwd: string; activeId: string; chats: StoredChat[] };
type StoredV1 = { v: 1; cwd: string; agentId: string | null; messages: StoredMessage[] };

export type ChatIndex = { id: string; title: string; updatedAt: number };

const pics = new Map<string, StoredPic>();

/** Keep picture bytes so a reopen can show the same thumbnails. */
export async function rememberPics(drafts: DraftPic[]) {
  await Promise.all(drafts.map(async (pic) => {
    pics.set(pic.id, { id: pic.id, name: pic.name, mime: pic.mime, data: await toB64(pic.blob) });
  }));
}

export function titleFrom(messages: { role?: string; text?: string; pics?: unknown[] }[]): string {
  const user = messages.find((message) => message.role === "user");
  const text = user?.text?.replace(/\s+/g, " ").trim() ?? "";
  if (text) return text.length > 40 ? `${text.slice(0, 39).trimEnd()}…` : text;
  if (user?.pics?.length) return "A few pictures";
  return "A conversation";
}

export function encodeChat(id: string, agentId: string | null, messages: Message[]): StoredChat {
  return { id, title: titleFrom(messages), updatedAt: Date.now(), agentId, messages: messages.map(encodeMessage) };
}

export async function decodeChat(chat: StoredChat): Promise<{ agentId: string | null; messages: Message[] }> {
  const messages = await Promise.all(chat.messages.map(decodeMessage));
  const last = messages.at(-1);
  if (last?.role === "assistant" && !last.text && !last.blocks?.length && !last.failed) last.stopped = true;
  return { agentId: chat.agentId, messages };
}

export function emptyFolder(cwd: string, activeId: string): StoredFolder {
  return { v: 2, cwd, activeId, chats: [] };
}

/** Park or refresh one chat; drop empty pages that are not the one you are on. */
export function upsertChat(folder: StoredFolder, chat: StoredChat, activeId: string): StoredFolder {
  const chats = folder.chats.filter((item) => item.id !== chat.id);
  chats.push(chat);
  return { v: 2, cwd: folder.cwd, activeId, chats: chats.filter((item) => item.id === activeId || item.messages.length || item.agentId) };
}

export function indexOf(folder: StoredFolder, activeId: string): ChatIndex[] {
  return folder.chats
    .filter((chat) => chat.id !== activeId && (chat.messages.length || chat.agentId))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }));
}

export function forgetPics(messages: Message[]) {
  for (const message of messages) for (const pic of message.pics ?? []) release(pic);
}

export async function readFolder(cwd: string): Promise<StoredFolder | null> {
  if (!cwd) return null;
  try {
    const raw = isNativeShell() ? await invoke<string | null>("thread_load", { cwd }) : localStorage.getItem(webKey(cwd));
    if (!raw) return null;
    return migrate(JSON.parse(raw), cwd);
  } catch {
    return null;
  }
}

export async function writeFolder(folder: StoredFolder) {
  try {
    const body = JSON.stringify(folder);
    if (isNativeShell()) await invoke("thread_save", { cwd: folder.cwd, body });
    else localStorage.setItem(webKey(folder.cwd), body);
  } catch { /* disk or quota */ }
}

function migrate(raw: unknown, cwd: string): StoredFolder | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as StoredFolder | StoredV1;
  if (row.v === 2 && row.cwd === cwd && Array.isArray((row as StoredFolder).chats)) return row as StoredFolder;
  if (row.v === 1 && row.cwd === cwd && Array.isArray((row as StoredV1).messages)) {
    const id = crypto.randomUUID();
    const chat = { id, title: titleFrom((row as StoredV1).messages), updatedAt: Date.now(), agentId: row.agentId, messages: (row as StoredV1).messages };
    return { v: 2, cwd, activeId: id, chats: chat.messages.length || chat.agentId ? [chat] : [] };
  }
  return null;
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

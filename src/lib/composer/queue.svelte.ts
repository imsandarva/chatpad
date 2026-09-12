import { release, type DraftPic } from "./images";

export type Queued = { text: string; pics: DraftPic[] };

/** One follow-up — the live turn still owns `lastAssistant()`, so this stays out of the thread. */
export const queue = $state({ next: null as Queued | null });

export function offer(text: string, pics: DraftPic[]): boolean {
  if (queue.next) return false;
  queue.next = { text, pics };
  return true;
}

export function take(): Queued | null {
  const next = queue.next;
  queue.next = null;
  return next;
}

export function drop() {
  if (!queue.next) return;
  for (const pic of queue.next.pics) release(pic);
  queue.next = null;
}

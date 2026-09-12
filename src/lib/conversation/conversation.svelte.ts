import type { Block, Message, Pic, Work } from "$lib/types/message";

export const conversation = $state({
  messages: [] as Message[],
  agentId: null as string | null,
  threadId: "",
  cwd: "",
  ready: false,
  busy: false,
  stopping: false,
  error: "",
});

function id(): string {
  return crypto.randomUUID();
}

export function addUser(text: string, pics?: Pic[]) {
  conversation.messages.push({ id: id(), role: "user", text, pics });
}

export function addAssistant(): Message {
  const turn = { id: id(), role: "assistant" as const, text: "", blocks: [] as Block[] };
  conversation.messages.push(turn);
  return turn;
}

export function lastAssistant(): Message | undefined {
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    if (conversation.messages[i].role === "assistant") return conversation.messages[i];
  }
}

export function appendDelta(text: string) {
  const turn = lastAssistant();
  if (!turn) return;
  turn.text += text;
  const blocks = turn.blocks ??= [];
  const last = blocks.at(-1);
  if (last?.kind === "text") last.text += text;
  else blocks.push({ kind: "text", id: id(), text });
}

export function applyWork(step: Work) {
  const turn = lastAssistant();
  if (!turn) return;
  const blocks = turn.blocks ??= [];
  const i = blocks.findIndex((block) => block.kind === "work" && block.id === step.id);
  if (i >= 0) blocks[i] = { kind: "work", ...step };
  else blocks.push({ kind: "work", ...step });
}

export function failAssistant(text: string) {
  const turn = lastAssistant();
  if (!turn || turn.stopped) return;
  turn.failed = true;
  if (!turn.text) turn.text = text;
}

/** Keep what arrived; the transcript writes a quiet note if nothing did. */
export function settleStopped() {
  const turn = lastAssistant();
  if (turn) turn.stopped = true;
}


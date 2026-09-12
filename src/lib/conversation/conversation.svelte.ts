import type { Message } from "$lib/types/message";

export const conversation = $state({
  messages: [] as Message[],
  agentId: null as string | null,
  cwd: "",
  busy: false,
  error: "",
});

function id(): string {
  return crypto.randomUUID();
}

export function addUser(text: string) {
  conversation.messages.push({ id: id(), role: "user", text });
}

export function addAssistant(): Message {
  const turn = { id: id(), role: "assistant" as const, text: "" };
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
  if (turn) turn.text += text;
}

export function failAssistant(text: string) {
  const turn = lastAssistant();
  if (!turn) return;
  turn.failed = true;
  if (!turn.text) turn.text = text;
}

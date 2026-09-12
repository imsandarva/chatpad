import { Agent, CursorAgentError } from "@cursor/sdk";
import type { StopGate } from "./stop.ts";

export type SendRequest = {
  prompt: string;
  cwd: string;
  agentId?: string | null;
};

export type HostEvent =
  | { type: "start"; agentId: string }
  | { type: "delta"; text: string }
  | { type: "done"; agentId: string }
  | { type: "cancelled"; agentId: string }
  | { type: "error"; message: string };

export type LiveAgent = Awaited<ReturnType<typeof Agent.create>>;
export type RunHandle = { supports: (op: "cancel") => boolean; cancel: () => Promise<void> };

export const model = { id: "composer-2.5" } as const;

export function emit(event: HostEvent) {
  const stdout = (globalThis as unknown as { process: { stdout: { write: (s: string) => void } } }).process.stdout;
  stdout.write(`${JSON.stringify(event)}\n`);
}

export function human(err: unknown): string {
  if (err instanceof CursorAgentError) {
    const text = err.message.toLowerCase();
    if (text.includes("auth") || text.includes("401") || text.includes("unauthor")) return "Sign in again — then send.";
    if (text.includes("network") || text.includes("fetch") || text.includes("econn")) return "Couldn’t reach Cursor. Try again.";
  }
  return "Something went wrong. Try again.";
}

export async function openAgent(cwd: string, agentId?: string | null) {
  const options = { model, local: { cwd } };
  if (!agentId) return Agent.create(options);
  try {
    return await Agent.resume(agentId, options);
  } catch {
    return Agent.create(options);
  }
}

export async function cancelRun(run: { supports: (op: "cancel") => boolean; cancel: () => Promise<void> }) {
  if (run.supports("cancel")) await run.cancel();
}

export type TurnResult = { status: "finished" | "cancelled" | "error"; streamed: boolean; message?: string };

/** One `agent.send()` — caller owns the agent and must not close it here. */
export async function runTurn(
  agent: LiveAgent,
  prompt: string,
  stop: StopGate,
  onRun: (run: RunHandle) => void,
): Promise<TurnResult> {
  let streamed = false;
  const run = await agent.send(prompt, {
    onDelta: ({ update }) => {
      if (update.type === "text-delta" && update.text) {
        streamed = true;
        emit({ type: "delta", text: update.text });
      }
    },
  });
  onRun(run);

  const halt = () => { void cancelRun(run); };
  if (stop.requested) halt();
  else void stop.when.then(halt);

  const result = await run.wait();
  if (result.status === "cancelled" || stop.requested) return { status: "cancelled", streamed };
  if (result.status === "error") return { status: "error", streamed, message: result.error?.message || "The reply didn’t finish." };
  if (!streamed && result.result) emit({ type: "delta", text: result.result });
  return { status: "finished", streamed };
}

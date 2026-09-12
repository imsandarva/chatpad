import { Agent, CursorAgentError } from "@cursor/sdk";
import type { StopGate } from "./control.ts";

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

const model = { id: "composer-2.5" } as const;

function emit(event: HostEvent) {
  const stdout = (globalThis as unknown as { process: { stdout: { write: (s: string) => void } } }).process.stdout;
  stdout.write(`${JSON.stringify(event)}\n`);
}

function human(err: unknown): string {
  if (err instanceof CursorAgentError) {
    const text = err.message.toLowerCase();
    if (text.includes("auth") || text.includes("401") || text.includes("unauthor")) return "Sign in again — then send.";
    if (text.includes("network") || text.includes("fetch") || text.includes("econn")) return "Couldn’t reach Cursor. Try again.";
  }
  return "Something went wrong. Try again.";
}

async function openAgent(cwd: string, agentId?: string | null) {
  const options = { model, local: { cwd } };
  if (!agentId) return Agent.create(options);
  try {
    return await Agent.resume(agentId, options);
  } catch {
    return Agent.create(options);
  }
}

async function cancelRun(run: { supports: (op: "cancel") => boolean; cancel: () => Promise<void> }) {
  if (run.supports("cancel")) await run.cancel();
}

/** Create or resume a local agent, stream text, honour Stop, then dispose. */
export async function send(req: SendRequest, stop: StopGate) {
  let agent;
  try {
    agent = await openAgent(req.cwd, req.agentId);
  } catch (err) {
    emit({ type: "error", message: human(err) });
    return;
  }

  if (stop.requested) {
    agent.close();
    emit({ type: "cancelled", agentId: agent.agentId });
    return;
  }

  emit({ type: "start", agentId: agent.agentId });
  let streamed = false;

  try {
    const run = await agent.send(req.prompt, {
      onDelta: ({ update }) => {
        if (update.type === "text-delta" && update.text) {
          streamed = true;
          emit({ type: "delta", text: update.text });
        }
      },
    });

    const halt = () => { void cancelRun(run); };
    if (stop.requested) halt();
    else void stop.when.then(halt);

    const result = await run.wait();
    if (result.status === "cancelled" || stop.requested) {
      emit({ type: "cancelled", agentId: agent.agentId });
      return;
    }
    if (result.status === "error") {
      emit({ type: "error", message: result.error?.message || "The reply didn’t finish." });
      return;
    }
    if (!streamed && result.result) emit({ type: "delta", text: result.result });
    emit({ type: "done", agentId: agent.agentId });
  } catch (err) {
    if (stop.requested) emit({ type: "cancelled", agentId: agent.agentId });
    else emit({ type: "error", message: human(err) });
  } finally {
    agent.close();
  }
}

import { emit, human, openAgent, runTurn, type LiveAgent, type RunHandle, type SendRequest } from "./agent.ts";
import { key, pick, type ModelSelection } from "./model.ts";
import type { StopGate } from "./stop.ts";

/** Holds one local agent for the window — same shape as the CLI. */
export function createRuntime() {
  let agent: LiveAgent | undefined;
  let cwd = "";
  let agentId: string | undefined;
  let model: ModelSelection | undefined;
  let current: RunHandle | undefined;

  async function dispose() {
    current = undefined;
    agent?.close();
    agent = undefined;
    cwd = "";
    agentId = undefined;
    model = undefined;
  }

  async function attach(nextCwd: string, resumeId: string | null | undefined, next: ModelSelection) {
    const picked = pick(next);
    agent = await openAgent(nextCwd, resumeId, picked);
    cwd = nextCwd;
    agentId = agent.agentId;
    model = picked;
    return agent;
  }

  async function ensure(req: SendRequest) {
    const next = pick(req.model);
    const same = Boolean(agent && cwd === req.cwd && req.agentId && req.agentId === agentId && model && key(model) === key(next));
    if (same) return agent as LiveAgent;
    await dispose();
    return attach(req.cwd, req.agentId, next);
  }

  async function reconnect() {
    const id = agentId;
    const dir = cwd;
    const live = model;
    await dispose();
    if (!id || !dir) return;
    await attach(dir, id, pick(live));
  }

  return {
    cancel() {
      if (current) void current.cancel();
    },
    dispose,
    async send(req: SendRequest, stop: StopGate) {
      let live: LiveAgent;
      try {
        live = await ensure(req);
      } catch (err) {
        emit({ type: "error", message: human(err) });
        return;
      }

      if (stop.requested) {
        emit({ type: "cancelled", agentId: live.agentId });
        return;
      }

      emit({ type: "start", agentId: live.agentId });
      const bind = (run: RunHandle) => { current = run; };

      try {
        let result = await runTurn(live, req.prompt, stop, bind, req.images);
        // Idle local handles go stale; resume once if nothing streamed.
        if (result.status === "error" && !result.streamed && !stop.requested) {
          await reconnect();
          if (agent && !stop.requested) result = await runTurn(agent, req.prompt, stop, bind, req.images);
        }
        if (result.status === "cancelled" || stop.requested) emit({ type: "cancelled", agentId: live.agentId });
        else if (result.status === "error") emit({ type: "error", message: result.message || "The reply didn’t finish." });
        else emit({ type: "done", agentId: (agent ?? live).agentId });
      } catch (err) {
        if (stop.requested) {
          emit({ type: "cancelled", agentId: live.agentId });
          return;
        }
        try {
          await reconnect();
          if (agent && !stop.requested) {
            const retry = await runTurn(agent, req.prompt, stop, bind, req.images);
            if (retry.status === "cancelled") emit({ type: "cancelled", agentId: agent.agentId });
            else if (retry.status === "error") emit({ type: "error", message: retry.message || human(err) });
            else emit({ type: "done", agentId: agent.agentId });
            return;
          }
        } catch { /* fall through */ }
        emit({ type: "error", message: human(err) });
      } finally {
        current = undefined;
      }
    },
  };
}

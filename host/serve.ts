import { createInterface } from "node:readline";
import { createRuntime } from "./runtime.ts";
import { createStopGate } from "./stop.ts";
import type { SendRequest } from "./agent.ts";

type Command =
  | ({ type: "send" } & SendRequest)
  | { type: "cancel" }
  | { type: "dispose" };

/** Durable stdin loop — Send reuses the live agent; cancel can arrive mid-turn. */
export async function serve() {
  const stop = createStopGate();
  const runtime = createRuntime();
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  let turn = Promise.resolve();

  rl.on("line", (line) => {
    let cmd: Command;
    try {
      cmd = JSON.parse(line) as Command;
    } catch {
      return;
    }
    if (cmd.type === "cancel") {
      stop.trip();
      runtime.cancel();
      return;
    }
    if (cmd.type === "dispose") {
      void runtime.dispose();
      return;
    }
    if (cmd.type !== "send") return;
    turn = turn.then(async () => {
      stop.reset();
      try { await runtime.send(cmd, stop); } catch { /* turn already emitted an error */ }
    });
  });

  await new Promise<void>((resolve) => rl.once("close", resolve));
  await runtime.dispose();
}

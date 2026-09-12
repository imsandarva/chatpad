import { createInterface } from "node:readline";
import type { SendRequest } from "./agent.ts";
import { createStopGate, type StopGate } from "./stop.ts";

/** First stdin line is the send request; later lines are control messages. */
export async function openSendControl(): Promise<{ request: SendRequest; stop: StopGate }> {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const first = await new Promise<string>((resolve, reject) => {
    const fail = () => reject(new Error("closed"));
    rl.once("line", (line) => {
      rl.off("close", fail);
      resolve(line);
    });
    rl.once("close", fail);
  });

  const stop = createStopGate();
  rl.on("line", (line) => {
    try {
      if ((JSON.parse(line) as { type?: string }).type === "cancel") stop.trip();
    } catch {
      /* ignore a bad control line */
    }
  });
  process.once("SIGTERM", stop.trip);
  process.once("SIGINT", stop.trip);

  return { request: JSON.parse(first) as SendRequest, stop };
}

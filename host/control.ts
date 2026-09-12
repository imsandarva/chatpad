import { createInterface } from "node:readline";
import type { SendRequest } from "./agent.ts";

/** Trips once — from a cancel line on stdin, or SIGTERM / SIGINT. */
export type StopGate = {
  readonly requested: boolean;
  readonly when: Promise<void>;
};

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

  let requested = false;
  let release = () => {};
  const when = new Promise<void>((resolve) => {
    release = resolve;
  });

  const trip = () => {
    if (requested) return;
    requested = true;
    release();
  };

  rl.on("line", (line) => {
    try {
      if ((JSON.parse(line) as { type?: string }).type === "cancel") trip();
    } catch {
      /* ignore a bad control line */
    }
  });
  process.once("SIGTERM", trip);
  process.once("SIGINT", trip);

  return { request: JSON.parse(first) as SendRequest, stop: { get requested() { return requested; }, when } };
}

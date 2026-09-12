import { login, logout, readSession } from "./auth.ts";
import { send, type SendRequest } from "./agent.ts";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

const action = process.argv[2] ?? "status";

if (action === "send") {
  const req = JSON.parse(await readStdin()) as SendRequest;
  await send(req);
  process.exit(0);
}

const session =
  action === "login" ? await login() : action === "logout" ? await logout() : await readSession();

process.stdout.write(`${JSON.stringify(session)}\n`);

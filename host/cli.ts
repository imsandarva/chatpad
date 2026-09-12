import { login, logout, readSession } from "./auth.ts";
import { send } from "./agent.ts";
import { openSendControl } from "./control.ts";

const action = process.argv[2] ?? "status";

if (action === "send") {
  const { request, stop } = await openSendControl();
  await send(request, stop);
  process.exit(0);
}

const session =
  action === "login" ? await login() : action === "logout" ? await logout() : await readSession();
process.stdout.write(`${JSON.stringify(session)}\n`);

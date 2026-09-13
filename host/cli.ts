import { login, logout, readSession } from "./auth.ts";
import { listCatalog } from "./catalog.ts";
import { createRuntime } from "./runtime.ts";
import { openSendControl } from "./control.ts";
import { serve } from "./serve.ts";

const action = process.argv[2] ?? "status";

if (action === "serve") {
  await serve();
  process.exit(0);
}

if (action === "send") {
  const { request, stop } = await openSendControl();
  const runtime = createRuntime();
  await runtime.send(request, stop);
  await runtime.dispose();
  process.exit(0);
}

if (action === "models") {
  const items = await listCatalog();
  process.stdout.write(`${JSON.stringify({ items })}\n`);
  process.exit(0);
}

const session =
  action === "login" ? await login() : action === "logout" ? await logout() : await readSession();
process.stdout.write(`${JSON.stringify(session)}\n`);

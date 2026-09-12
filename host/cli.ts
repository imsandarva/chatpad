import { login, logout, readSession } from "./auth.ts";

const action = process.argv[2] ?? "status";
const session =
  action === "login" ? await login() : action === "logout" ? await logout() : await readSession();

process.stdout.write(`${JSON.stringify(session)}\n`);

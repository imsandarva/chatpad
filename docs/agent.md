# Agent

Chatpad talks to the same local Cursor agent as the CLI. The window never imports the SDK. A small Node host does that, and stays warm for the life of the window.

## Why a host

WebKit cannot run `@cursor/sdk`. Login, the live agent, and cancel all happen in Node. Rust only starts that process, passes a line, and forwards events back to the page.

```
you type  →  the desk  →  Tauri  →  host/  →  Cursor agent
                              ↑
                         one Node process
```

## A turn

1. You send. The desk puts your bubble on the right and an empty Cursor bubble on the left.
2. The first send in a folder creates a local agent (`composer-2.5`). The next send on that same folder reuses it — a follow-up, not a cold start.
3. Tokens come back as they are written. The left bubble grows.
4. The run ends, or you **Stop**.

Changing the folder disposes that agent and opens a new one. Closing the agent after every reply was what made Chatpad feel slower than the CLI.

## Stop

Stop writes a cancel line to the host. The host calls `run.cancel()`. The stream ends, and the partial reply stays.

## What you see, what you do not

Today the transcript shows assistant **text**. The agent can still run shell and edits — the CLI would print those steps. The desk does not show them yet.

Images cannot ride with a message yet. Both are on [next steps](./next_steps.md).

## Account

Login and logout also go through the host (`Cursor.auth.login()`, then `Cursor.me()`). The key never leaves `~/.cursor/sdk/auth.json`. Opening the window only reads that file locally to see if someone is already signed in — no Node, no network.

Usage bills to the same Cursor plan as the IDE and the CLI.

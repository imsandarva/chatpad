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

1. You send. The desk puts your bubble on the right — text and any pictures — and an empty Cursor bubble on the left. Pictures go with the text, not as a path the agent has to find.
2. The first send in a folder creates a local agent (`composer-2.5`). The next send on that same folder reuses it — a follow-up, not a cold start.
3. Tool calls arrive as work rows (`run.stream()`). Tokens arrive as they are written (`onDelta`).
4. The run ends, or you **Stop**.

Changing the folder disposes that agent and opens a new one. Closing the agent after every reply was what made Chatpad feel slower than the CLI.

## Stop

Stop writes a cancel line to the host. The host calls `run.cancel()`. The stream ends, and the partial reply stays.

## What you see, what you do not

The transcript shows the **text** of a reply and the **work** behind it — shell, edits, reads, and the rest — as short lines in that turn. The host keeps the raw tool payloads; the page only gets a label and a short detail.

Pictures ride with the send. The thread and the agent id for this folder are written locally, so the next open can resume instead of starting over.

## Account

Login and logout also go through the host (`Cursor.auth.login()`, then `Cursor.me()`). The key never leaves `~/.cursor/sdk/auth.json`. Opening the window only reads that file locally to see if someone is already signed in — no Node, no network.

Usage bills to the same Cursor plan as the IDE and the CLI.

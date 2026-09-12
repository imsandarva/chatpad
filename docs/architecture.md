# Architecture

## Shape

```
composer / transcript  →  Tauri invoke  →  host/ (Node)  →  @cursor/sdk  →  Cursor
        SvelteKit UI                         TypeScript host              same as CLI/IDE
              ↑
         Tauri 2 + WebKitGTK
```

The UI owns input and display. The host is the only process that imports `@cursor/sdk` — WebKit cannot run it. Credentials stay in `~/.cursor/sdk/auth.json`; the UI receives name and email only. Status on launch is a local read of that file (no Node, no network). Login and logout still go through the host. Cursor owns the agent. Usage bills to the same plan as the IDE and CLI.

How a turn feels is in [usage](./usage.md) and [conversation](./conversation.md). How a send actually moves is in [agent](./agent.md).

## Why this stack

| Choice | Instead of | Reason |
| --- | --- | --- |
| TypeScript | Python | Browser login (`Cursor.auth.login()`) is first-class in `@cursor/sdk`. The composer will be redesigned often; a web surface is easier to change. Python is fast enough; it is the wrong SDK host. |
| Tauri 2 | Electron | Leaves the IDE’s weight. Target feel is gedit (~80–150 MB, under a second), not Notepad-instant, not VS Code. |
| SvelteKit + Vite | A heavier frontend | Two panes and a text field. `@sveltejs/adapter-static` ships a static UI into Tauri. |
| Isolated npm + rustup | Global `npm -g` / apt `rustc` | App deps stay in this repo. Rust lives in `~/.cargo`. WebKit/GTK must be system packages. |

Not used: Electron, Python/GTK for the app, Flutter (no first-party Cursor SDK).

## Layout

| Path | Role |
| --- | --- |
| `src/` | UI (SvelteKit) |
| `src/routes/+page.svelte` | Thin entry — mounts the desk |
| `src/lib/desk/` | Composes header, transcript, composer |
| `src/lib/chrome/` | Window chrome (wordmark, shared header controls) |
| `src/lib/auth/` | Sign-in control, remembered name, session state |
| `src/lib/workspace/` | Stored project folder (`cwd` for the agent) |
| `host/` | Durable Node host — login, one live `Agent`, `send` / `run.cancel()`, work rows |
| `host/work.ts` | Turns `tool_call` stream events into a short label |
| `src/lib/transcript/` | Conversation pane — `Transcript` lists, `Turn` aligns, `Work` shows the steps, `Body` renders |
| `src/lib/settings/` | Settings sheet — markdown on/off for now |
| `src/lib/markdown/` | Safe markdown render (`marked` + DOMPurify) |
| `src/lib/agent/` | Send, Stop, and stream listener |
| `src/lib/conversation/` | Transcript messages, agent id, and per-folder persist |
| `src/lib/composer/` | Writing well — text, paste/drop pictures, thumbnails |
| `src-tauri/src/pictures.rs` | Native attach — GTK clipboard + dropped image files |
| `src-tauri/src/thread.rs` | One JSON file per folder in the app data dir |
| `src/lib/types/` | Shared shapes |
| `src/app.css` | Tokens and reset |
| `src-tauri/` | Native window (Rust crate `chatpad` / `chatpad_lib`) |
| `src-tauri/src/host.rs` | Keeps one Node process warm for the window |
| `src-tauri/src/auth_store.rs` | Local `auth.json` status — no key leaves the file |
| `node_modules/` | JS/TS packages from `npm install` |
| `src-tauri/target/` | Rust build output |

App id: `com.chatpad.app`. Window title: Chatpad.

The UI is a composition layer: routes wire modules, modules own one pane. Login, folder, Send, Stop, Settings, and the chat thread are wired. Settings is a dialog. Markdown is on by default for Cursor’s replies. Your messages sit on the right; Cursor’s sit on the left.

On Linux the composer asks Rust for pictures the page cannot see: GTK clipboard for a copy, and `read_pictures` for a drop or a file URI. `dragDropEnabled` stays on so Tauri’s `onDragDropEvent` fires.

The window starts one Node host and keeps it. The first send creates (or resumes) a local agent; later sends reuse that handle. Text deltas and tool-call rows come back as NDJSON, Rust emits `agent-event`, and the transcript appends them. A folder change disposes and opens a new agent. Stop writes a cancel line; partial text and work stay. Detail is in [agent](./agent.md).

Each folder’s thread is a JSON file under the app data dir (`threads/<hash>.json`). The page writes on a short debounce and flushes when a turn settles or the window closes. The next open loads that file and resumes the stored agent id.

## Runtime dependencies

**Project (`package.json` / `Cargo.toml`)**

- `@cursor/sdk` — login, local agent, streaming
- `@tauri-apps/cli`, `@tauri-apps/api`, `@tauri-apps/plugin-opener`
- `tauri-plugin-dialog` — native folder picker (Rust; UI invokes `pick_workspace`)
- Svelte 5, SvelteKit, Vite, TypeScript
- `marked`, `dompurify` — formatted replies, sanitized
- `tauri` 2, `serde`, `base64`, `sha2` (Rust)
- Linux: `gtk` / `gdk` / `gdk-pixbuf` — clipboard pictures the webview cannot see

**Machine**

- Node 22 (nvm, `.nvmrc`) — not the Node bundled in `cursor-agent`
- rustup / rustc / cargo (`~/.cargo`)
- Ubuntu: `libwebkit2gtk-4.1-dev`, `libjavascriptcoregtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libxdo-dev` (plus `libgtk-3-dev`, `libssl-dev`, `build-essential`)

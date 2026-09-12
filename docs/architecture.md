# Architecture

## Shape

```
composer / transcript  →  @cursor/sdk (local)  →  Cursor agent
        SvelteKit UI              TypeScript host         same as CLI/IDE
              ↑
         Tauri 2 + WebKitGTK
```

The UI owns input and display. Cursor owns the agent. Usage bills to the same plan as the IDE and CLI.

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
| `src/lib/chrome/` | Window chrome (wordmark; login/folder later) |
| `src/lib/transcript/` | Conversation pane |
| `src/lib/composer/` | Writing well (Send is idle) |
| `src/lib/types/` | Shared shapes |
| `src/app.css` | Tokens and reset |
| `src-tauri/` | Native window (Rust crate `chatpad` / `chatpad_lib`) |
| `node_modules/` | JS/TS packages from `npm install` |
| `src-tauri/target/` | Rust build output |

App id: `com.chatpad.app`. Window title: Chatpad.

The UI is a composition layer: routes wire modules, modules own one pane. Send does not call the agent yet.

## Runtime dependencies

**Project (`package.json` / `Cargo.toml`)**

- `@cursor/sdk` — login, local agent, streaming
- `@tauri-apps/cli`, `@tauri-apps/api`, `@tauri-apps/plugin-opener`
- Svelte 5, SvelteKit, Vite, TypeScript
- `tauri` 2, `serde` (Rust)

**Machine**

- Node 22 (nvm, `.nvmrc`) — not the Node bundled in `cursor-agent`
- rustup / rustc / cargo (`~/.cargo`)
- Ubuntu: `libwebkit2gtk-4.1-dev`, `libjavascriptcoregtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libxdo-dev` (plus `libgtk-3-dev`, `libssl-dev`, `build-essential`)

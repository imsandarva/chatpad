# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/). Versioning is informal until 1.0.

## [0.1.0] — 2026-09-12

### Added

- Tauri 2 + SvelteKit + TypeScript scaffold (`com.chatpad.app`).
- `@cursor/sdk` as a project dependency (not wired to the UI yet).
- Isolated toolchain: nvm Node 22, rustup 1.98, apt WebKit/GTK `-dev` packages.
- Product, architecture, and setup docs.
- Two-pane desk UI: empty transcript and a real composer (Send idle).
- Cursor login in the header (`Cursor.auth.login()` via the Node host); shows who you are.
- Stored project folder in the header (defaults to this repo; native picker can change it).
- Send streams a local Cursor agent reply into the transcript (`Agent.create` / `agent.send`).
- Stop cancels the in-flight run (`run.cancel()`) and keeps whatever text already arrived.
- Settings in the header, with a Markdown switch for formatted or raw replies.

### Changed

- Docs now cover the desk, the thread, and the agent path — not only setup.
- The transcript is a chat thread: your messages on the right, Cursor’s on the left.
- Template names (`tauri-app`) replaced with Chatpad (`chatpad` / `chatpad_lib`).
- Template README removed.
- Opening the window no longer waits on Node for a status check; the last account shows immediately, and “Waiting for Cursor…” is only for Sign in.
- The host stays up and keeps the agent between turns, so a reply is not a cold start each time.

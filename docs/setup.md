# Setup

Open `~/Desktop/chatpad` in the editor. UI is `src/`. Native shell is `src-tauri/`.

## Prerequisites

```bash
# Node 22 (nvm). Do not use cursor-agent's Node.
nvm use   # reads .nvmrc

# Rust (per-user rustup)
. "$HOME/.cargo/env"
rustc --version   # 1.98.x on this machine

# Ubuntu compile deps for Tauri
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libxdo-dev
```

Confirm WebKit is visible:

```bash
pkg-config --exists webkit2gtk-4.1 && echo ok
```

## Install and run

```bash
cd ~/Desktop/chatpad
nvm use
npm install
npm run tauri dev
```

`cargo check` in `src-tauri/` should pass. You should get a native window, not a browser tab. Sign in, pick a folder, write, and Send — [usage](./usage.md) is the walkthrough.

Login stores a key at `~/.cursor/sdk/auth.json`. The UI never sees that key. The next open reads that file locally and shows who you are without waiting.

A plain `npm run dev` is only the page. Sign in, the folder picker, and Send need `npm run tauri dev`.

## Status

The first useful cut is in: toolchain, desk, Cursor login, stored folder, streamed reply, Stop, Settings / Markdown, and a left/right chat thread. What to do in the window is in [usage](./usage.md). What is still open is in [next steps](./next_steps.md).

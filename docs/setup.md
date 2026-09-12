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

`cargo check` in `src-tauri/` should pass. The window is a two-pane desk: transcript above, composer below. Sign in, pick a folder, write, and Send. The host stays warm so follow-ups are just another `send`, not a new process. Stop (or Escape) ends a reply that is still coming.

Login stores a key at `~/.cursor/sdk/auth.json`. The UI never sees that key. The next open reads that file locally and shows who you are without waiting.

## Status

Done: toolchain, scaffold, desk shell, Cursor login, stored folder, Send → streamed reply, Stop.

That is the first useful cut.

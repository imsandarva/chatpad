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

`cargo check` in `src-tauri/` should pass. The window is still the Tauri greet template until the chat UI exists.

## Status

Done: toolchain, scaffold, rename to Chatpad, `cargo check`.

Not done: composer, transcript, Cursor login in the app.

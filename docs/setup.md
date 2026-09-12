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

`cargo check` in `src-tauri/` should pass. The window is a two-pane desk: transcript above, composer below. Sign in (header) opens a Cursor browser login via the Node host. Send does nothing yet.

Login stores a key at `~/.cursor/sdk/auth.json`. The UI never sees that key.

## Status

Done: toolchain, scaffold, rename to Chatpad, `cargo check`, desk shell, Cursor login.

Not done: folder picker, Send → streamed reply.

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$PWD"

if [ "$(id -u)" -eq 0 ]; then
  echo "Do not use sudo. nvm and cargo belong to your user account." >&2
  exit 1
fi

# Stop a leftover desk so Vite can bind 1420. Kill by listen PID only —
# never pkill -f a path that appears on this script's command line.
stop_listen() {
  local port="$1"
  local pids
  pids="$(lsof -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "Freeing port $port (pids: $pids)"
    # shellcheck disable=SC2086
    kill $pids >/dev/null 2>&1 || true
  fi
}

stop_listen 1420
stop_listen 1421

chatpad_pids="$(pgrep -f "$ROOT/src-tauri/target/debug/chatpad" || true)"
if [ -n "$chatpad_pids" ]; then
  echo "Closing previous Chatpad window"
  # shellcheck disable=SC2086
  kill $chatpad_pids >/dev/null 2>&1 || true
fi

sleep 0.3

# nvm trips over nounset/errexit while it is being sourced.
set +eu
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "nvm not found at $NVM_DIR/nvm.sh" >&2
  exit 1
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use
set -e

if [ ! -f "$HOME/.cargo/env" ]; then
  echo "Rust not found at $HOME/.cargo/env" >&2
  exit 1
fi
# shellcheck disable=SC1091
. "$HOME/.cargo/env"

echo "Starting Chatpad (leave this terminal open)..."
exec npm run tauri dev

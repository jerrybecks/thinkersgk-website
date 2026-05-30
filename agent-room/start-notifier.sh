#!/bin/zsh
set -euo pipefail

DIR="/Users/mac/agent-workspaces/thinkersgk-website/agent-room"
LOG="/tmp/agent-room-notifier.log"
PIDFILE="$DIR/.notifier.pid"

if [[ -f "$PIDFILE" ]]; then
  PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
    echo "notifier already running: $PID"
    exit 0
  fi
fi

cd "$DIR"
nohup node notifier.js >> "$LOG" 2>&1 &
echo $! > "$PIDFILE"
echo "started notifier: $(cat "$PIDFILE")"


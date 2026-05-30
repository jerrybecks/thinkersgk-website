#!/bin/zsh
set -euo pipefail

DIR="/Users/mac/agent-workspaces/thinkersgk-website/agent-room"
PIDFILE="$DIR/.notifier.pid"

if [[ ! -f "$PIDFILE" ]]; then
  echo "notifier not running"
  exit 0
fi

PID="$(cat "$PIDFILE" 2>/dev/null || true)"
if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
fi
rm -f "$PIDFILE"
echo "stopped notifier"

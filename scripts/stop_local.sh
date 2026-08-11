#!/usr/bin/env bash
set -euo pipefail

LOCAL_DIR="$HOME/.local/securelamchhe"
PIDFILE="/tmp/securelamchhe_local.pid"

if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  echo "Stopping pid $PID"
  kill "$PID" || true
  rm -f "$PIDFILE"
fi

# Also try to pkill by jar path
pkill -f "$LOCAL_DIR/app.jar" || true
echo "Stopped local app (if it was running)."

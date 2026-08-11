#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=securelamchhe

# Resolve repository root (script lives in ./scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Looking for built jar under: $ROOT_DIR/backend/target"
JAR=$(ls "$ROOT_DIR/backend/target"/*.jar 2>/dev/null | head -n1 || true)
if [ -z "$JAR" ]; then
  echo "No backend jar found under $ROOT_DIR/backend/target. Run scripts/build_and_package.sh from the project root or run $SCRIPT_DIR/build_and_package.sh first." >&2
  exit 1
fi

echo "Stopping systemd service (if exists): $SERVICE_NAME"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl stop $SERVICE_NAME || true
else
  echo "systemctl not found; assuming non-systemd OS (macOS or other)."
fi


DEST_DIR="/opt/$SERVICE_NAME"
echo "Copying jar to $DEST_DIR/app.jar"
sudo mkdir -p "$DEST_DIR"
sudo cp "$JAR" "$DEST_DIR/app.jar"

# Determine appropriate group for chown (macOS uses 'wheel' instead of 'root')
if [ "$(uname -s)" = "Darwin" ]; then
  GROUP=wheel
else
  GROUP=root
fi
sudo chown root:"$GROUP" "$DEST_DIR/app.jar" || true

# Start service: prefer systemd when available, otherwise fall back to simple background launch on macOS
if command -v systemctl >/dev/null 2>&1; then
  echo "Reloading systemd and starting service"
  sudo systemctl daemon-reload || true
  sudo systemctl start $SERVICE_NAME || true
  sudo systemctl status $SERVICE_NAME --no-pager || true
else
  echo "No systemd available; starting app with nohup (macOS / manual management)."
  # Kill any previous instance started from the same jar
  sudo pkill -f "$DEST_DIR/app.jar" || true
  sudo nohup java -jar "$DEST_DIR/app.jar" > "$DEST_DIR/out.log" 2>&1 &
  sleep 1
  echo "Process list for app.jar:"
  ps aux | grep '[j]ava -jar' | grep "$DEST_DIR" || true
fi

echo "Deployment complete."

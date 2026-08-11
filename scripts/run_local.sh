#!/usr/bin/env bash
set -euo pipefail

# Simple local build-and-run for development or testing without sudo
# - builds frontend and backend
# - copies jar to ~/.local/securelamchhe/app.jar
# - starts the jar in background with nohup and writes log to ~/.local/securelamchhe/out.log

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building frontend and backend (this may take a minute)..."
"$SCRIPT_DIR/build_and_package.sh"

JAR_PATH=$(ls "$ROOT_DIR/backend/target"/*-SNAPSHOT.jar 2>/dev/null | head -n1 || true)
if [ -z "$JAR_PATH" ]; then
  echo "Build did not produce a jar under $ROOT_DIR/backend/target" >&2
  exit 1
fi

LOCAL_DIR="$HOME/.local/securelamchhe"
mkdir -p "$LOCAL_DIR"
cp -f "$JAR_PATH" "$LOCAL_DIR/app.jar"
chmod 644 "$LOCAL_DIR/app.jar"

echo "Starting app as current user; log -> $LOCAL_DIR/out.log"
# kill previous instance if any
pkill -f "$LOCAL_DIR/app.jar" || true
nohup java -jar "$LOCAL_DIR/app.jar" > "$LOCAL_DIR/out.log" 2>&1 &
echo $! > "/tmp/securelamchhe_local.pid"
sleep 1
echo "Started pid: $(cat /tmp/securelamchhe_local.pid)"
echo "Tail the log with: tail -f $LOCAL_DIR/out.log"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building frontend..."
cd "$ROOT_DIR/frontend"
if [ -f package-lock.json ] || [ -f yarn.lock ]; then
  npm ci
else
  npm install
fi
# build production frontend
npm run build -- --configuration production || npm run build

echo "Copying frontend build into backend static resources..."
cd "$ROOT_DIR"
rm -rf backend/src/main/resources/static || true
mkdir -p backend/src/main/resources/static
FRONTEND_DIST="$ROOT_DIR/frontend/dist/frontend"
FRONTEND_BROWSER="$FRONTEND_DIST/browser"
if [ -d "$FRONTEND_BROWSER" ]; then
  cp -r "$FRONTEND_BROWSER/"* backend/src/main/resources/static/
  if [ -f "$FRONTEND_BROWSER/index.csr.html" ]; then
    cp "$FRONTEND_BROWSER/index.csr.html" backend/src/main/resources/static/index.html
  fi
else
  cp -r "$FRONTEND_DIST"/* backend/src/main/resources/static/
fi

echo "Building backend (maven package)..."
cd "$ROOT_DIR/backend"
mvn -q -DskipTests package

echo "Build complete. Backend jar available under backend/target/"

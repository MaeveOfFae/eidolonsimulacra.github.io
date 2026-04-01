#!/bin/sh
set -eu

cd /app

pnpm --filter @char-gen/shared build
pnpm --filter @char-gen/shared dev &
SHARED_PID=$!

cleanup() {
  if kill -0 "$SHARED_PID" 2>/dev/null; then
    kill "$SHARED_PID"
    wait "$SHARED_PID" || true
  fi
}

trap cleanup INT TERM EXIT

cd /app/packages/web
pnpm exec vite --host 0.0.0.0 --port 3100
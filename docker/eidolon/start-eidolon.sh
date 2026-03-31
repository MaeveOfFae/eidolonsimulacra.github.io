#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

cleanup() {
  if [ "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID"
    wait "$SERVER_PID" || true
  fi

  if [ "${POSTGRES_PID:-}" ] && kill -0 "$POSTGRES_PID" 2>/dev/null; then
    kill "$POSTGRES_PID"
    wait "$POSTGRES_PID" || true
  fi
}

trap cleanup INT TERM EXIT

echo "Starting PostgreSQL..."
/usr/local/bin/docker-entrypoint.sh postgres &
POSTGRES_PID=$!

echo "Waiting for PostgreSQL to accept connections..."
until pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying Prisma schema..."
cd /app/packages/server
./node_modules/.bin/prisma db push --schema /app/packages/server/prisma/schema.prisma

echo "Starting Eidolon API server..."
node dist/index.js &
SERVER_PID=$!

wait "$SERVER_PID"
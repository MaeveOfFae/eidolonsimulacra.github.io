#!/bin/bash
# Launcher script for exposing the web app and API on the local network.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
API_HOST="${CHAR_GEN_API_HOST:-0.0.0.0}"
API_PORT="${CHAR_GEN_API_PORT:-8000}"
API_HEALTH_URL="http://127.0.0.1:${API_PORT}/api/health"
WEB_HOST="${CHAR_GEN_WEB_HOST:-0.0.0.0}"
WEB_PORT="${CHAR_GEN_WEB_PORT:-3000}"
API_PID=""
WEB_PID=""

listener_pids() {
    local port="$1"
    lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
}

is_repo_process() {
    local pid="$1"
    local command_line

    command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    [[ "$command_line" == *"$SCRIPT_DIR"* ]] || [[ "$command_line" == *"bpui.api.main:app"* ]] || [[ "$command_line" == *"vite"* ]]
}

ensure_port_available() {
    local port="$1"
    local label="$2"
    local existing_pids=()
    local pid
    local command_line

    while IFS= read -r pid; do
        [ -n "$pid" ] && existing_pids+=("$pid")
    done < <(listener_pids "$port")

    if [ ${#existing_pids[@]} -eq 0 ]; then
        return 0
    fi

    for pid in "${existing_pids[@]}"; do
        command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
        if ! is_repo_process "$pid"; then
            echo "Error: ${label} port ${port} is already in use by a non-project process:"
            echo "  PID ${pid}: ${command_line:-<unknown>}"
            echo "Stop that process or override the port with CHAR_GEN_${label}_PORT."
            exit 1
        fi
    done

    echo "Stopping existing project process on port ${port}..."
    for pid in "${existing_pids[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
}

cleanup() {
    if [ -n "$WEB_PID" ] && kill -0 "$WEB_PID" 2>/dev/null; then
        kill "$WEB_PID" 2>/dev/null || true
        wait "$WEB_PID" 2>/dev/null || true
    fi

    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        kill "$API_PID" 2>/dev/null || true
        wait "$API_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

require_command() {
    local command_name="$1"
    local install_hint="$2"

    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Error: '$command_name' is required. $install_hint"
        exit 1
    fi
}

ensure_python_env() {
    if [ ! -f "$VENV_PYTHON" ]; then
        echo "Virtual environment not found. Setting up..."
        python3 -m venv "$VENV_DIR"
        source "$VENV_DIR/bin/activate"

        echo "Installing Python dependencies..."
        pip install --quiet --upgrade pip
        pip install --quiet -r "$SCRIPT_DIR/requirements.txt"
        pip install --quiet -e "$SCRIPT_DIR"
        echo "Python environment ready"
        return
    fi

    source "$VENV_DIR/bin/activate"
}

ensure_node_deps() {
    if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
        echo "Node dependencies not found. Installing with pnpm..."
        (cd "$SCRIPT_DIR" && pnpm install)
        echo "Node dependencies installed"
    fi
}

wait_for_url() {
    local url="$1"
    local pid="$2"
    local label="$3"
    local attempt

    for attempt in $(seq 1 30); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            return 0
        fi

        if ! kill -0 "$pid" 2>/dev/null; then
            echo "Error: ${label} exited before becoming ready"
            return 1
        fi

        sleep 1
    done

    echo "Error: ${label} did not become ready at ${url}"
    return 1
}

print_access_urls() {
    local addresses
    addresses="$(hostname -I 2>/dev/null || true)"

    echo
    echo "LAN access:"
    if [ -n "$addresses" ]; then
        for address in $addresses; do
            if [[ "$address" != 127.* ]]; then
                echo "  Web:      http://${address}:${WEB_PORT}"
                echo "  API docs: http://${address}:${API_PORT}/docs"
            fi
        done
    fi
    echo "  Local web: http://127.0.0.1:${WEB_PORT}"
    echo "  Local API: http://127.0.0.1:${API_PORT}/docs"
    echo
    echo "If another device cannot connect, open the firewall for TCP ports ${WEB_PORT} and ${API_PORT}."
}

require_command python3 "Install Python 3.10+ and make sure it is on your PATH."
require_command pnpm "Install pnpm 9+ and make sure it is on your PATH."
require_command curl "Install curl so the launcher can detect when services are ready."
require_command lsof "Install lsof so the launcher can detect port conflicts."

ensure_python_env
ensure_node_deps
ensure_port_available "$API_PORT" "API"
ensure_port_available "$WEB_PORT" "WEB"

echo "Starting API server on ${API_HOST}:${API_PORT}..."
(
    cd "$SCRIPT_DIR"
    exec "$VENV_PYTHON" -m uvicorn bpui.api.main:app --host "$API_HOST" --port "$API_PORT"
) &
API_PID=$!

wait_for_url "$API_HEALTH_URL" "$API_PID" "API server"

echo "Starting web app on ${WEB_HOST}:${WEB_PORT}..."
(
    cd "$SCRIPT_DIR"
    exec pnpm --filter @char-gen/web dev --host "$WEB_HOST" --port "$WEB_PORT"
) &
WEB_PID=$!

wait_for_url "http://127.0.0.1:${WEB_PORT}" "$WEB_PID" "web app"
print_access_urls

wait "$WEB_PID"
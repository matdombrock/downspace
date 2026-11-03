#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE="${IMAGE:-downspace:latest}"
NAME="${NAME:-downspace}"
PORT="${PORT:-3000}"
BIND="${BIND:-0.0.0.0}"
NOTES_DIR="${NOTES_DIR:-$CONTEXT_DIR/notes}"

if command -v podman >/dev/null 2>&1; then
  ENGINE=podman
elif command -v docker >/dev/null 2>&1; then
  ENGINE=docker
else
  echo "error: neither podman nor docker found" >&2
  exit 1
fi

if ! "$ENGINE" image exists "$IMAGE" >/dev/null 2>&1; then
  echo "Image $IMAGE not found, building it first..."
  "$SCRIPT_DIR/build.sh"
fi

mkdir -p "$NOTES_DIR"

# Forward auth config when provided.
ENV_ARGS=(-e NOTES=/app/notes)
if [[ -n "${AUTH_TOKEN:-}" ]]; then
  ENV_ARGS+=(-e "AUTH_TOKEN=$AUTH_TOKEN")
else
  echo "warning: AUTH_TOKEN not set — server will run without authentication" >&2
fi
if [[ -n "${TRUST_PROXY:-}" ]]; then
  ENV_ARGS+=(-e TRUST_PROXY="$TRUST_PROXY")
fi

exec "$ENGINE" run --rm -it \
  --replace \
  --name "$NAME" \
  -p "${BIND}:${PORT}:3000" \
  -v "$NOTES_DIR:/app/notes" \
  "${ENV_ARGS[@]}" \
  "$IMAGE"

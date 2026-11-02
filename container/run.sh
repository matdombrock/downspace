#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE="${IMAGE:-downspace:latest}"
NAME="${NAME:-downspace}"
PORT="${PORT:-3000}"
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

exec "$ENGINE" run --rm -it \
  --name "$NAME" \
  -p "${PORT}:3000" \
  -v "$NOTES_DIR:/app/notes" \
  -e NOTES=/app/notes \
  "$IMAGE"

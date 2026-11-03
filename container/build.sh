#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE="${IMAGE:-downspace:latest}"
NAME="${NAME:-downspace}"

if command -v podman >/dev/null 2>&1; then
  ENGINE=podman
elif command -v docker >/dev/null 2>&1; then
  ENGINE=docker
else
  echo "error: neither podman nor docker found" >&2
  exit 1
fi

# Remove the previous container so the freshly built image is what runs next.
if "$ENGINE" container exists "$NAME" >/dev/null 2>&1; then
  echo "Removing existing container $NAME"
  "$ENGINE" stop -t 5 "$NAME" >/dev/null 2>&1 || true
  "$ENGINE" rm -f "$NAME" >/dev/null 2>&1 || true
fi

echo "Building $IMAGE with $ENGINE (context: $CONTEXT_DIR)"
"$ENGINE" build -f "$SCRIPT_DIR/Containerfile" -t "$IMAGE" "$CONTEXT_DIR"

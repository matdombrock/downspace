#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE="${IMAGE:-downspace:latest}"

if command -v podman >/dev/null 2>&1; then
  ENGINE=podman
elif command -v docker >/dev/null 2>&1; then
  ENGINE=docker
else
  echo "error: neither podman nor docker found" >&2
  exit 1
fi

echo "Building $IMAGE with $ENGINE (context: $CONTEXT_DIR)"
"$ENGINE" build -f "$SCRIPT_DIR/Containerfile" -t "$IMAGE" "$CONTEXT_DIR"

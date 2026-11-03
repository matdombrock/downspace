#!/usr/bin/env bash
# Example VPS deployment.
#
# Assumes a reverse proxy (Caddy, Traefik, nginx) terminates TLS and forwards
# to 127.0.0.1:3000, so the container port is never exposed directly. Because
# the proxy is trusted, TRUST_PROXY=1 makes req.ip the real client IP (used by
# the login rate limiter).
#
# Everything else (engine detection, image build, notes mount) is handled by
# run.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# CHANGE THIS before deploying. Example value only.
export AUTH_TOKEN="${AUTH_TOKEN:-abc123}"

# Behind a reverse proxy.
export TRUST_PROXY="${TRUST_PROXY:-1}"

# Host port the proxy forwards to (container always listens on 3000).
export PORT="${PORT:-1113}"

# Publish on loopback only: the reverse proxy runs on this same host and
# connects locally, so the app port is never reachable from the internet.
export BIND="${BIND:-127.0.0.1}"

exec "$SCRIPT_DIR/run.sh"

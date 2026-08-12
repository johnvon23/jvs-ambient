#!/usr/bin/env bash
# Idempotent static server for the site, on a fixed port.
#
#   ./serve.sh            start if not already up, print the URL
#   ./serve.sh status     report without starting anything
#   ./serve.sh stop       kill the server this script started
#   ./serve.sh restart    stop then start
#
# Idempotent on purpose: the server dies between agent turns often enough
# that "is it up?" has to be one cheap call, not a decision.

set -euo pipefail

PORT="${SITE_PORT:-4173}"
URL="http://localhost:${PORT}/"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
LOG="${TMPDIR:-/tmp}"; LOG="${LOG%/}/jvs-ambient-${PORT}.log"

# One retry: a server that is alive but busy can miss a single short timeout,
# and a false "down" here causes a pointless kill-and-restart.
up() {
  curl -sS -m 2 -o /dev/null "$URL" 2>/dev/null && return 0
  sleep .3
  curl -sS -m 3 -o /dev/null "$URL" 2>/dev/null
}

# PID listening on the port, if any
listener() { lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1; }

start() {
  if up; then
    echo "already up: ${URL} (root: $(served_root))"
    return 0
  fi

  # A dead socket can linger; clear anything holding the port first.
  local pid; pid="$(listener || true)"
  [ -n "$pid" ] && kill "$pid" 2>/dev/null || true

  cd "$ROOT"
  nohup python3 -m http.server "$PORT" >"$LOG" 2>&1 &

  # Poll rather than sleep-and-hope: usually ready in well under a second.
  for _ in $(seq 1 25); do
    if up; then
      echo "started: ${URL} (root: ${ROOT}, log: ${LOG})"
      return 0
    fi
    sleep .2
  done

  echo "FAILED to start on ${PORT}. Last log lines:" >&2
  tail -5 "$LOG" >&2 || true
  return 1
}

# Confirms the server is serving THIS repo and not some other directory a
# stray python http.server was launched from. That mistake looks exactly
# like a caching bug from the browser side, so it is worth one request.
served_root() {
  if curl -sS -m 2 "${URL}css/site.css" 2>/dev/null | grep -q 'John von Seggern'; then
    echo "this repo"
  else
    echo "UNKNOWN - not serving this repo's css/site.css"
  fi
}

case "${1:-start}" in
  start)   start ;;
  status)
    if up; then echo "up: ${URL} (root: $(served_root))"
    else echo "down: ${URL}"; exit 1; fi ;;
  stop)
    pid="$(listener || true)"
    if [ -n "$pid" ]; then kill "$pid" && echo "stopped pid ${pid}"
    else echo "nothing listening on ${PORT}"; fi ;;
  restart) "${BASH_SOURCE[0]}" stop || true; start ;;
  *) echo "usage: serve.sh [start|status|stop|restart]" >&2; exit 2 ;;
esac

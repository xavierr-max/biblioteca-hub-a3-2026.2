#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$PROJECT_DIR/.run"

for name in api frontend; do
  pid_file="$RUN_DIR/$name.pid"
  if [[ -f "$pid_file" ]]; then
    pid="$(<"$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
done

printf 'API e frontend encerrados. O MySQL e o volume foram preservados.\n'

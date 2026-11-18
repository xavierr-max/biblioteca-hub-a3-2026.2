#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
RUN_DIR="$PROJECT_DIR/.run"
API_URL="http://127.0.0.1:5180"
FRONTEND_URL="http://127.0.0.1:5173"

die() { printf 'Erro: %s\n' "$1" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || die 'Docker não está instalado ou não está no PATH.'
command -v dotnet >/dev/null 2>&1 || die '.NET SDK não está instalado ou não está no PATH.'
command -v npm >/dev/null 2>&1 || die 'Node.js/npm não está instalado ou não está no PATH.'

cd "$PROJECT_DIR"
mkdir -p "$RUN_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
  printf 'Arquivo .env criado a partir de .env.example.\n'
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  printf 'Instalando dependências do frontend...\n'
  (cd "$FRONTEND_DIR" && npm install)
fi

printf 'Iniciando MySQL...\n'
docker compose up -d mysql >/dev/null

printf 'Aguardando MySQL ficar saudável...\n'
for attempt in {1..30}; do
  mysql_container="$(docker compose ps -q mysql 2>/dev/null || true)"
  status="$(if [[ -n "$mysql_container" ]]; then docker inspect -f '{{.State.Health.Status}}' "$mysql_container" 2>/dev/null || true; fi)"
  [[ "$status" == healthy ]] && break
  if [[ "$attempt" == 30 ]]; then
    docker compose logs --tail=40 mysql >&2
    die 'MySQL não ficou saudável.'
  fi
  sleep 2
done

if [[ -f "$RUN_DIR/api.pid" ]] && kill -0 "$(<"$RUN_DIR/api.pid")" 2>/dev/null; then
  printf 'API já está em execução.\n'
else
  (cd "$BACKEND_DIR" && nohup dotnet run --project Biblioteca.Api/Biblioteca.Api.csproj --no-launch-profile --urls "$API_URL" >"$RUN_DIR/api.log" 2>&1 & echo $! >"$RUN_DIR/api.pid")
fi

if [[ -f "$RUN_DIR/frontend.pid" ]] && kill -0 "$(<"$RUN_DIR/frontend.pid")" 2>/dev/null; then
  printf 'Frontend já está em execução.\n'
else
  (cd "$FRONTEND_DIR" && nohup npm run dev -- --host 127.0.0.1 >"$RUN_DIR/frontend.log" 2>&1 & echo $! >"$RUN_DIR/frontend.pid")
fi

printf 'Aguardando API e frontend...\n'
for attempt in {1..30}; do
  api_ok=false
  frontend_ok=false
  command -v curl >/dev/null 2>&1 && curl -fsS "$API_URL/api/health" >/dev/null 2>&1 && api_ok=true
  command -v curl >/dev/null 2>&1 && curl -fsS "$FRONTEND_URL" >/dev/null 2>&1 && frontend_ok=true
  if $api_ok && $frontend_ok; then break; fi
  if [[ "$attempt" == 30 ]]; then
    tail -40 "$RUN_DIR/api.log" "$RUN_DIR/frontend.log" >&2 || true
    die 'A aplicação não ficou disponível. Consulte os logs em .run/. '
  fi
  sleep 2
done

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FRONTEND_URL" >/dev/null 2>&1 || true
elif command -v gio >/dev/null 2>&1; then
  gio open "$FRONTEND_URL" >/dev/null 2>&1 || true
fi

printf '\nBiblioteca iniciada: %s\n' "$FRONTEND_URL"
printf 'Logs: %s/api.log e %s/frontend.log\n' "$RUN_DIR" "$RUN_DIR"

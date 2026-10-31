#!/usr/bin/env bash
# Spins up a throwaway Postgres, applies the Supabase stub + every migration,
# then runs the SQL test suite. Requires Postgres 15+ binaries on PATH or in
# /usr/lib/postgresql/*/bin. Usage: supabase/tests/run.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
bin="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
export PATH="${bin:+$bin:}$PATH"
tmp="$(mktemp -d)"
trap 'pg_ctl -D "$tmp/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT
run() { if [ "$(id -u)" = 0 ]; then su postgres -c "PATH='$PATH'; $*"; else bash -c "$*"; fi; }
[ "$(id -u)" = 0 ] && chown postgres "$tmp"
run "initdb -D '$tmp/data' -U postgres -A trust >/dev/null"
run "pg_ctl -D '$tmp/data' -o '-k $tmp -p 54329 -c listen_addresses=' -l '$tmp/log' start >/dev/null"
psql_() { psql -h "$tmp" -p 54329 -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
psql_ -f "$here/supabase_stub.sql"
for m in "$here"/../migrations/*.sql; do psql_ -f "$m"; done
psql_ -o /dev/null -f "$here/test_chores.sql"
FIXTURE="$here/fixtures/recurrence_cases.json" psql_ -f "$here/test_parity.sql"
echo "All SQL tests passed."

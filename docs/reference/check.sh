#!/usr/bin/env bash
# Validates docs/reference/schema.sql on a throwaway Postgres + Supabase stub.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
bin="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
export PATH="${bin:+$bin:}$PATH"
tmp="$(mktemp -d)"
trap 'pg_ctl -D "$tmp/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT
run() { if [ "$(id -u)" = 0 ]; then su postgres -c "PATH='$PATH'; $*"; else bash -c "$*"; fi; }
[ "$(id -u)" = 0 ] && chown postgres "$tmp"
run "initdb -D '$tmp/data' -U postgres -A trust >/dev/null"
run "pg_ctl -D '$tmp/data' -o '-k $tmp -p 54330 -c listen_addresses=' -l '$tmp/log' start >/dev/null"
psql_() { psql -h "$tmp" -p 54330 -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
psql_ -f "$here/../../supabase/tests/supabase_stub.sql"
psql_ -f "$here/schema.sql"
psql_ -Atc "select count(*) || ' tables, ' || (select count(*) from pg_policies) || ' policies' from information_schema.tables where table_schema in ('core','work','money','time') and table_type='BASE TABLE'"

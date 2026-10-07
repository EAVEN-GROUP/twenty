#!/bin/bash
# =============================================================================
# Twenty CRM: replace the local dev database with a copy of production
# =============================================================================
# Streams a pg_dump from the VPS straight into a local file (nothing is left on
# the VPS), then drops and recreates the local database and restores into it.
# Views, dashboards, workflows and records all live in that database, so the
# local app ends up with the same workspace as production.
#
# Rows encrypted with production's secrets cannot be read locally, so after the
# restore the script clears them in the LOCAL database only: the JWT signing key
# (the server creates a new one on first use) and every 2FA method (so login
# needs only email and password). Production is never modified.
#
# Usage (from repo root, with `yarn start` stopped):
#   bash packages/twenty-utils/pull-prod-db.sh                  # fresh dump + restore
#   bash packages/twenty-utils/pull-prod-db.sh --reuse-latest   # restore the last dump, no ssh
#   bash packages/twenty-utils/pull-prod-db.sh --reuse-dump FILE
#   bash packages/twenty-utils/pull-prod-db.sh --yes            # skip the confirmation
#   bash packages/twenty-utils/pull-prod-db.sh --no-backup      # skip the local safety dump
#   bash packages/twenty-utils/pull-prod-db.sh --dev-login EMAIL
#       also sets a throwaway password for that one user, in the LOCAL database
#       only, so you can log in without knowing the production password
#
# Overridable with environment variables (defaults in brackets):
#   PROD_SSH_HOST [eaven-prod]  PROD_DIR [/opt/twenty]  PROD_DB_SERVICE [db]
#   PROD_DB_USER [postgres]     PROD_DB_NAME [default]
#   LOCAL_DB_CONTAINER [twenty-dev-db-1]  LOCAL_REDIS_CONTAINER [twenty-dev-redis-1]
#   LOCAL_DB_USER [postgres]    LOCAL_DB_NAME [default]
#   LOCAL_SERVER_HEALTH_URL [http://localhost:3000/healthz]
#   DUMP_DIR [~/twenty-prod-dumps]   KEEP_DUMPS [3]
#   DEV_LOGIN_PASSWORD [twenty-dev-local]   (only used with --dev-login)
# =============================================================================
set -euo pipefail

PROD_SSH_HOST="${PROD_SSH_HOST:-eaven-prod}"
PROD_DIR="${PROD_DIR:-/opt/twenty}"
PROD_DB_SERVICE="${PROD_DB_SERVICE:-db}"
PROD_DB_USER="${PROD_DB_USER:-postgres}"
PROD_DB_NAME="${PROD_DB_NAME:-default}"
LOCAL_DB_CONTAINER="${LOCAL_DB_CONTAINER:-twenty-dev-db-1}"
LOCAL_REDIS_CONTAINER="${LOCAL_REDIS_CONTAINER:-twenty-dev-redis-1}"
LOCAL_DB_USER="${LOCAL_DB_USER:-postgres}"
LOCAL_DB_NAME="${LOCAL_DB_NAME:-default}"
LOCAL_SERVER_HEALTH_URL="${LOCAL_SERVER_HEALTH_URL:-http://localhost:3000/healthz}"
DUMP_DIR="${DUMP_DIR:-$HOME/twenty-prod-dumps}"
KEEP_DUMPS="${KEEP_DUMPS:-3}"
DEV_LOGIN_PASSWORD="${DEV_LOGIN_PASSWORD:-twenty-dev-local}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

info() { echo "=> $*"; }
warn() { echo "!! $*" >&2; }
fail() { warn "$*"; exit 1; }

assume_yes=false
make_backup=true
reuse_dump=""
dev_login_email=""

while [ $# -gt 0 ]; do
  case "$1" in
    --yes) assume_yes=true ;;
    --no-backup) make_backup=false ;;
    --reuse-latest)
      reuse_dump="$(ls -1t "$DUMP_DIR"/prod-*.dump 2>/dev/null | head -n 1 || true)"
      [ -n "$reuse_dump" ] || fail "No previous dump found in $DUMP_DIR"
      ;;
    --reuse-dump)
      shift
      [ $# -gt 0 ] || fail "--reuse-dump needs a file path"
      reuse_dump="$1"
      ;;
    --dev-login)
      shift
      [ $# -gt 0 ] || fail "--dev-login needs an email address"
      dev_login_email="$1"
      case "$dev_login_email" in
        *[[:space:]\'\"]* | "" | *@*@* | @* | *@) fail "--dev-login needs a plain email address, got: $dev_login_email" ;;
        *@*) ;;
        *) fail "--dev-login needs a plain email address, got: $dev_login_email" ;;
      esac
      ;;
    -h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d'; exit 0 ;;
    *) fail "Unknown option: $1" ;;
  esac
  shift
done

local_psql() { docker exec -i "$LOCAL_DB_CONTAINER" psql -U "$LOCAL_DB_USER" -v ON_ERROR_STOP=1 "$@"; }

info "Checking local services"
docker inspect -f '{{.State.Running}}' "$LOCAL_DB_CONTAINER" 2>/dev/null | grep -q true \
  || fail "Container $LOCAL_DB_CONTAINER is not running. Start it with: bash packages/twenty-utils/setup-dev-env.sh"

# A running server holds connections and would crash when the database is dropped.
if curl -s -o /dev/null --max-time 2 "$LOCAL_SERVER_HEALTH_URL"; then
  fail "The local server is running ($LOCAL_SERVER_HEALTH_URL). Stop 'yarn start' first."
fi

mkdir -p "$DUMP_DIR"
timestamp="$(date +%Y%m%d-%H%M%S)"

if [ -n "$reuse_dump" ]; then
  [ -s "$reuse_dump" ] || fail "Dump file not found or empty: $reuse_dump"
  dump_file="$reuse_dump"
  info "Reusing $dump_file"
else
  dump_file="$DUMP_DIR/prod-$timestamp.dump"
  partial_file="$dump_file.partial"
  info "Dumping $PROD_DB_NAME from $PROD_SSH_HOST (read-only, streamed to $dump_file)"
  # Single-quoted on purpose: the command is expanded on the VPS, not here.
  ssh "$PROD_SSH_HOST" \
    "cd '$PROD_DIR' && docker compose exec -T '$PROD_DB_SERVICE' pg_dump -U '$PROD_DB_USER' -d '$PROD_DB_NAME' -Fc" \
    > "$partial_file" || { rm -f "$partial_file"; fail "pg_dump over ssh failed"; }
  [ -s "$partial_file" ] || { rm -f "$partial_file"; fail "The dump is empty"; }
  mv "$partial_file" "$dump_file"
fi

info "Validating the dump ($(du -h "$dump_file" | cut -f1))"
docker exec -i "$LOCAL_DB_CONTAINER" pg_restore -l < "$dump_file" > /dev/null \
  || fail "pg_restore cannot read the dump, aborting before touching the local database"

if [ "$assume_yes" != true ]; then
  warn "This will DROP the local database '$LOCAL_DB_NAME' in $LOCAL_DB_CONTAINER and replace it with production data."
  read -r -p "Type 'yes' to continue: " answer
  [ "$answer" = "yes" ] || fail "Aborted"
fi

if [ "$make_backup" = true ]; then
  backup_file="$DUMP_DIR/local-backup-$timestamp.dump"
  info "Backing up the current local database to $backup_file"
  if docker exec "$LOCAL_DB_CONTAINER" pg_dump -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -Fc > "$backup_file" 2>/dev/null \
    && [ -s "$backup_file" ]; then
    :
  else
    rm -f "$backup_file"
    warn "Could not back up the local database (it may not exist yet), continuing"
  fi
fi

info "Recreating local database '$LOCAL_DB_NAME'"
local_psql -d postgres -c "DROP DATABASE IF EXISTS \"$LOCAL_DB_NAME\" WITH (FORCE);"
local_psql -d postgres -c "CREATE DATABASE \"$LOCAL_DB_NAME\";"

info "Restoring (this can take a while)"
# pg_restore exits non-zero on harmless warnings, so judge success by the check below.
docker exec -i "$LOCAL_DB_CONTAINER" pg_restore -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" --no-owner --no-privileges < "$dump_file" \
  || warn "pg_restore reported errors (often harmless). Verifying the result"

workspace_schemas="$(local_psql -d "$LOCAL_DB_NAME" -tAc "SELECT count(*) FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';")"
[ "${workspace_schemas:-0}" -gt 0 ] \
  || fail "No workspace schema found after the restore. The restore failed, check the output above."
info "Restored: $workspace_schemas workspace schema(s) found"

# Both tables hold secrets encrypted with production's keys, which the local
# server cannot decrypt (login fails with "No encryption key matches keyId ...").
info "Clearing rows encrypted with production keys (local database only)"
cleared_signing_keys="$(local_psql -d "$LOCAL_DB_NAME" -tAc 'WITH removed AS (DELETE FROM core."signingKey" RETURNING 1) SELECT count(*) FROM removed;')"
cleared_two_factor_methods="$(local_psql -d "$LOCAL_DB_NAME" -tAc 'WITH removed AS (DELETE FROM core."twoFactorAuthenticationMethod" RETURNING 1) SELECT count(*) FROM removed;')"
info "Removed $cleared_signing_keys signing key(s) and $cleared_two_factor_methods 2FA method(s)"

# With no 2FA methods left, a workspace that enforces 2FA would force a new setup at login.
relaxed_workspaces="$(local_psql -d "$LOCAL_DB_NAME" -tAc 'WITH updated AS (UPDATE core."workspace" SET "isTwoFactorAuthenticationEnforced" = false WHERE "isTwoFactorAuthenticationEnforced" RETURNING 1) SELECT count(*) FROM updated;')"
info "Turned off enforced 2FA on $relaxed_workspaces local workspace(s)"

if [ -n "$dev_login_email" ]; then
  info "Setting a local-only password for $dev_login_email"
  # Same algorithm and cost as hashPassword in auth.util.ts, so the server accepts it.
  dev_login_hash="$(cd "$repo_root" && node -e "process.stdout.write(require('bcrypt').hashSync(process.argv[1], 10))" "$DEV_LOGIN_PASSWORD")" \
    || fail "Could not hash the password. Run 'yarn install' first so the bcrypt package is available."
  # psql does not interpolate variables inside -c strings, so the SQL goes over stdin.
  updated_users="$(local_psql -d "$LOCAL_DB_NAME" -tA -v hash="$dev_login_hash" -v email="$dev_login_email" <<'SQL'
WITH updated AS (
  UPDATE core."user" SET "passwordHash" = :'hash' WHERE lower("email") = lower(:'email') RETURNING 1
) SELECT count(*) FROM updated;
SQL
)"
  [ "${updated_users:-0}" -gt 0 ] || fail "No user with the email $dev_login_email exists in the restored database."
  info "Updated $updated_users user row(s) for $dev_login_email"
fi

info "Flushing local Redis cache"
docker exec "$LOCAL_REDIS_CONTAINER" redis-cli FLUSHALL > /dev/null

info "Pruning old dumps (keeping $KEEP_DUMPS of each kind)"
for pattern in 'prod-*.dump' 'local-backup-*.dump'; do
  ls -1t "$DUMP_DIR"/$pattern 2>/dev/null | tail -n +"$((KEEP_DUMPS + 1))" | xargs -r rm -f --
done

if [ -n "$dev_login_email" ]; then
  login_hint="Log in at http://localhost:3001 as $dev_login_email with the local-only password '$DEV_LOGIN_PASSWORD' (no 2FA code needed locally)."
else
  login_hint="Log in at http://localhost:3001 with your production email and password (no 2FA code needed locally)."
fi

cat <<EOF

Done. Next:
  1. yarn start          (the server applies any pending upgrade commands on boot)
  2. $login_hint

Reminders:
  - This is real customer data. Dumps are in $DUMP_DIR, outside the repo; delete them when finished.
  - Other values encrypted with production's secrets (for example connected email/calendar account tokens) are not cleared, and will not work locally.
  - Check that no connected email/calendar accounts or workflows can act on real data from your machine.
EOF

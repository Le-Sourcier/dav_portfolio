#!/usr/bin/env bash
#
# backup.sh — Orchestrateur de backup pour le Portfolio backend.
#
# Périmètre :
#   - pg_dump compressé (format custom)
#   - tarball logs/  (conditionnel)
#   - tarball uploads/ (conditionnel, prévu pour le jour où on en aura)
#   - manifest SHA-256
#   - rotation tiered (daily / weekly / monthly)
#   - upload distant conditionnel : S3-compatible, SFTP, Google Drive
#   - notification : log fichier toujours, email + Discord si configurés
#
# Exit codes :
#   0 = succès complet
#   1 = échec critique (pg_dump KO)
#   2 = succès partiel (local OK, au moins 1 distant KO)
#
# Activé via .env : BACKUP_ENABLED=true
#

set -euo pipefail
# Note: `set +x` is *not* applied unconditionally here. We rely on the caller
# not passing -x. This keeps debugging possible while still avoiding leaks in
# normal (non-traced) runs.

# ----------------------------------------------------------------------------
# Localisation : le script doit fonctionner depuis n'importe où (crontab).
# ----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR"

# ----------------------------------------------------------------------------
# .env loader : lit ligne par ligne, gère les valeurs avec espaces et les
# guillemets. Pas de `source .env` car ça interpréterait les valeurs comme
# des commandes shell (cas réel : EMAIL_PASS=wftu sloa kpsq wecy).
# ----------------------------------------------------------------------------
load_env() {
  local env_file="$BACKEND_DIR/.env"
  [[ -f "$env_file" ]] || { echo "[backup] WARN: $env_file not found, using process env"; return 0; }
  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*([A-Z_][A-Z0-9_]*)[[:space:]]*=(.*)$ ]] || continue
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    # Strip wrapping quotes if present
    if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
      value="${BASH_REMATCH[1]}"
    fi
    # N'écrase pas une valeur déjà fournie par l'environnement parent
    if [[ -z "${!key+set}" ]]; then
      export "$key=$value"
    fi
  done < "$env_file"
}
load_env

# ----------------------------------------------------------------------------
# Variables et défauts
# ----------------------------------------------------------------------------
BACKUP_ENABLED="${BACKUP_ENABLED:-false}"
BACKUP_RETENTION_DAILY="${BACKUP_RETENTION_DAILY:-7}"
BACKUP_RETENTION_WEEKLY="${BACKUP_RETENTION_WEEKLY:-4}"
BACKUP_RETENTION_MONTHLY="${BACKUP_RETENTION_MONTHLY:-3}"
BACKUP_INCLUDE_UPLOADS="${BACKUP_INCLUDE_UPLOADS:-false}"
BACKUP_UPLOADS_PATH="${BACKUP_UPLOADS_PATH:-./uploads}"
BACKUP_INCLUDE_LOGS="${BACKUP_INCLUDE_LOGS:-true}"
BACKUP_VERBOSE_NOTIFY="${BACKUP_VERBOSE_NOTIFY:-false}"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portfolio_db}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

BACKUPS_ROOT="$BACKEND_DIR/backups"
LOG_DIR="$BACKEND_DIR/logs"
LOG_FILE="$LOG_DIR/backup.log"
LOG_MAX_BYTES=10485760   # 10 MB

mkdir -p "$LOG_DIR"

# Argument --verbose force la notification email même en cas de succès
for arg in "$@"; do
  case "$arg" in
    --verbose|-v) BACKUP_VERBOSE_NOTIFY=true ;;
  esac
done

# ----------------------------------------------------------------------------
# Logger fichier + stdout (format : [ISO timestamp] [LEVEL] message)
# ----------------------------------------------------------------------------
rotate_log_if_needed() {
  [[ -f "$LOG_FILE" ]] || return 0
  local size
  size=$(wc -c <"$LOG_FILE" 2>/dev/null || echo 0)
  if (( size > LOG_MAX_BYTES )); then
    mv "$LOG_FILE" "$LOG_FILE.1"
  fi
}
rotate_log_if_needed

log() {
  local level="$1"; shift
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  printf '%s [%s] %s\n' "$ts" "$level" "$*" | tee -a "$LOG_FILE"
}
log_info()  { log INFO  "$*"; }
log_warn()  { log WARN  "$*"; }
log_error() { log ERROR "$*"; }

# ----------------------------------------------------------------------------
# Master switch
# ----------------------------------------------------------------------------
if [[ "$BACKUP_ENABLED" != "true" ]]; then
  log_info "BACKUP_ENABLED is not 'true' — skipping (set BACKUP_ENABLED=true in .env to activate)."
  exit 0
fi

# ----------------------------------------------------------------------------
# Détermination du tier : monthly > weekly > daily
#   - monthly : 1er jour du mois
#   - weekly  : dimanche (day-of-week = 0)
#   - daily   : sinon
# ----------------------------------------------------------------------------
DOM=$(date '+%-d')
DOW=$(date '+%u')   # 1=lundi … 7=dimanche
if (( DOM == 1 )); then
  TIER="monthly"
  RETENTION="$BACKUP_RETENTION_MONTHLY"
elif (( DOW == 7 )); then
  TIER="weekly"
  RETENTION="$BACKUP_RETENTION_WEEKLY"
else
  TIER="daily"
  RETENTION="$BACKUP_RETENTION_DAILY"
fi

TIER_DIR="$BACKUPS_ROOT/$TIER"
mkdir -p "$BACKUPS_ROOT"/{daily,weekly,monthly}

STAMP=$(date '+%Y-%m-%d-%H%M')
DB_FILE="$TIER_DIR/portfolio-db-$STAMP.dump"
LOGS_TAR="$TIER_DIR/portfolio-logs-$STAMP.tar.gz"
UPLOADS_TAR="$TIER_DIR/portfolio-uploads-$STAMP.tar.gz"
MANIFEST="$TIER_DIR/portfolio-$STAMP.manifest.txt"

log_info "=== Backup start (tier=$TIER, stamp=$STAMP) ==="

# ----------------------------------------------------------------------------
# 1) Dump PostgreSQL
# ----------------------------------------------------------------------------
if ! command -v pg_dump >/dev/null 2>&1; then
  log_error "pg_dump not found in PATH — install postgresql-client. Aborting."
  bash "$SCRIPT_DIR/notify-wrapper.sh" fail "$TIER" "$STAMP" "pg_dump missing" || true
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"
if ! pg_dump \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --username="$DB_USERNAME" \
      --format=custom \
      --no-owner \
      --no-acl \
      --file="$DB_FILE" \
      "$DB_NAME"; then
  log_error "pg_dump failed for database '$DB_NAME'."
  unset PGPASSWORD
  bash "$SCRIPT_DIR/notify-wrapper.sh" fail "$TIER" "$STAMP" "pg_dump failed" || true
  exit 1
fi
unset PGPASSWORD

DB_SIZE=$(stat -c '%s' "$DB_FILE" 2>/dev/null || echo 0)
log_info "pg_dump OK — $DB_FILE ($DB_SIZE bytes)"

# ----------------------------------------------------------------------------
# 2) Logs tarball
# ----------------------------------------------------------------------------
if [[ "$BACKUP_INCLUDE_LOGS" == "true" ]] && [[ -d "$LOG_DIR" ]]; then
  if tar -czf "$LOGS_TAR" -C "$BACKEND_DIR" logs 2>/dev/null; then
    log_info "logs archived → $LOGS_TAR"
  else
    log_warn "tar of logs/ failed (continuing)"
    LOGS_TAR=""
  fi
else
  LOGS_TAR=""
fi

# ----------------------------------------------------------------------------
# 3) Uploads tarball (conditionnel — pas de dossier uploads/ aujourd'hui)
# ----------------------------------------------------------------------------
if [[ "$BACKUP_INCLUDE_UPLOADS" == "true" ]] && [[ -d "$BACKUP_UPLOADS_PATH" ]]; then
  if tar -czf "$UPLOADS_TAR" -C "$(dirname "$BACKUP_UPLOADS_PATH")" "$(basename "$BACKUP_UPLOADS_PATH")"; then
    log_info "uploads archived → $UPLOADS_TAR"
  else
    log_warn "tar of uploads failed (continuing)"
    UPLOADS_TAR=""
  fi
else
  UPLOADS_TAR=""
fi

# ----------------------------------------------------------------------------
# 4) Manifest SHA-256 + tailles
# ----------------------------------------------------------------------------
{
  echo "# Portfolio backup manifest — $STAMP (tier=$TIER)"
  echo "# Generated at $(date -Iseconds)"
  for f in "$DB_FILE" "$LOGS_TAR" "$UPLOADS_TAR"; do
    [[ -z "$f" || ! -f "$f" ]] && continue
    sha256sum "$f"
  done
} > "$MANIFEST"
log_info "manifest written → $MANIFEST"

# ----------------------------------------------------------------------------
# 5) Uploaders distants (chacun fail-soft → flag DEST_FAILED)
# ----------------------------------------------------------------------------
DEST_FAILED=false

run_uploader() {
  local label="$1" check_var="$2" script="$3"
  if [[ -z "${!check_var:-}" ]]; then
    log_info "$label destination not configured — skipping."
    return 0
  fi
  if [[ ! -x "$script" ]] && [[ ! -f "$script" ]]; then
    log_warn "$label uploader script missing: $script"
    return 0
  fi
  log_info "$label upload starting…"
  if bash "$script" "$TIER" "$STAMP" "$TIER_DIR" >>"$LOG_FILE" 2>&1; then
    log_info "$label upload OK"
  else
    log_warn "$label upload FAILED (continuing)"
    DEST_FAILED=true
  fi
}

run_uploader "S3"     BACKUP_S3_BUCKET            "$SCRIPT_DIR/backup-upload-s3.sh"
run_uploader "SFTP"   BACKUP_SFTP_HOST            "$SCRIPT_DIR/backup-upload-sftp.sh"
run_uploader "GDrive" BACKUP_GDRIVE_RCLONE_REMOTE "$SCRIPT_DIR/backup-upload-gdrive.sh"

# ----------------------------------------------------------------------------
# 6) Rotation par tier — garde les N plus récents *par catégorie de fichier*
# ----------------------------------------------------------------------------
rotate_pattern() {
  local dir="$1" pattern="$2" keep="$3"
  [[ -d "$dir" ]] || return 0
  # find + mtime (newest first via -printf) — pas d'expansion glob du shell
  local -a matches=()
  mapfile -t matches < <(
    find "$dir" -maxdepth 1 -type f -name "$pattern" -printf '%T@\t%p\n' 2>/dev/null \
      | sort -rn | cut -f2-
  )
  local idx
  for (( idx=keep; idx<${#matches[@]}; idx++ )); do
    local old="${matches[$idx]}"
    rm -f -- "$old"
    log_info "rotated out: $old"
  done
}

for t_dir in "$BACKUPS_ROOT/daily" "$BACKUPS_ROOT/weekly" "$BACKUPS_ROOT/monthly"; do
  case "$(basename "$t_dir")" in
    daily)   KEEP="$BACKUP_RETENTION_DAILY" ;;
    weekly)  KEEP="$BACKUP_RETENTION_WEEKLY" ;;
    monthly) KEEP="$BACKUP_RETENTION_MONTHLY" ;;
  esac
  rotate_pattern "$t_dir" "portfolio-db-*.dump"          "$KEEP"
  rotate_pattern "$t_dir" "portfolio-logs-*.tar.gz"      "$KEEP"
  rotate_pattern "$t_dir" "portfolio-uploads-*.tar.gz"   "$KEEP"
  rotate_pattern "$t_dir" "portfolio-*.manifest.txt"     "$KEEP"
done

# ----------------------------------------------------------------------------
# 7) Notification finale
# ----------------------------------------------------------------------------
if $DEST_FAILED; then
  STATUS="partial"
  MSG="Local backup OK ($DB_SIZE bytes). At least one remote destination failed — check log."
  EXIT_CODE=2
else
  STATUS="ok"
  MSG="Backup completed successfully (tier=$TIER, dump=$DB_SIZE bytes, retention=$RETENTION)."
  EXIT_CODE=0
fi
log_info "=== Backup end (status=$STATUS) ==="

# Email + Discord uniquement si pertinent (échec, partiel, ou --verbose explicite)
if [[ "$STATUS" != "ok" ]] || [[ "$BACKUP_VERBOSE_NOTIFY" == "true" ]]; then
  bash "$SCRIPT_DIR/notify-wrapper.sh" "$STATUS" "$TIER" "$STAMP" "$MSG" || \
    log_warn "notification wrapper exited non-zero (ignored)"
fi

exit "$EXIT_CODE"

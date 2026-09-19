#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR"
ENV_FILE="$BACKEND_DIR/.env.production"
[[ -f "$ENV_FILE" ]] || { echo '[backup] Production environment is missing.' >&2; exit 1; }

# Read only backup settings; never evaluate environment values as shell code.
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ "$line" =~ ^(BACKUP_[A-Z_]+)=(.*)$ ]] || continue
  key="${BASH_REMATCH[1]}"; value="${BASH_REMATCH[2]}"
  if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then value="${BASH_REMATCH[1]}"; fi
  [[ -n "${!key+set}" ]] || export "$key=$value"
done < "$ENV_FILE"
[[ "${BACKUP_ENABLED:-false}" == true ]] || { echo '[backup] Disabled.'; exit 0; }

mkdir -p backups/daily
exec 8>backups/backup.lock
flock -n 8 || { echo '[backup] Another backup is running.'; exit 0; }
# Keep deployments from replacing the runtime during a backup.
exec 9>"$BACKEND_DIR/../deployment.lock"
flock -s -w 1200 9
STAMP=$(date -u '+%Y-%m-%d-%H%M%S')
NAME="portfolio-db-$STAMP.dump"
FILE="$BACKEND_DIR/backups/daily/$NAME"
TEMP="$FILE.partial"
COMPOSE=(docker compose --env-file "$ENV_FILE")
STATUS=fail

notify() {
  local image
  image=$("${COMPOSE[@]}" images -q api | head -n 1)
  [[ -n "$image" ]] || return 1
  docker run --rm --env-file "$ENV_FILE" \
    --mount "type=bind,src=$BACKEND_DIR/backups/daily,dst=/backups,readonly" \
    --mount "type=bind,src=$SCRIPT_DIR,dst=/app/scripts,readonly" \
    "$image" node scripts/backup-notify.mjs "$STATUS" "$STAMP" "$1"
}
cleanup() {
  local code=$?
  trap - EXIT
  [[ ! -f "$TEMP" ]] || rm -f -- "$TEMP"
  if (( code != 0 )) && [[ "$STATUS" == fail ]]; then
    echo '[backup] Database backup failed.' >&2
    notify failed || echo '[backup] Failure email could not be delivered.' >&2
  fi
  exit "$code"
}
trap cleanup EXIT

"${COMPOSE[@]}" exec -T database sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' > "$TEMP"
[[ -s "$TEMP" ]]
"${COMPOSE[@]}" exec -T database pg_restore --list < "$TEMP" > /dev/null
mv -- "$TEMP" "$FILE"
(cd backups/daily && sha256sum "$NAME" > "$NAME.sha256")
STATUS=ok
DRIVE=ok
if ! bash "$SCRIPT_DIR/backup-upload-gdrive.sh" daily "$STAMP" "$BACKEND_DIR/backups/daily"; then
  STATUS=partial
  DRIVE=failed
fi

# Scope deletion to this job's artifacts; the initial seed snapshot is untouched.
if ! find "$BACKEND_DIR/backups/daily" -maxdepth 1 -type f \
  -regextype posix-extended -regex '.*/portfolio-db-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}\.dump(\.sha256)?' \
  -mmin +10080 -delete; then STATUS=partial; fi
if ! notify "$DRIVE"; then STATUS=partial; fi
echo "[backup] $STAMP status=$STATUS"
[[ "$STATUS" == ok ]] || exit 2

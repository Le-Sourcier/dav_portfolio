#!/usr/bin/env bash
set -euo pipefail
set +x

[[ "${1:-}" == daily && "${2:-}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}$ ]] || exit 64
STAMP="$2"
TIER_DIR="${3:?Backup directory is required}"
REMOTE="${BACKUP_GDRIVE_RCLONE_REMOTE:-}"
DIRECTORY="${BACKUP_GDRIVE_REMOTE_DIR:-portfolio-backups}"
[[ "$REMOTE" =~ ^[a-zA-Z0-9_-]+$ && "$DIRECTORY" =~ ^[a-zA-Z0-9_-]+$ ]] || {
  echo '[gdrive] A dedicated remote and directory must be configured.' >&2; exit 1;
}
command -v rclone >/dev/null || { echo '[gdrive] rclone is not installed.' >&2; exit 1; }
DESTINATION="$REMOTE:$DIRECTORY/daily"
NAME="portfolio-db-$STAMP.dump"
for file in "$NAME" "$NAME.sha256"; do
  [[ -s "$TIER_DIR/$file" ]] || exit 1
  rclone copyto "$TIER_DIR/$file" "$DESTINATION/$file" --quiet --retries 3 --contimeout 20s --timeout 2m
done
rclone delete "$DESTINATION" --min-age 7d --max-depth 1 \
  --include '/portfolio-db-????-??-??-??????.dump' \
  --include '/portfolio-db-????-??-??-??????.dump.sha256' \
  --drive-use-trash=false --retries 3 --contimeout 20s --timeout 2m
echo '[gdrive] Upload and seven-day retention completed.'
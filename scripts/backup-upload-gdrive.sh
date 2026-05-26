#!/usr/bin/env bash
#
# backup-upload-gdrive.sh — Upload des artefacts vers Google Drive via rclone.
#
# Args : <tier> <stamp> <tier_dir>
# ENV requis : BACKUP_GDRIVE_RCLONE_REMOTE (nom du remote rclone, ex: "gdrive")
# ENV optionnel : BACKUP_GDRIVE_REMOTE_DIR (default: portfolio-backups)
#
# Setup du remote rclone : voir backend/docs/BACKUP.md.
#
set -euo pipefail
set +x

TIER="${1:?tier required}"
STAMP="${2:?stamp required}"
TIER_DIR="${3:?tier_dir required}"

: "${BACKUP_GDRIVE_RCLONE_REMOTE:?BACKUP_GDRIVE_RCLONE_REMOTE required (rclone remote name)}"
GDRIVE_DIR="${BACKUP_GDRIVE_REMOTE_DIR:-portfolio-backups}"

if ! command -v rclone >/dev/null 2>&1; then
  echo "[gdrive] rclone not found — install from https://rclone.org/install/. Aborting."
  exit 1
fi

mapfile -t files < <(find "$TIER_DIR" -maxdepth 1 -type f -name "portfolio-*-${STAMP}.*")
if [[ ${#files[@]} -eq 0 ]]; then
  echo "[gdrive] no files matching stamp $STAMP — nothing to upload"
  exit 0
fi

remote_path="${BACKUP_GDRIVE_RCLONE_REMOTE}:${GDRIVE_DIR}/${TIER}"

for f in "${files[@]}"; do
  if ! rclone copy "$f" "$remote_path" --quiet; then
    echo "[gdrive] upload failed for $(basename "$f")"
    exit 1
  fi
  echo "[gdrive] uploaded → $remote_path/$(basename "$f")"
done

exit 0

#!/usr/bin/env bash
#
# backup-upload-sftp.sh — Upload des artefacts vers un serveur SFTP.
#
# Args : <tier> <stamp> <tier_dir>
# ENV requis : BACKUP_SFTP_HOST, BACKUP_SFTP_USER, BACKUP_SFTP_REMOTE_DIR
# Auth : soit BACKUP_SFTP_KEY_PATH (chemin clé privée), soit BACKUP_SFTP_PASSWORD (via sshpass).
#
set -euo pipefail
set +x

TIER="${1:?tier required}"
STAMP="${2:?stamp required}"
TIER_DIR="${3:?tier_dir required}"

: "${BACKUP_SFTP_HOST:?BACKUP_SFTP_HOST required}"
: "${BACKUP_SFTP_USER:?BACKUP_SFTP_USER required}"
SFTP_PORT="${BACKUP_SFTP_PORT:-22}"
SFTP_DIR="${BACKUP_SFTP_REMOTE_DIR:-/backups/portfolio}"
SFTP_KEY="${BACKUP_SFTP_KEY_PATH:-}"
SFTP_PASS="${BACKUP_SFTP_PASSWORD:-}"

if ! command -v sftp >/dev/null 2>&1; then
  echo "[sftp] sftp client not found — install openssh-client. Aborting."
  exit 1
fi

mapfile -t files < <(find "$TIER_DIR" -maxdepth 1 -type f -name "portfolio-*-${STAMP}.*")
if [[ ${#files[@]} -eq 0 ]]; then
  echo "[sftp] no files matching stamp $STAMP — nothing to upload"
  exit 0
fi

# Build batch file pour sftp
batch=$(mktemp)
trap 'rm -f "$batch"' EXIT

{
  echo "-mkdir $SFTP_DIR"
  echo "-mkdir $SFTP_DIR/$TIER"
  echo "cd $SFTP_DIR/$TIER"
  for f in "${files[@]}"; do
    echo "put $f"
  done
  echo "bye"
} > "$batch"

ssh_opts=(-oStrictHostKeyChecking=accept-new -oBatchMode=yes -P "$SFTP_PORT")

if [[ -n "$SFTP_KEY" ]]; then
  if [[ ! -f "$SFTP_KEY" ]]; then
    echo "[sftp] key file not found: $SFTP_KEY"
    exit 1
  fi
  sftp -i "$SFTP_KEY" "${ssh_opts[@]}" -b "$batch" "$BACKUP_SFTP_USER@$BACKUP_SFTP_HOST"
elif [[ -n "$SFTP_PASS" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "[sftp] sshpass missing (required for password auth) — install or switch to key auth."
    exit 1
  fi
  sshpass -p "$SFTP_PASS" sftp -oBatchMode=no "${ssh_opts[@]/-oBatchMode=yes/}" -b "$batch" "$BACKUP_SFTP_USER@$BACKUP_SFTP_HOST"
else
  echo "[sftp] neither BACKUP_SFTP_KEY_PATH nor BACKUP_SFTP_PASSWORD set."
  exit 1
fi

echo "[sftp] upload OK → $BACKUP_SFTP_HOST:$SFTP_DIR/$TIER"

#!/usr/bin/env bash
#
# backup-upload-s3.sh — Upload des artefacts du tier vers un bucket S3-compatible.
# Compatible : AWS S3, Cloudflare R2, Backblaze B2 (S3 API), MinIO, Wasabi, Scaleway.
#
# Args : <tier> <stamp> <tier_dir>
# ENV requis : BACKUP_S3_BUCKET, BACKUP_S3_ACCESS_KEY_ID, BACKUP_S3_SECRET_ACCESS_KEY
# ENV optionnels : BACKUP_S3_ENDPOINT, BACKUP_S3_REGION, BACKUP_S3_PREFIX
#
set -euo pipefail
set +x

TIER="${1:?tier required}"
STAMP="${2:?stamp required}"
TIER_DIR="${3:?tier_dir required}"

: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET required}"
: "${BACKUP_S3_ACCESS_KEY_ID:?BACKUP_S3_ACCESS_KEY_ID required}"
: "${BACKUP_S3_SECRET_ACCESS_KEY:?BACKUP_S3_SECRET_ACCESS_KEY required}"
S3_REGION="${BACKUP_S3_REGION:-auto}"
S3_PREFIX="${BACKUP_S3_PREFIX:-portfolio-backups}"
S3_ENDPOINT="${BACKUP_S3_ENDPOINT:-}"

if ! command -v aws >/dev/null 2>&1; then
  echo "[s3] aws CLI not found — install with 'pip install awscli' or apt. Skipping."
  exit 1
fi

endpoint_arg=()
[[ -n "$S3_ENDPOINT" ]] && endpoint_arg=(--endpoint-url "$S3_ENDPOINT")

# Liste explicite des fichiers du stamp courant (évite de pousser le dossier entier)
mapfile -t files < <(find "$TIER_DIR" -maxdepth 1 -type f -name "portfolio-*-${STAMP}.*")
if [[ ${#files[@]} -eq 0 ]]; then
  echo "[s3] no files matching stamp $STAMP in $TIER_DIR — nothing to upload"
  exit 0
fi

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$S3_REGION"

for f in "${files[@]}"; do
  fname=$(basename "$f")
  dest="s3://$BACKUP_S3_BUCKET/$S3_PREFIX/$TIER/$fname"
  if ! aws s3 cp "$f" "$dest" "${endpoint_arg[@]}" --only-show-errors; then
    echo "[s3] upload failed for $fname"
    unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
    exit 1
  fi
  echo "[s3] uploaded → $dest"
done

unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
exit 0

#!/usr/bin/env bash
#
# notify-wrapper.sh — Pont bash → backup-notify.ts.
#
# Sépare la complexité Node (tsx + nodemailer + https) de l'orchestrateur bash,
# pour que le job principal ne crashe jamais si tsx/node a un souci.
#
# Args : <status> <tier> <stamp> <message>
#   status ∈ {ok, partial, fail}
#
set -euo pipefail

STATUS="${1:-fail}"
TIER="${2:-unknown}"
STAMP="${3:-unknown}"
MESSAGE="${4:-no message}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Si tsx n'est pas dispo (déploiement minimal), on log et on sort 0.
if ! command -v npx >/dev/null 2>&1 && [[ ! -x "$BACKEND_DIR/node_modules/.bin/tsx" ]]; then
  echo "[notify] tsx/npx unavailable — skipping email/Discord."
  exit 0
fi

cd "$BACKEND_DIR"
node_bin="$BACKEND_DIR/node_modules/.bin/tsx"
if [[ ! -x "$node_bin" ]]; then
  node_bin="npx tsx"
fi

# shellcheck disable=SC2086
$node_bin scripts/backup-notify.ts \
  --status="$STATUS" \
  --tier="$TIER" \
  --stamp="$STAMP" \
  --message="$MESSAGE" || {
    echo "[notify] backup-notify.ts returned non-zero (ignored at wrapper level)"
    exit 0
  }

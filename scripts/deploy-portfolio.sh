#!/usr/bin/env bash
set -euo pipefail

read -r action component revision extra <<< "${SSH_ORIGINAL_COMMAND:-}"
[[ "$action" == deploy && -z "${extra:-}" && "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 64
case "$component" in
  frontend) branch=frontend-platform-sync; service=website ;;
  backend) branch=backend-platform-sync; service=api ;;
  admin) branch=admin-platform-sync; service=lesourcier-admin ;;
  *) exit 64 ;;
esac

exec 9>/home/azureuser/.test/deployment.lock
flock -w 1200 9
cd "/home/azureuser/.test/.$component"
git diff --quiet && git diff --cached --quiet
git fetch origin "$branch"
[[ "$(git rev-parse FETCH_HEAD)" == "$revision" ]] || {
  echo 'Refusing to deploy a superseded or unrelated commit.' >&2
  exit 65
}
previous=$(git rev-parse HEAD)
if git show-ref --verify --quiet "refs/heads/$branch"; then
  git switch "$branch"
else
  git switch --create "$branch" "$revision"
fi
git merge --ff-only "$revision"
if docker compose --env-file .env.production up -d --build --wait --wait-timeout 180 &&
   docker compose --env-file .env.production exec -T "$service" node --test tests/deployment.test.mjs; then
  echo "Deployed $component at $revision"
else
  echo "Deployment failed; restoring $previous" >&2
  git checkout --detach "$previous"
  docker compose --env-file .env.production up -d --build --wait --wait-timeout 180
  exit 1
fi

# Admin deployment

## Contract

Deploy `admin-platform-sync` to `/home/azureuser/.test/.admin` and serve
`https://admin.lesourcier.space` through Nginx to `127.0.0.1:3051`.
Keep the existing local `admin` checkout and its uncommitted public-site changes
intact; deployment development uses the separate `admin-release` worktree.

Reuse the existing Vite build and unprivileged Node static server. Supply public
Vite configuration through a temporary BuildKit secret mount; never copy the
production environment file into image layers. Preserve SPA fallback for direct
`/admin/login` navigation. Vite intentionally embeds `VITE_*` values in browser
assets; these values must remain public configuration, never credentials.

## Plan

- [x] Identify the actual admin branch and preserve the existing local checkout.
- [x] Verify dependencies, lint, TypeScript, production build, and HTTP tests.
- [x] Configure isolated container, Nginx, HTTPS, and the admin account.
- [x] Commit and push deployment changes with an English summary.
- [x] Verify GitHub Actions deployment and public HTTPS access (run 35427187689).

## Operations

Use `docker compose --env-file .env.production up -d --build --wait`.
GitHub Actions uses the same restricted deployment key and server dispatcher as
the backend and public frontend. No existing Umbaji ports or services are changed.

The source production environment contained malformed multiline image URLs.
Its original copy is preserved privately on the server. The deployment copy
reassembles the two wrapped public image URLs and preserves all configuration.
Credentials are managed by the backend environment and never embedded in the UI.
After changing the mounted environment, rebuild with `docker compose --env-file
.env.production build --no-cache` because secret contents are not a Docker cache key.

The backend seed loaded 10 projects, 4 experiences, 12 articles, 2 testimonials,
and 1 administrator. `scripts/export-settings-seed.mjs` exports skills and
education from the admin reference data for the backend's idempotent settings
seed. Initialization is a manual operation and is never part of CI/CD.

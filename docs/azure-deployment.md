# Admin deployment

## Contract

Deploy `admin-platform-sync` to `/home/azureuser/.test/.admin` and serve
`https://admin.lesourcier.space` through Nginx to `127.0.0.1:3051`.
Keep the existing local `admin` checkout and its uncommitted public-site changes
intact; deployment development uses the separate `admin-release` worktree.

Reuse the existing Vite build and unprivileged Node static server. Inject only
the public `VITE_API_URL` at build time; never copy production environment files
into images. Preserve SPA fallback for direct `/admin/login` navigation.

## Plan

- [x] Identify the actual admin branch and preserve the existing local checkout.
- [x] Verify dependencies, lint, TypeScript, production build, and HTTP tests.
- [x] Configure isolated container, Nginx, HTTPS, and the admin account.
- [ ] Commit and push deployment changes with an English summary.
- [ ] Verify GitHub Actions deployment and public HTTPS access.

## Operations

Use `docker compose --env-file .env.production up -d --build --wait`.
GitHub Actions uses the same restricted deployment key and server dispatcher as
the backend and public frontend. No existing Umbaji ports or services are changed.

The source production environment contained malformed multiline image URLs.
Its original copy is preserved privately on the server. The deployment
environment retains the two consumed values, `VITE_API_URL` and `PORT`.
Credentials are managed by the backend environment and never embedded in the UI.

The backend seed loaded 10 projects, 4 experiences, 12 articles, 2 testimonials,
and 1 administrator. `scripts/export-settings-seed.mjs` exports skills and
education from the admin reference data for the backend's idempotent settings
seed. Initialization is a manual operation and is never part of CI/CD.

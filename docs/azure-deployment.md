# Azure deployment

## Contract

Deploy branch `premium-next-portfolio` to `/home/azureuser/.test/.frontend` on
`azure-umbaji-prod`. Serve `https://lesourcier.space` through Nginx to
`127.0.0.1:3056`. Keep existing Umbaji services unchanged.

Use Docker Compose with a production Node image, an unprivileged application
process, restart policy, and a health check. Supply `.env.production` separately;
never include secrets in Git or Docker build contexts. The public API URL is
`https://server.lesourcier.space/api`.

## CI/CD

GitHub Actions verifies every push and pull request to `premium-next-portfolio`.
Only successful branch pushes can deploy. Repository secrets
`PORTFOLIO_DEPLOY_KEY` and `PORTFOLIO_KNOWN_HOSTS` authenticate the server with a
dedicated SSH key and a pinned host key. The server restricts this key to the
deployment dispatcher from the backend repository. Deployments are serialized,
check the requested commit against the remote branch, and roll back application
code when readiness or HTTP smoke tests fail. Database migrations are not rolled back.

## Progress

- [x] Inspect local changes, branches, server services, DNS, and available ports.
- [x] Preserve the existing branded 404 implementation.
- [x] Verify lint, TypeScript, tests, and production build on the Linux server.
- [x] Commit and push reviewed changes with an English summary.
- [x] Clone the branch, transfer production environment securely, and build.
- [x] Configure Nginx and TLS; verify home, blog, and HTTP 404 responses.
- [x] Configure restricted SSH credentials and GitHub Actions workflows.
- [x] Verify the first automatic deployment from GitHub Actions (run 35381079197).

## Operations

Run `docker compose --env-file .env.production up -d --build` from the checkout.
Validate Nginx with `sudo nginx -t` before reloading. Check `/` and a nonexistent
route after deployment. For rollback, check out the previously verified commit
and rebuild the service. Never remove database volumes during rollback.

# Azure deployment

## Contract

Deploy branch `backend-platform-sync` to `/home/azureuser/.test/.backend` on
`azure-umbaji-prod`. Nginx serves `https://server.lesourcier.space` through
`127.0.0.1:3052`. Preserve the existing Umbaji services and database.

The portfolio receives a separate PostgreSQL container and persistent volume,
without a published database port. Production credentials come from the local
`.env.production`, transferred separately with restrictive permissions.
Docker overrides the database hostname to the isolated database service.
Database initialization or migration must follow the user's selected data source.

## Progress

- [x] Inspect repository, environment variable names, server ports, and DNS.
- [x] Verify existing backend TypeScript compilation.
- [x] Restore missing ESLint configuration and validate it (four existing unused-variable warnings).
- [x] Confirm an isolated empty database; initialize its schema, then disable automatic alteration.
- [x] Commit and push deployment configuration; exclude credential archives.
- [x] Clone, provision the isolated database, and start the API.
- [x] Verify HTTPS health, database-backed reads, and existing Umbaji services.
- [x] Configure restricted SSH credentials and GitHub Actions workflows.
- [x] Verify the first automatic deployment from GitHub Actions (run 35381071662).

## Operations

Run `docker compose --env-file .env.production up -d --build` from the checkout.
The API health endpoint is `/api/health`. Database storage persists independently
of application containers. Never run `docker compose down -v` during updates or
rollback. Disable automatic schema alteration after first initialization.

Keep `.env.production`, `ENVs.zip`, and database dumps out of Git and images.
TLS is managed by the server's existing Certbot installation.

The API is published only on loopback behind one Nginx proxy. Set
`TRUST_PROXY_HOPS=1` in Compose so rate limits identify the client appended by
Nginx rather than grouping all visitors under the proxy address. The application
defaults to trusting no proxy when this deployment setting is absent. Additional
client-supplied forwarding entries must not influence the selected address.

## CI/CD

GitHub Actions verifies pushes and pull requests to `backend-platform-sync`.
Successful branch pushes invoke `scripts/deploy-portfolio.sh` using a dedicated,
restricted SSH key. Install the dispatcher at `/home/azureuser/.test/deploy.sh`
and authorize the key with `restrict,command="/home/azureuser/.test/deploy.sh"`.
Configure repository secrets `PORTFOLIO_DEPLOY_KEY` and `PORTFOLIO_KNOWN_HOSTS`.
The dispatcher serializes both application deployments, accepts only the current
branch head, and restores the previous application commit if health tests fail.

`scripts/portfolio-nginx.conf` bootstraps the two HTTP virtual hosts. Install it
as a separate enabled site, validate Nginx, then let Certbot add HTTPS and redirects.
Do not overwrite the certificate-managed live configuration on later deployments.

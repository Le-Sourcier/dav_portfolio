# Azure deployment

Deploy `frontend-platform-sync` to `/home/azureuser/.test/.frontend` on
`azure-umbaji-prod`. Nginx serves `https://lesourcier.space` through the existing
`127.0.0.1:3056` upstream. The API is `https://server.lesourcier.space/api`.

The former `premium-next-portfolio` deployment was a static predecessor. The
integrated branch restores existing API loaders, localized routes and connected
forms. See [the correction tracker](production-branch-correction.md).

## Environment and CI/CD

Keep `.env.production` outside Git and Docker build contexts. Only
`NEXT_PUBLIC_API_URL` is passed as a public build argument. Provide
`REVALIDATE_SECRET` at runtime, matching the backend's value.

The workflow verifies lint, TypeScript, unit tests, dependency audits, production
build and rendered backend content before SSH deployment. Repository secrets
`PORTFOLIO_DEPLOY_KEY` and `PORTFOLIO_KNOWN_HOSTS` authenticate the restricted
server dispatcher. It accepts the integrated branch's current commit, serializes
deployments and restores the previous application revision if smoke tests fail.

Run `docker compose --env-file .env.production up -d --build` in the checkout.
The service runs as an unprivileged user, restarts automatically and exposes a
loopback-only port. Check `/fr`, `/en`, project/article detail pages and an unknown
route after deployment. Never remove database volumes during an application
rollback. Existing Umbaji services retain their original ports and configuration.

## Google ownership verification

The requested TXT record
`google-site-verification=33K23IWdaIGCD4UXTPapfeppP-maXnUF9THGDOCBmww`
was already present and confirmed against the authoritative DNS server on
September 19, 2026. No HTML tag or DNS modification was required.

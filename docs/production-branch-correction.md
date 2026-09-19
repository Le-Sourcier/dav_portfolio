# Restore the API-connected production frontend

## Problem and contract

Production was deployed from `premium-next-portfolio`, a static predecessor that
imports hardcoded content. Its configured API URL was never consumed. The existing
`frontend-platform-sync` branch already contains the localized API clients,
server-side content loaders, contact/newsletter requests and connected assistant.
The owner approved switching production to this branch on 2026-09-19.

Use the existing architecture and design. Deploy this branch at
`https://lesourcier.space` from `/home/azureuser/.test/.frontend`, keep host port
`127.0.0.1:3056`, and fetch content from `https://server.lesourcier.space/api`.
Port the locally added premium 404 design into the existing localization system.
Do not replace successful empty API results
with invented content. Existing loader failure states remain available when an
API request fails, with a bounded request timeout.

## Plan and verification

- [x] Identify the deployed branch and locate the existing API integration.
- [x] Verify the integrated branch matches GitHub before creating a clean worktree.
- [x] Carry forward secure Docker deployment and CI/CD configuration.
- [x] Update vulnerable dependencies without breaking the existing integration.
- [x] Test response envelopes, API errors, timeouts and cache behavior.
- [x] Verify rendered pages contain actual published backend project/article data.
- [x] Run lint, typecheck, tests and production build.
- [ ] Switch the deployment dispatcher and server checkout to the integrated branch.
- [ ] Verify HTTPS routes, translations, 404 responses and cache revalidation.

Secrets stay in ignored local and server environment files. Pass only public API
settings to the Docker build. The revalidation secret is runtime-only. No new
ports, Nginx upstreams or database changes are required.

## Pre-deployment results

The Linux production image passed build, TypeScript, lint (zero errors, six
pre-existing warnings), eight unit tests and two HTTP smoke tests against actual
published API content. Dependency audit reports zero vulnerabilities. The premium
404 was carried forward with matching French/English messages and API-backed
article suggestions. Invalid locale URLs now initialize the default locale before
rendering the 404, preventing a static-to-dynamic rendering error.

The obsolete `nexus-blogs` Compose configuration was removed. The active service
is `portfolio-frontend` / `website`. The existing backend dispatcher also gained
tested branch migration and rollback support so a failed switch can restore the
previous static application revision.

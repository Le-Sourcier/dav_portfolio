# Production dependency update

The September 18, 2026 deployment audit identified vulnerable application and
transitive dependencies. The user authorized compatible fixes and necessary
major upgrades before the final deployment.

The final lockfile audit reports zero vulnerabilities, including development
dependencies. Scoped overrides select patched UUID for Sequelize, qs, and esbuild;
the TypeScript ESLint parser and plugin are updated together to 8.70.0.

Update Nodemailer to 10.0.10, Sharp to 0.35.4, UUID to 14.0.2, and refresh
compatible transitive dependencies. Verify mail rendering without sending mail,
image conversion, UUID generation, and rejection of malicious JSON cast types.
Do not change application contracts or migrate existing Umbaji data.

Validation also covers lint, TypeScript, production build, API health, JSON 404
responses, and database-backed public reads against isolated PostgreSQL storage.

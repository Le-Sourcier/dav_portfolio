# Production dependency update

The September 18, 2026 deployment audit detected a critical Next.js advisory
and vulnerable transitive image and CSS dependencies. The user authorized
dependency remediation before the final deployment.

Update Next.js and its ESLint configuration together to 16.3.5 and refresh the
lockfile using compatible patched dependencies. Preserve all application routes,
the custom server, and the existing 404 design.

Validation: clean dependency audit, lint, TypeScript, production build, date unit
tests, and HTTP tests for home, blog, and branded non-indexable 404 responses.

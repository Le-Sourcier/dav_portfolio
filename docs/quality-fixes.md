# Admin release verification

The deployment baseline contained 63 ESLint errors. Remove unused imports and
bindings, replace explicit `any` casts with existing domain types, and preserve
the login, request retry, upload, editor, and settings contracts. Separate the
unused legacy authentication context value and hook from its provider so the
module satisfies the existing React Refresh rule.

Request-client regression tests cover successful envelopes, authorization
headers, expired-token refresh, failed authorization, and non-authentication
errors. Production smoke tests cover direct login navigation, SPA entry routes,
JavaScript asset content types, and the configured public API address.

Upgrade Vite to the patched 7.3.6 line and refresh compatible dependencies.
The complete dependency audit reports zero vulnerabilities. Lint reports zero
errors; ten pre-existing hook-dependency warnings remain and are not suppressed.
TypeScript and production compilation pass.

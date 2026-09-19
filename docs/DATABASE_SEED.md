# Initial production data

The user requested loading the existing repository seeds into the isolated
portfolio database. The existing `db:seed` resets projects, experiences, blog
posts, comments, and views, and inserts testimonials. It must only run during
initialization after checking that the content tables are empty and taking a
database backup. Never run it automatically on deployment.

The initial seed also creates the administrator using production environment
credentials and the model's password hashing hook. Do not log credentials.

The admin application separately supplies skills and education fallbacks from
`src/data/cvData.ts`. Export those values with the admin repository's
`scripts/export-settings-seed.mjs`, then run
`npx tsx scripts/seed-admin-settings.ts /path/to/admin-settings.json` in the backend
tools image. The settings seed validates its input and only inserts absent keys;
rerunning it preserves existing settings.

Validation: read content counts, verify the administrator password through the
existing login API without printing tokens, run the settings seed twice, and
verify the skills and education values returned by `/api/settings`.

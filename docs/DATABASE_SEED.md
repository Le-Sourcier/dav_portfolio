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

Completed initialization: 10 projects, 4 experiences, 12 blog posts, 2 testimonials,
and 1 administrator. The admin settings contain 18 skills and 1 education entry.
The second settings seed run preserved both existing records. Administrator
login, authenticated profile, CORS, and public settings checks passed.
The pre-seed backup is stored privately at
`/home/azureuser/.test/backups/before-initial-seed.dump` with mode 600.

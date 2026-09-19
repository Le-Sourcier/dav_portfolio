# Automated production database backups

## Contract

Extend the existing Bash, Docker, rclone and Nodemailer backup workflow. Produce a
PostgreSQL 16 custom-format dump every day at 00:00 UTC (confirmed by the owner).
Attach the dump and its SHA-256 manifest to an email addressed to
`BACKUP_NOTIFY_EMAIL`, using the existing `baseEmailTemplate` design. French is
the default; `BACKUP_LANGUAGE=en` selects English.

Keep artifacts for seven elapsed days on the server and in a dedicated Google
Drive directory. Mailbox copies are outside this retention policy: the job has
no mailbox deletion permission. Never delete unrelated files or the pre-seed
snapshot. Google Drive requires a separately authorized rclone remote; missing
authorization is a partial failure, never reported as success.

## Implementation plan

- [x] Inspect existing scripts, email templates and production configuration.
- [x] Replace tiered rotation with seven-day database artifact retention.
- [x] Add locking, atomic dumps, archive validation and delivery failure reporting.
- [x] Reuse the branded email template, with French and English content.
- [x] Test dump failures, retention boundaries, attachments and Drive failures.
- [x] Install a persistent midnight systemd timer and test a real backup/restore.
- [x] Verify SMTP delivery with the replacement credentials supplied by the owner.
- [ ] Authorize/test Google Drive: owner authorization is still required.
- [x] Commit, push and verify deployment.

## Production verification (2026-09-19)

Commit `e31050a` passed CI/CD (run `35444337591`): build, lint, typecheck,
15 unit/integration checks, dependency audit and isolated API smoke tests.
The persistent timer is enabled; its next execution is 2026-09-20 00:00 UTC.
Local `.env` and `.env.production`, and the server `.env.production`, have the
same enabled backup settings, French language and dedicated Drive remote name.
Secrets remain excluded from Git.

The first production dump, `portfolio-db-2026-09-19-125919.dump`, passed its
SHA-256 check and a full restore into a temporary PostgreSQL 16 container with
no network or published ports. Restored counts: 10 projects, 4 experiences,
12 blog posts, 2 testimonials and 1 administrator. The temporary database was
removed after verification; the live database was not modified.

The original SMTP credentials were rejected with response code 535. The owner
supplied replacement credentials, which were applied to both local environment
files and the server production environment. The API container was recreated
and remained healthy. At 13:04:31 UTC, SMTP accepted the email containing
`portfolio-db-2026-09-19-130429.dump` and its SHA-256 manifest. Inbox placement
is not independently verified.

The `portfolio-gdrive` remote has no OAuth authorization yet. Until Drive is
connected, the daily job writes valid local backups, emails them and exits
2 to report incomplete Drive delivery. The seven-day local retention is active;
remote retention will execute only after a successful Drive upload.

## Operations

The host runs `scripts/backup.sh` from the deployed backend checkout. PostgreSQL
tools execute inside the database container; notifications execute in the built
API image without requiring the API server to be running. No database port is
published. A nonblocking `flock` prevents overlapping jobs, restrictive umask
protects dumps, and `pg_restore --list` validates each completed archive before
delivery. Use an isolated database for full restore drills.

Exit codes: 0 complete delivery, 1 backup failure, 2 delivery/retention failure.
SMTP has bounded connection/socket timeouts. Attachments above 20 MiB trigger an
explicit error notice and a failing job, rather than a silent omission. No dump
content or credentials are written to logs. Successful SMTP acceptance does not
prove inbox placement.

Configure the existing `.env.production` keys `BACKUP_ENABLED=true`,
`BACKUP_NOTIFY_EMAIL`, `EMAIL_*`, `BACKUP_GDRIVE_RCLONE_REMOTE`, and
`BACKUP_GDRIVE_REMOTE_DIR=portfolio-backups`. The remote directory must be dedicated
to this job. The Drive uploader only rotates matching database dump/manifest
names inside its `daily/` subdirectory, after successful upload. Expired Drive
artifacts are permanently removed to enforce retention without filling trash.
If Drive upload fails, its previous recovery points are preserved.

Authenticate a dedicated rclone remote using your own Google OAuth client and
the `drive.file` scope. Keep the refresh token in the server user's private
`~/.config/rclone/rclone.conf`, mode 600; never commit it or paste it in chat.
See [rclone Drive setup](https://rclone.org/drive/) and
[filtered deletion](https://rclone.org/commands/rclone_delete/).

Install the units in `scripts/systemd/` under `/etc/systemd/system/`, then run
`systemctl daemon-reload` and `systemctl enable --now portfolio-backup.timer`.
Inspect `systemctl list-timers portfolio-backup.timer` and
`journalctl -u portfolio-backup.service`. Run a manual backup with
`systemctl start portfolio-backup.service`.

Restore a selected dump with PostgreSQL 16 `pg_restore --no-owner --no-acl
--exit-on-error --dbname=<isolated-database> <file.dump>`. Verify the SHA-256
manifest first. Do not restore over the live database without a recovery plan.

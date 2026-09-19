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
- [ ] Install a persistent midnight systemd timer and test a real backup/restore.
- [ ] Verify SMTP delivery and authorize/test Google Drive.
- [ ] Commit, push and verify deployment.

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

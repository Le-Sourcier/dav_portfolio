# Database backup operations

The production backup system runs daily at **00:00 UTC**, keeps database
artifacts for **seven elapsed days**, emails the dump and SHA-256 manifest,
and uploads both files to Google Drive.

See [Automated production database backups](AUTOMATED_BACKUP.md) for the
configuration, deployment checklist, retention contract and restore procedure.

The former daily/weekly/monthly retention and notification-only emails have
been replaced. Legacy S3/SFTP upload helpers are not invoked by the production
job. Logs and uploaded assets are outside this database-only backup scope.

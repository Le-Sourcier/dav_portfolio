import { sendBackupNotification } from "../dist/helpers/backup-notification.js";

try {
  const [status, stamp, drive] = process.argv.slice(2);
  await sendBackupNotification(status, stamp, drive);
} catch {
  // SMTP errors may contain credentials or addresses; keep the journal generic.
  console.error("[backup] Email delivery or attachment validation failed; check SMTP settings and backup permissions.");
  process.exitCode = 1;
}

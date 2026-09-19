import { baseEmailTemplate } from "./base.template.js";
import type { BackupNotice } from "../../types/backup.js";

const translations = {
  fr: {
    ok: "Sauvegarde quotidienne terminée",
    partial: "Sauvegarde quotidienne : intervention nécessaire",
    fail: "Échec de la sauvegarde quotidienne",
    greeting: "Bonjour,",
    attached: "La sauvegarde de votre base de données et son empreinte SHA-256 sont jointes à cet e-mail.",
    missing: "Aucune sauvegarde n’est jointe. Consultez le journal du service sur le serveur.",
    date: "Date de sauvegarde (UTC)",
    drive: "Copie Google Drive",
    uploaded: "Envoyée",
    failed: "Indisponible ou en échec — connexion ou configuration à vérifier",
    retention: "Conservation sur le serveur et Google Drive : 7 jours. Les copies reçues par e-mail restent dans votre boîte mail.",
    schedule: "Prochaine sauvegarde automatique : à minuit UTC.",
  },
  en: {
    ok: "Daily backup completed",
    partial: "Daily backup: action required",
    fail: "Daily backup failed",
    greeting: "Hello,",
    attached: "Your database backup and its SHA-256 checksum are attached to this email.",
    missing: "No backup is attached. Check the service journal on the server.",
    date: "Backup date (UTC)",
    drive: "Google Drive copy",
    uploaded: "Uploaded",
    failed: "Unavailable or failed — check authorization and configuration",
    retention: "Server and Google Drive retention: 7 days. Emailed copies remain in your mailbox.",
    schedule: "Next automatic backup: midnight UTC.",
  },
};

export const backupSubject = (notice: BackupNotice): string =>
  translations[notice.lang][notice.status];

export const backupEmailText = (notice: BackupNotice): string => {
  const text = translations[notice.lang];
  return [text[notice.status], notice.attached ? text.attached : text.missing,
    `${text.date}: ${notice.stamp}`, `${text.drive}: ${notice.drive === "ok" ? text.uploaded : text.failed}`,
    text.retention, text.schedule].join("\n\n");
};

export const backupEmailTemplate = (notice: BackupNotice): string => {
  const text = translations[notice.lang];
  const stamp = notice.stamp.replace(/[&<>"']/g, "");
  return baseEmailTemplate({
    title: text[notice.status], previewText: text[notice.status], lang: notice.lang,
    content: `<div class="greeting">${text.greeting}</div>
      <div class="content-text"><p><strong>${text[notice.status]}</strong></p>
      <p>${notice.attached ? text.attached : text.missing}</p>
      <div class="info-box"><ul>
        <li><span class="label">${text.date}</span>${stamp}</li>
        <li><span class="label">${text.drive}</span>${notice.drive === "ok" ? text.uploaded : text.failed}</li>
      </ul></div><p>${text.retention}</p><p>${text.schedule}</p></div>`,
  });
};

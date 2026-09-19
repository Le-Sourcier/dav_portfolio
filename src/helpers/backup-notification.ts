import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { z } from "zod";
import { backupEmailTemplate, backupEmailText, backupSubject } from "../views/emails/backup.template.js";
import type { BackupNotice } from "../types/backup.js";

const noticeSchema = z.object({
  status: z.enum(["ok", "partial", "fail"]),
  stamp: z.string().regex(/^\d{4}-\d{2}-\d{2}-\d{6}$/),
  drive: z.enum(["ok", "failed"]),
  lang: z.enum(["fr", "en"]).default("fr"),
});
const smtpSchema = z.object({
  BACKUP_NOTIFY_EMAIL: z.string().email(),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  EMAIL_SECURE: z.enum(["true", "false"]).default("false"),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASS: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
});

export async function prepareBackupEmail(
  status: string, stamp: string, drive: string, lang = "fr", directory = "/backups",
): Promise<{ mail: SendMailOptions; deliveryError: boolean }> {
  const parsed = noticeSchema.parse({ status, stamp, drive, lang });
  const notice: BackupNotice = { ...parsed, attached: false };
  const attachments: NonNullable<SendMailOptions["attachments"]> = [];
  let deliveryError = false;
  if (parsed.status !== "fail") {
    const filename = `portfolio-db-${parsed.stamp}.dump`;
    try {
      const file = join(directory, filename);
      const info = await stat(file);
      if (!info.isFile() || info.size === 0 || info.size > 20 * 1024 * 1024) {
        throw new Error("Backup attachment exceeds the permitted size or is empty.");
      }
      const content = await readFile(file);
      const manifest = await readFile(`${file}.sha256`, "utf8");
      const expected = `${createHash("sha256").update(content).digest("hex")}  ${filename}\n`;
      if (manifest !== expected) throw new Error("Backup checksum mismatch.");
      attachments.push({ filename, content, contentType: "application/octet-stream" },
        { filename: `${filename}.sha256`, content: manifest, contentType: "text/plain" });
      notice.attached = true;
    } catch {
      deliveryError = true;
      notice.status = "partial";
    }
  }
  return {
    mail: { subject: backupSubject(notice), text: backupEmailText(notice), html: backupEmailTemplate(notice), attachments },
    deliveryError,
  };
}

export async function sendBackupNotification(status: string, stamp: string, drive: string): Promise<void> {
  const settings = smtpSchema.parse(process.env);
  const { mail, deliveryError } = await prepareBackupEmail(status, stamp, drive, process.env.BACKUP_LANGUAGE);
  const transporter = nodemailer.createTransport({
    host: settings.EMAIL_HOST, port: settings.EMAIL_PORT,
    secure: settings.EMAIL_SECURE === "true", requireTLS: true,
    auth: { user: settings.EMAIL_USER, pass: settings.EMAIL_PASS },
    connectionTimeout: 30_000, greetingTimeout: 30_000, socketTimeout: 120_000,
  });
  try {
    const result = await transporter.sendMail({ ...mail, from: settings.EMAIL_FROM, to: settings.BACKUP_NOTIFY_EMAIL });
    if (!result.accepted.length || result.rejected.length) throw new Error("SMTP rejected the backup recipient.");
    console.log("[backup] SMTP accepted the backup email.");
  } finally {
    transporter.close();
  }
  if (deliveryError) throw new Error("The backup could not be attached; an error notice was sent.");
}

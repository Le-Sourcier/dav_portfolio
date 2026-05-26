/**
 * backup-notify.ts — Envoi des notifications de backup (email + Discord).
 *
 * Volontairement indépendant de `src/config/index.ts` : ce script doit pouvoir
 * tourner depuis cron même si le runtime principal est cassé. Il lit donc ses
 * variables d'env directement via dotenv et instancie son propre transporteur
 * nodemailer minimal — pas de couplage au lifecycle de l'app.
 *
 * Discord : requête HTTPS native (zero new dependency, axios non installé).
 *
 * Usage (via notify-wrapper.sh) :
 *   tsx scripts/backup-notify.ts --status=ok|partial|fail \
 *     --tier=daily --stamp=YYYY-MM-DD-HHMM --message="..."
 */

import { URL } from "node:url";
import https from "node:https";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

type Status = "ok" | "partial" | "fail";

interface Args {
  status: Status;
  tier: string;
  stamp: string;
  message: string;
}

const STATUS_STYLE: Record<Status, { color: number; emoji: string; label: string }> = {
  ok:      { color: 0x22c55e, emoji: "✅", label: "Backup OK" },
  partial: { color: 0xf59e0b, emoji: "⚠️",  label: "Backup PARTIEL" },
  fail:    { color: 0xef4444, emoji: "🔥", label: "Backup ÉCHEC" },
};

function parseArgs(argv: string[]): Args {
  const result: Partial<Args> = {};
  for (const raw of argv.slice(2)) {
    const match = raw.match(/^--([a-z]+)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === "status" && (value === "ok" || value === "partial" || value === "fail")) {
      result.status = value;
    } else if (key === "tier") result.tier = value;
    else if (key === "stamp") result.stamp = value;
    else if (key === "message") result.message = value;
  }
  return {
    status: result.status ?? "fail",
    tier: result.tier ?? "unknown",
    stamp: result.stamp ?? "unknown",
    message: result.message ?? "(no message)",
  };
}

function buildEmailHtml(args: Args): string {
  const style = STATUS_STYLE[args.status];
  const ownerName = process.env.OWNER_NAME || "Portfolio";
  return `
<!doctype html>
<html lang="fr"><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden">
    <div style="padding:18px 22px;background:#${style.color.toString(16).padStart(6, "0")};color:#0a0a0a;font-weight:700;font-size:15px">
      ${style.emoji}&nbsp;${style.label} — ${ownerName}
    </div>
    <div style="padding:22px">
      <table cellspacing="0" cellpadding="6" style="width:100%;font-size:14px;color:#d4d4d4">
        <tr><td style="opacity:.6;width:96px">Tier</td><td><code>${args.tier}</code></td></tr>
        <tr><td style="opacity:.6">Stamp</td><td><code>${args.stamp}</code></td></tr>
        <tr><td style="opacity:.6">Date</td><td>${new Date().toLocaleString("fr-FR")}</td></tr>
        <tr><td style="opacity:.6;vertical-align:top">Message</td><td>${escapeHtml(args.message)}</td></tr>
      </table>
      <p style="margin-top:18px;font-size:12px;opacity:.5">Logs : backend/logs/backup.log</p>
    </div>
  </div>
</body></html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendDiscordNotice(webhookUrl: string, args: Args): Promise<void> {
  const style = STATUS_STYLE[args.status];
  const payload = JSON.stringify({
    username: "Portfolio Backup",
    embeds: [
      {
        title: `${style.emoji} ${style.label}`,
        description: args.message,
        color: style.color,
        fields: [
          { name: "Tier", value: args.tier, inline: true },
          { name: "Stamp", value: args.stamp, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const url = new URL(webhookUrl);
  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Discord webhook responded ${res.statusCode}`));
        }
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function sendEmailNotice(to: string, args: Args): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  });
  const style = STATUS_STYLE[args.status];
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Portfolio Backup <${process.env.EMAIL_USER}>`,
    to,
    subject: `${style.emoji} ${style.label} — ${args.tier}/${args.stamp}`,
    text: `${style.label}\nTier: ${args.tier}\nStamp: ${args.stamp}\nMessage: ${args.message}`,
    html: buildEmailHtml(args),
  });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const emailTo = process.env.BACKUP_NOTIFY_EMAIL || "";
  const discord = process.env.BACKUP_NOTIFY_DISCORD_WEBHOOK || "";

  const tasks: Array<Promise<void>> = [];
  if (emailTo && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    tasks.push(
      sendEmailNotice(emailTo, args).catch((err: unknown) => {
        console.error(`[notify] email failed:`, (err as Error).message);
      }),
    );
  } else {
    console.log("[notify] email skipped (BACKUP_NOTIFY_EMAIL or SMTP creds missing)");
  }

  if (discord) {
    tasks.push(
      sendDiscordNotice(discord, args).catch((err: unknown) => {
        console.error(`[notify] discord failed:`, (err as Error).message);
      }),
    );
  } else {
    console.log("[notify] discord skipped (BACKUP_NOTIFY_DISCORD_WEBHOOK missing)");
  }

  await Promise.all(tasks);
}

main().catch((err: unknown) => {
  console.error("[notify] fatal:", (err as Error).message);
  process.exit(0); // ne casse jamais le job de backup
});

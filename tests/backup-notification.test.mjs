import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm, truncate } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { prepareBackupEmail } from "../dist/helpers/backup-notification.js";

const stamp = "2026-09-19-000000";
const filename = `portfolio-db-${stamp}.dump`;

test("branded French email contains the verified dump and checksum as real MIME attachments", async () => {
  const directory = await mkdtemp(join(tmpdir(), "backup-mail-"));
  try {
    const content = Buffer.from("PGDMP test archive");
    await writeFile(join(directory, filename), content);
    await writeFile(join(directory, `${filename}.sha256`), `${createHash("sha256").update(content).digest("hex")}  ${filename}\n`);
    const { mail, deliveryError } = await prepareBackupEmail("ok", stamp, "ok", "fr", directory);
    assert.equal(deliveryError, false);
    assert.match(mail.html, /brand\/logo-horizontal-clean.png/);
    assert.match(mail.html, /class="card-accent"/);
    assert.match(mail.html, /Sauvegarde quotidienne terminée/);
    assert.match(mail.html, /7 jours/);
    assert.equal(mail.attachments.length, 2);
    assert.deepEqual(mail.attachments[0].content, content);
    const result = await nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail({
      ...mail, from: "backup@example.com", to: "owner@example.com",
    });
    assert.match(result.message.toString(), /multipart\/mixed/);
    assert.match(result.message.toString(), /Content-Disposition: attachment/);
    assert.match(result.message.toString(), new RegExp(filename.replaceAll(".", "\\.")));
    const partial = await prepareBackupEmail("partial", stamp, "failed", "en", directory);
    assert.match(partial.mail.html, /action required/);
    assert.equal(partial.mail.attachments.length, 2);
    await writeFile(join(directory, `${filename}.sha256`), "corrupt");
    const corrupt = await prepareBackupEmail("ok", stamp, "ok", "fr", directory);
    assert.equal(corrupt.deliveryError, true);
    assert.equal(corrupt.mail.attachments.length, 0);
    await truncate(join(directory, filename), 21 * 1024 * 1024);
    const oversized = await prepareBackupEmail("ok", stamp, "ok", "fr", directory);
    assert.equal(oversized.deliveryError, true);
    assert.match(oversized.mail.html, /Aucune sauvegarde/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("failed backups have no attachments; missing files and unsafe inputs fail honestly", async () => {
  const failed = await prepareBackupEmail("fail", stamp, "failed", "en");
  assert.equal(failed.mail.attachments.length, 0);
  assert.match(failed.mail.html, /Daily backup failed/);
  const missing = await prepareBackupEmail("ok", stamp, "ok", "en", "/nonexistent-backup-directory");
  assert.equal(missing.deliveryError, true);
  await assert.rejects(prepareBackupEmail("ok", "../../secrets", "ok"));
  await assert.rejects(prepareBackupEmail("ok", stamp, "ok", "unsupported"));
});

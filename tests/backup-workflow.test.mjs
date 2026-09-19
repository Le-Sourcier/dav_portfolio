import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, readdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "backup-workflow-"));
  await Promise.all(["scripts", "bin", "backups/daily"].map(path => mkdir(join(root, path), { recursive: true })));
  for (const file of ["backup.sh", "backup-upload-gdrive.sh"]) {
    await copyFile(new URL(`../scripts/${file}`, import.meta.url), join(root, "scripts", file));
  }
  await writeFile(join(root, ".env.production"), "BACKUP_ENABLED=true\nBACKUP_GDRIVE_RCLONE_REMOTE=gdrive\n");
  await writeFile(join(root, "bin/docker"), `#!/bin/bash
printf '%s\\n' "$*" >> "$FIXTURE/docker.log"
case "$*" in
  *'images -q api'*) echo image ;;
  *'pg_dump'*) [[ "$FAIL_DUMP" != 1 ]] || exit 1; printf PGDMP ;;
  *'pg_restore'*) cat >/dev/null; [[ "$FAIL_RESTORE" != 1 ]] ;;
  'run '*) [[ "$FAIL_EMAIL" != 1 ]] ;;
esac
`, { mode: 0o700 });
  await writeFile(join(root, "bin/rclone"), `#!/bin/bash
printf '%s\\n' "$*" >> "$FIXTURE/rclone.log"
[[ "$FAIL_DRIVE" != 1 ]]
`, { mode: 0o700 });
  return root;
}

function run(root, overrides = {}) {
  return spawnSync("bash", [join(root, "scripts/backup.sh")], {
    env: { ...process.env, PATH: `${root}/bin:${process.env.PATH}`, FIXTURE: root, ...overrides }, encoding: "utf8",
  });
}

test("complete backup validates the archive, attaches it, and only rotates owned files older than seven days", async () => {
  const root = await fixture();
  try {
    const daily = join(root, "backups/daily");
    for (const [name, age] of [["portfolio-db-2020-01-01-000000.dump", 8], ["portfolio-db-2020-01-02-000000.dump", 6], ["unrelated.dump", 8]]) {
      const file = join(daily, name);
      await writeFile(file, "old");
      const date = new Date(Date.now() - age * 86400_000);
      await utimes(file, date, date);
    }
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    const names = await readdir(daily);
    assert.ok(!names.includes("portfolio-db-2020-01-01-000000.dump"));
    assert.ok(names.includes("portfolio-db-2020-01-02-000000.dump"));
    assert.ok(names.includes("unrelated.dump"));
    assert.ok(names.some(name => name.endsWith(".sha256")));
    assert.ok(!names.some(name => name.endsWith(".partial")));
    const log = await readFile(join(root, "docker.log"), "utf8");
    assert.ok(log.indexOf("pg_restore") < log.indexOf("backup-notify.mjs"));
    assert.match(log, /backup-notify.mjs ok \S+ ok/);
    const drive = await readFile(join(root, "rclone.log"), "utf8");
    assert.match(drive, /delete gdrive:portfolio-backups\/daily --min-age 7d/);
    assert.match(drive, /--drive-use-trash=false/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

for (const failure of ["FAIL_DUMP", "FAIL_RESTORE", "FAIL_DRIVE", "FAIL_EMAIL"]) {
  test(`${failure} produces a failing job without deleting the last valid dump`, async () => {
    const root = await fixture();
    try {
      const critical = failure === "FAIL_DUMP" || failure === "FAIL_RESTORE";
      const result = run(root, { [failure]: "1" });
      assert.equal(result.status, critical ? 1 : 2, result.stderr);
      const names = await readdir(join(root, "backups/daily"));
      assert.equal(names.some(name => name.endsWith(".dump")), !critical);
      assert.ok(!names.some(name => name.endsWith(".partial")));
      const log = await readFile(join(root, "docker.log"), "utf8");
      if (critical) assert.match(log, /backup-notify.mjs fail/);
      if (failure === "FAIL_DRIVE") {
        assert.match(log, /backup-notify.mjs partial \S+ failed/);
        assert.doesNotMatch(await readFile(join(root, "rclone.log"), "utf8"), /delete /);
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  });
}

test("unsafe Drive paths cannot upload or delete outside the dedicated folder", async () => {
  const root = await fixture();
  try {
    const result = run(root, { BACKUP_GDRIVE_REMOTE_DIR: "../unrelated" });
    assert.equal(result.status, 2);
    await assert.rejects(readFile(join(root, "rclone.log")));
  } finally { await rm(root, { recursive: true, force: true }); }
});

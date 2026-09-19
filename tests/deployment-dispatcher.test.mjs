import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

for (const fail of [false, true]) {
  test(`frontend branch migration ${fail ? "rolls back to the original commit on failed readiness" : "deploys the verified API-connected commit"}`, async () => {
    const root = await mkdtemp(join(tmpdir(), "deployment-dispatcher-"));
    try {
      await mkdir(join(root, ".frontend"));
      await mkdir(join(root, "bin"));
      const source = await readFile(new URL("../scripts/deploy-portfolio.sh", import.meta.url), "utf8");
      await writeFile(join(root, "deploy.sh"), source.replaceAll("/home/azureuser/.test", root));
      await writeFile(join(root, "bin/git"), `#!/bin/bash
echo "git $*" >> "$FIXTURE/actions.log"
case "$*" in
  'rev-parse FETCH_HEAD') echo aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ;;
  'rev-parse HEAD') echo bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb ;;
  'show-ref '*) exit 1 ;;
esac
`, { mode: 0o700 });
      await writeFile(join(root, "bin/docker"), `#!/bin/bash
echo "docker $*" >> "$FIXTURE/actions.log"
if [[ "$FAIL_DEPLOY" == 1 && ! -f "$FIXTURE/failed" ]]; then touch "$FIXTURE/failed"; exit 1; fi
`, { mode: 0o700 });
      const result = spawnSync("bash", [join(root, "deploy.sh")], {
        encoding: "utf8", env: { ...process.env, PATH: `${root}/bin:${process.env.PATH}`, FIXTURE: root,
          FAIL_DEPLOY: fail ? "1" : "0", SSH_ORIGINAL_COMMAND: "deploy frontend aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      });
      assert.equal(result.status, fail ? 1 : 0, result.stderr);
      const log = await readFile(join(root, "actions.log"), "utf8");
      assert.match(log, /git switch --create frontend-platform-sync a{40}/);
      assert.ok(log.indexOf("git rev-parse HEAD") < log.indexOf("git switch"));
      if (fail) assert.match(log, /git checkout --detach b{40}/);
      else assert.doesNotMatch(log, /git checkout/);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
}

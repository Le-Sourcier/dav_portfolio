import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const env = {
  ...process.env,
  JWT_SECRET: 'test-only',
  JWT_REFRESH_SECRET: 'test-only',
  VISITOR_JWT_SECRET: 'test-only',
  ADMIN_PASSWORD: 'test-only',
};

test('settings seeding requires an explicit input file', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/seed-admin-settings.ts'], { env, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Provide the exported admin settings JSON path/);
});

test('invalid settings are rejected before a database connection', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-seed-test-'));
  try {
    const path = join(directory, 'invalid.json');
    writeFileSync(path, JSON.stringify({ skills: { frontend: 'invalid' }, education: { items: [] } }));
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/seed-admin-settings.ts', path], { env, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Expected array/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

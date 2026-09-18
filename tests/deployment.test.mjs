import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.TEST_API_URL || 'http://127.0.0.1:3052';

test('API health preserves the success contract', async () => {
  const response = await fetch(new URL('/api/health', origin));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.message, 'API is running');
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
});

test('database-backed public routes are readable', async () => {
  for (const path of ['/api/projects', '/api/blog', '/api/experiences']) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, path);
    assert.equal((await response.json()).success, true, path);
  }
});

test('unknown API routes return JSON with HTTP 404', async () => {
  const response = await fetch(new URL('/api/deployment-check-missing', origin));
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
});

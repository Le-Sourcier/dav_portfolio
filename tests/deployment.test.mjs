import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3056';

test('home and blog remain accessible', async () => {
  for (const path of ['/', '/blog']) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
  }
});

test('unknown routes return a branded, non-indexable HTTP 404', async () => {
  const response = await fetch(new URL('/deployment-check-missing-page', origin));
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /notfound-page/);
  assert.match(html, /noindex/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/blog"/);
});

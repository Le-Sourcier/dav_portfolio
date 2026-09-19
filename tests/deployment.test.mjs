import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:3051';

test('admin entry and login routes serve the SPA', async () => {
  for (const path of ['/', '/admin', '/admin/login']) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(await response.text(), /id="root"/);
  }
});

test('production JavaScript assets resolve with the correct content type', async () => {
  const html = await (await fetch(origin)).text();
  const asset = html.match(/src="([^\"]+\.js)"/);
  assert.ok(asset, 'The HTML must reference a built JavaScript asset');
  const response = await fetch(new URL(asset[1], origin));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /javascript/);
  assert.match(await response.text(), /https:\/\/server\.lesourcier\.space\/api/);
});

import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';

process.env.TRUST_PROXY_HOPS = '1';
process.env.JWT_SECRET = 'test-only';
process.env.JWT_REFRESH_SECRET = 'test-only';
process.env.ADMIN_PASSWORD = 'test-only';
process.env.VISITOR_JWT_SECRET = 'test-only';
const { config } = await import('../dist/config/index.js');

test('one trusted proxy selects the real client and ignores forged earlier hops', async () => {
  const app = express();
  app.set('trust proxy', config.trustProxy);
  app.get('/', (req, res) => res.json({ ip: req.ip }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(url, {
      headers: { 'X-Forwarded-For': '198.51.100.99, 203.0.113.42' },
    });
    assert.deepEqual(await response.json(), { ip: '203.0.113.42' });
    const direct = await fetch(url);
    assert.deepEqual(await direct.json(), { ip: '127.0.0.1' });
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

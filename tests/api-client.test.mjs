import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/api/client.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function createClient(responses, initialTokens = {}) {
  const values = new Map(Object.entries(initialTokens));
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const requests = [];
  const fetch = async (url, options) => {
    requests.push({ url, options });
    const response = responses.shift();
    assert.ok(response, 'Unexpected additional request');
    return Response.json(response.body, { status: response.status });
  };
  const exports = {};
  const require = () => ({ envConfig: { apiUrl: 'https://api.example.com', apiTimeout: 5000 } });
  new Function('exports', 'require', 'fetch', 'localStorage', 'sessionStorage', compiled)(
    exports, require, fetch, storage, storage,
  );
  return { client: exports.apiClient, requests, values };
}

test('successful responses retain their envelope contract and authentication', async () => {
  const { client, requests } = createClient([
    { status: 200, body: { success: true, data: { count: 4 } } },
  ], { admin_token: 'token' });
  assert.deepEqual(await client.get('/projects'), { count: 4 });
  assert.equal(requests[0].options.headers.Authorization, 'Bearer token');
});

test('expired access tokens refresh and retry once', async () => {
  const { client, requests, values } = createClient([
    { status: 401, body: { message: 'Expired' } },
    { status: 200, body: { data: { token: 'new-token' } } },
    { status: 200, body: { data: { id: 'project' } } },
  ], { admin_token: 'old-token', admin_refresh_token: 'refresh' });
  assert.deepEqual(await client.get('/projects'), { id: 'project' });
  assert.equal(requests.length, 3);
  assert.equal(values.get('admin_token'), 'new-token');
  assert.equal(requests[2].options.headers.Authorization, 'Bearer new-token');
});

test('unauthorized requests without a refresh token clear the session', async () => {
  const { client, values } = createClient([
    { status: 401, body: { message: 'Unauthorized' } },
  ], { admin_token: 'expired' });
  await assert.rejects(client.get('/projects'), /Unauthorized/);
  assert.equal(values.has('admin_token'), false);
});

test('non-authentication failures preserve the current session', async () => {
  const { client, values } = createClient([
    { status: 500, body: { message: 'Unavailable' } },
  ], { admin_token: 'valid' });
  await assert.rejects(client.get('/projects'), /Unavailable/);
  assert.equal(values.get('admin_token'), 'valid');
});

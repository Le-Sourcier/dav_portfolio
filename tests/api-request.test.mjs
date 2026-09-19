import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

function loadClient(timeout = 1000) {
  const source = readFileSync(new URL("../src/services/portfolio/apiRequest.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  const require = name => {
    assert.equal(name, "@/config/env");
    return { envConfig: { apiUrl: "https://api.example.test/api", apiTimeout: timeout } };
  };
  new Function("require", "exports", compiled.outputText)(require, exports);
  return exports.requestApi;
}

test("API content is unwrapped without replacing successful empty results", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return Response.json({ success: true, data: [{ title: "Published backend project" }] });
  });
  const request = loadClient();
  assert.deepEqual(await request("/projects", { tags: ["projects"] }), [{ title: "Published backend project" }]);
  assert.equal(calls[0].url, "https://api.example.test/api/projects");
  assert.deepEqual(calls[0].options.next, { revalidate: 60, tags: ["projects"] });
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ success: true, data: [] }));
  assert.deepEqual(await request("/projects"), []);
});

test("HTTP and application errors reject instead of masquerading as live content", async t => {
  const request = loadClient();
  t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  await assert.rejects(request("/projects"), /503/);
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ success: false, message: "API failure" }));
  await assert.rejects(request("/projects"), /API failure/);
  globalThis.fetch.mock.mockImplementation(async () => new Response("not JSON"));
  await assert.rejects(request("/projects"), SyntaxError);
});

test("unresponsive API requests time out and no-store omits revalidation options", async t => {
  const keepAlive = setTimeout(() => {}, 1000);
  t.after(() => clearTimeout(keepAlive));
  t.mock.method(globalThis, "fetch", (_url, options) => {
    assert.equal(options.cache, "no-store");
    assert.equal(options.next, undefined);
    return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true }));
  });
  await assert.rejects(loadClient(20)("/projects", { cache: "no-store" }), { name: "TimeoutError" });
});

test("premium recovery translations have matching French and English keys", () => {
  const read = locale => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")).NotFoundPremium;
  const flatten = (object, prefix = "") => Object.entries(object).flatMap(([key, value]) =>
    typeof value === "string" ? [prefix + key] : flatten(value, `${prefix}${key}.`));
  assert.deepEqual(flatten(read("fr")).sort(), flatten(read("en")).sort());
  assert.ok(flatten(read("fr")).length > 40);
});

test("globe geometry is reproducible and remains inside its configured radius", () => {
  const source = readFileSync(new URL("../src/utils/globePoints.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  new Function("exports", compiled.outputText)(exports);
  const points = exports.createGlobePoints(800, 15, 55);
  assert.deepEqual(points, exports.createGlobePoints(800, 15, 55));
  assert.equal(points.length, 2400);
  for (let index = 0; index < points.length; index += 3) {
    const radius = Math.hypot(...points.slice(index, index + 3));
    assert.ok(radius >= 15 - 1e-9 && radius <= 55 + 1e-9);
  }
  assert.deepEqual(exports.createGlobePoints(0, 15), []);
});

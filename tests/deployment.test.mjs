import assert from "node:assert/strict";
import { test } from "node:test";

const origin = process.env.TEST_BASE_URL || "http://127.0.0.1:3056";
const api = process.env.NEXT_PUBLIC_API_URL || "https://server.lesourcier.space/api";
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");

async function page(path) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  return response.text();
}

test("French and English routes render actual published API content", async () => {
  const responses = await Promise.all(["/projects", "/blog"].map(path => fetch(`${api}${path}`)));
  for (const response of responses) assert.equal(response.status, 200);
  const [{ data: projects }, { data: posts }] = await Promise.all(responses.map(response => response.json()));
  assert.ok(projects.length > 0, "Production smoke test requires published backend projects");
  assert.ok(posts.length > 0, "Production smoke test requires published backend articles");
  for (const locale of ["fr", "en"]) {
    const projectPage = await page(`/${locale}/projects`);
    const blogPage = await page(`/${locale}/blog`);
    assert.ok(projectPage.includes(`/projects/${projects[0].slug}`), "API project route must be rendered");
    assert.ok(blogPage.includes(`/blog/${posts[0].slug}`), "API article route must be rendered");
    await page(`/${locale}/projects/${projects[0].slug}`);
    await page(`/${locale}/blog/${posts[0].slug}`);
  }
  const home = await page("/fr");
  const featured = projects.find(project => project.featured) || projects[0];
  assert.ok(home.includes(`/projects/${featured.slug}`), "Home must use backend projects");
  assert.ok((await page("/fr/blog")).includes(escapeHtml(posts[0].title)), "Article title must match backend data");
});

test("root redirects to a localized homepage and unknown routes retain the premium 404", async () => {
  const root = await fetch(origin, { redirect: "manual" });
  assert.ok([307, 308].includes(root.status));
  assert.match(root.headers.get("location"), /\/(fr|en)$/);
  const response = await fetch(new URL("/deployment-check-missing-page", origin));
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /notfound-page/);
  assert.match(html, /noindex/);
  assert.match(html, /notfound-route-card/);
  assert.doesNotMatch(html, /NotFoundPremium\./);
});

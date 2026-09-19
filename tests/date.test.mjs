import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/date.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const dateHelpers = {};
new Function('exports', compiled)(dateHelpers);

test('article dates retain the existing French format', () => {
  assert.equal(dateHelpers.formatArticleDate('2026-09-18T12:00:00Z'), '18 septembre 2026');
});

test('short dates use the compact French month', () => {
  assert.equal(dateHelpers.formatShortDate('2026-09-18T12:00:00Z'), '18 sept. 2026');
});

test('leap-day dates remain valid in both formats', () => {
  assert.equal(dateHelpers.formatArticleDate('2024-02-29T12:00:00Z'), '29 février 2024');
  assert.equal(dateHelpers.formatShortDate('2024-02-29T12:00:00Z'), '29 févr. 2024');
});

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { test } from 'node:test';
import i18next from 'i18next';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { initReactI18next, useTranslation } from 'react-i18next';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const config = readFileSync(join(sourceRoot, 'i18n/index.ts'), 'utf8');
const compiled = ts.transpileModule(config, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;

function initializeTranslations() {
  const instance = i18next.createInstance();
  const load = name => {
    if (name === 'i18next') return instance;
    if (name === 'react-i18next') return { initReactI18next };
    if (name.startsWith('./locales/')) return require(join(sourceRoot, 'i18n', name));
    return require(name);
  };
  new Function('exports', 'require', compiled)({}, load);
  return instance;
}

function WelcomeLabel() {
  const { t } = useTranslation();
  return createElement('label', null, t('settings.chatbot.welcomeMessage'));
}

function collectKeys(directory, keys = new Set()) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      collectKeys(path, keys);
    } else if (/\.tsx?$/.test(path)) {
      const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = node => {
        if (ts.isCallExpression(node) && node.expression.getText(source) === 't' &&
            node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
          keys.add(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
  return keys;
}

test('the admin initializes translations before rendering React', () => {
  const main = readFileSync(join(sourceRoot, 'main.tsx'), 'utf8');
  assert.match(main, /import\s+["']\.\/i18n["']/);
  const instance = initializeTranslations();
  assert.equal(instance.isInitialized, true);
  assert.equal(instance.resolvedLanguage, 'fr');
  assert.equal(instance.t('settings.chatbot.welcomeMessage'), 'Message de bienvenue');
  assert.equal(renderToStaticMarkup(createElement(WelcomeLabel)), '<label>Message de bienvenue</label>');
});

test('every referenced key resolves in French and English', async () => {
  const instance = initializeTranslations();
  const keys = collectKeys(sourceRoot);
  assert.ok(keys.size >= 64);
  for (const language of ['fr', 'en']) {
    await instance.changeLanguage(language);
    for (const key of keys) {
      assert.equal(instance.exists(key, { lng: language, fallbackLng: false }), true, `${language}: ${key}`);
      assert.notEqual(instance.t(key), key, `${language}: ${key}`);
    }
  }
  assert.equal(instance.t('settings.chatbot.welcomeMessage'), 'Welcome Message');
  assert.equal(renderToStaticMarkup(createElement(WelcomeLabel)), '<label>Welcome Message</label>');
});

test('unsupported languages fall back to French', async () => {
  const instance = initializeTranslations();
  await instance.changeLanguage('de');
  assert.equal(instance.t('settings.chatbot.welcomeMessage'), 'Message de bienvenue');
});

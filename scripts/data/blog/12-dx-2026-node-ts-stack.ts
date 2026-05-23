import type { BlogPostSeed } from "../types.js";

const content = `> Choisir son socle Node.js + TypeScript en 2026, c'est moins une question de mode qu'une question de DX cumulée sur 2 ans. Voici la stack que j'utilise par défaut et pourquoi.

## 1. Pourquoi la DX compte autant

La DX (Developer Experience) n'est pas un confort, c'est un investissement. Une stack qui vous fait perdre 15 minutes par jour à attendre des builds ou décoder des erreurs absconses, c'est 60 heures par an et par développeur. Sur une équipe de 4, c'est l'équivalent d'un mi-temps perdu.

Cet article condense la stack que j'utilise en 2026 par défaut, avec les arbitrages qui m'ont mené là. Pas de "tu dois utiliser ça" — des critères pour décider.

## 2. Le runtime — Node, Deno ou Bun ?

Trois prétendants en 2026, contexte par contexte :

| Critère | Node 22 LTS | Bun 1.x | Deno 2.x |
|---------|-------------|---------|----------|
| Maturité prod | ★★★★★ | ★★★ | ★★★★ |
| Performance | ★★★ | ★★★★★ | ★★★★ |
| Écosystème npm | ★★★★★ | ★★★★ | ★★★★ |
| Outils intégrés | ★★ | ★★★★★ | ★★★★★ |
| TypeScript natif | Avec --experimental | Oui | Oui |
| Adoption hosting | Toutes plateformes | Limitée | Croissante |

**Mon défaut** : Node 22 LTS. Raisons :
- Maturité absolue, support hosting universel
- Compatibilité totale avec l'écosystème
- Performance largement suffisante pour 95 % des cas

**Bun** : pour les workloads très perf-critiques (parseurs, transformateurs, tests massifs). Le démarrage 4x plus rapide change la donne en CI.

**Deno** : pour les projets edge / serverless courts. Le modèle de permissions et l'imports HTTPS natifs sont élégants, mais la friction de l'écosystème pèse.

## 3. Le bundler — esbuild ou Vite ?

Pour une app web : **Vite**, point. La DX est sans concurrence : démarrage en moins d'1 seconde, HMR instantané, support TypeScript et JSX natifs, écosystème de plugins riche.

Pour un service backend : **esbuild**, parce qu'on n'a pas besoin du serveur de dev de Vite. esbuild en mode \`watch\` rebundle en <200ms, parfait pour les tests rapides.

Pour publier un package npm : **tsup** (wrapper esbuild) ou **tsdown**. Génère dual ESM/CJS + types en une commande.

\`\`\`json
{
  "scripts": {
    "build": "tsup src/index.ts --dts --format esm,cjs",
    "dev": "tsup src/index.ts --watch --dts --format esm,cjs"
  }
}
\`\`\`

## 4. Le typage — TypeScript strict, sans compromis

TypeScript en mode \`strict\` plus quelques flags supplémentaires :

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
\`\`\`

- \`noUncheckedIndexedAccess\` : \`arr[0]\` devient \`T | undefined\`, forçant à gérer le cas vide
- \`exactOptionalPropertyTypes\` : \`{ a?: string }\` n'accepte plus \`undefined\` explicite, juste l'absence
- \`isolatedModules\` + \`verbatimModuleSyntax\` : compatibilité parfaite avec esbuild/Vite

Ces flags coûtent du temps au début mais éliminent une classe entière de bugs. Sur Nexus, le passage à \`noUncheckedIndexedAccess\` a révélé 17 bugs latents en une journée de refactor.

## 5. La validation runtime — Zod ou Valibot

TypeScript valide à la compilation. Pour valider à l'exécution (input HTTP, message de queue, payload externe), un schema runtime est indispensable.

**Zod** : standard de facto, écosystème énorme, intégration avec tRPC, OpenAPI, etc.

**Valibot** : 7x plus léger, idéal pour les bundles client. API très proche de Zod.

\`\`\`typescript
// src/validators/deposit.ts (Zod)
import { z } from "zod";

export const depositSchema = z.object({
  amount: z.number().int().positive().max(10_000_000),
  currency: z.enum(["XOF", "USD", "EUR"]),
  gateway: z.enum(["mtn_momo", "orange_money", "stripe"]),
  reference: z.string().min(3).max(64),
});

export type Deposit = z.infer<typeof depositSchema>;
\`\`\`

Règle : **toute donnée venant de l'extérieur passe par un schema runtime**. Pas de \`as Deposit\` aveugle. Pas de "ça vient du frontend, c'est OK".

## 6. Le linter — ESLint flat config + TypeScript ESLint

ESLint v9 en flat config (\`eslint.config.js\`) est désormais standard.

\`\`\`javascript
// eslint.config.js
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);
\`\`\`

\`strictTypeChecked\` ajoute des règles qui demandent l'analyse de types (lente mais précieuse) : \`no-floating-promises\`, \`no-misused-promises\`, \`require-await\`. Ces trois règles seules attrapent 80 % des bugs async typiques.

## 7. Le formatter — Prettier ou Biome ?

**Prettier** reste le standard mature. Son écosystème de plugins (Tailwind, etc.) est inégalé.

**Biome** est 10–30x plus rapide. Sur les gros monorepos, ça change la vie. Son linter (Biome inclut son propre linter) est encore en retrait vs ESLint mais comble rapidement.

**Mon défaut 2026** : Biome pour les nouveaux projets, Prettier+ESLint pour les projets existants. La migration Biome demande du travail mais le gain de vitesse est tangible.

## 8. Les tests — Vitest, Bun test ou node:test

**Vitest** : compatible Jest, ESM natif, watch ultra-rapide, snapshot, mocking, coverage v8. C'est le couteau suisse moderne.

**Bun test** : intégré au runtime Bun, démarrage instantané. Excellent si on tourne déjà sur Bun.

**node:test** : module natif Node 20+, sans dépendance. Suffit pour des tests simples mais l'écosystème est mince.

\`\`\`typescript
// src/services/payment/PaymentRouter.test.ts
import { describe, it, expect, vi } from "vitest";
import { PaymentRouter } from "./PaymentRouter";

describe("PaymentRouter", () => {
  it("resolves the right gateway for a method", () => {
    const router = new PaymentRouter();
    const fakeGateway = { name: "mtn", supports: ["mobile_money_mtn"] };
    router.register(fakeGateway as never);
    expect(router.resolve("mobile_money_mtn")).toBe(fakeGateway);
  });

  it("throws on unregistered method", () => {
    const router = new PaymentRouter();
    expect(() => router.resolve("card")).toThrow(/no gateway/i);
  });
});
\`\`\`

## 9. Le package manager — pnpm

**pnpm** par défaut. Trois raisons :

1. **Disque** : ~5x moins de \`node_modules\` (store partagé hardlinks)
2. **Strict** : pas d'accès aux dépendances non déclarées (évite les imports fantômes)
3. **Vitesse** : install 2–3x plus rapide qu'npm

npm reste OK pour les projets très petits ou pour un monorepo bien structuré avec npm workspaces. Yarn berry est techniquement excellent mais sa courbe d'apprentissage et son écosystème plus petit le rendent moins justifiable en 2026.

## 10. Le monorepo — Turborepo ou Nx ?

Pour un monorepo de 3 à 15 packages : **Turborepo**. Configuration simple, cache distant Vercel, parfaitement intégré à pnpm.

Pour un monorepo entreprise avec 30+ packages, contraintes architecturales fortes : **Nx**. Plus puissant, plus complexe, plus de courbe.

\`\`\`json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
\`\`\`

## 11. La CI — GitHub Actions par défaut

GitHub Actions est devenu le standard pratique en 2026. GitLab CI reste excellent si vous êtes déjà chez GitLab.

Pour un projet TypeScript/Node :

\`\`\`yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
\`\`\`

Cache pnpm bien fait : 2 minutes vs 6 sans cache sur un projet moyen.

## 12. La stack qui marche par défaut

Ma stack 2026 pour un nouveau projet Node/TS :

| Catégorie | Choix |
|-----------|-------|
| Runtime | Node 22 LTS |
| Package manager | pnpm |
| TypeScript | strict + flags renforcés |
| Validation runtime | Zod |
| Linter | ESLint flat + typescript-eslint strict |
| Formatter | Biome (nouveau) ou Prettier (existant) |
| Tests | Vitest |
| Bundler app web | Vite |
| Bundler service | esbuild + tsup pour packages |
| Monorepo | Turborepo + pnpm workspaces |
| CI | GitHub Actions |

Cette stack est ennuyeuse, et c'est précisément l'intérêt. Aucun composant n'est révolutionnaire. Tous sont matures, documentés, recrutables. Le temps qu'on ne passe pas sur la stack est du temps qu'on passe sur le produit.

## 13. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Stack exotique pour briller | DX dégradée, recrutement difficile | Choix par défaut sauf justification précise |
| TypeScript non-strict | Bugs runtime fréquents | \`strict: true\` + flags renforcés |
| Pas de validation runtime | Crash sur input inattendu | Zod ou Valibot sur tous les inputs |
| Linter trop laxiste | Patterns douteux normalisés | typescript-eslint strict + règles async |
| Pas de cache CI | Builds lents qui démotivent | pnpm cache + Turbo cache |
| Monorepo prématuré | Complexité sans bénéfice | Mono-package jusqu'à 2-3 apps |
| Tests sans cible | Coverage symbolique | Tests sur la logique métier, pas sur le framework |

## 14. Conclusion

La meilleure stack 2026 n'est pas la plus nouvelle. C'est celle qui fait gagner le plus de minutes par jour sans demander d'effort cognitif.

Mes critères de choix dans l'ordre :
1. Maturité et stabilité
2. DX au quotidien (vitesse build, qualité erreurs, hot reload)
3. Écosystème et recrutement
4. Performance pure (souvent secondaire)

Une équipe de 4 développeurs avec la bonne stack livre 30 à 50 % plus vite qu'avec une stack mal choisie. Le calcul est rarement explicité mais il est massif.

Si vous démarrez aujourd'hui, prenez la stack par défaut. Personnalisez seulement quand un besoin précis et chiffré le justifie. Le reste est cosmétique.`;

const contentEn = `> Choosing your Node.js + TypeScript stack in 2026 is less a matter of fashion than of cumulative DX over 2 years. Here's the default stack I use and why.

## 1. Why DX matters so much

DX (Developer Experience) isn't comfort, it's investment. A stack that costs you 15 minutes a day waiting for builds or decoding cryptic errors is 60 hours per year per developer. On a team of 4, that's a half-FTE lost.

This article condenses the stack I default to in 2026, with the trade-offs that led me there. Not "you must use this" — criteria to decide.

## 2. The runtime — Node, Deno or Bun?

Three contenders in 2026, context by context:

| Criterion | Node 22 LTS | Bun 1.x | Deno 2.x |
|-----------|-------------|---------|----------|
| Production maturity | ★★★★★ | ★★★ | ★★★★ |
| Performance | ★★★ | ★★★★★ | ★★★★ |
| npm ecosystem | ★★★★★ | ★★★★ | ★★★★ |
| Integrated tooling | ★★ | ★★★★★ | ★★★★★ |
| Native TypeScript | With --experimental | Yes | Yes |
| Hosting adoption | All platforms | Limited | Growing |

**My default**: Node 22 LTS. Reasons:
- Absolute maturity, universal hosting support
- Full ecosystem compatibility
- Performance largely sufficient for 95% of cases

**Bun**: for highly perf-critical workloads (parsers, transformers, mass tests). 4x faster startup changes CI.

**Deno**: for edge / short serverless projects. Permission model and native HTTPS imports are elegant, but ecosystem friction weighs.

## 3. The bundler — esbuild or Vite?

For a web app: **Vite**, period. DX is unmatched: sub-1-second startup, instant HMR, native TS + JSX, rich plugin ecosystem.

For a backend service: **esbuild**, because you don't need Vite's dev server. esbuild in \`watch\` mode rebundles in <200ms, perfect for fast tests.

To publish an npm package: **tsup** (esbuild wrapper) or **tsdown**. Generates dual ESM/CJS + types in one command.

\`\`\`json
{
  "scripts": {
    "build": "tsup src/index.ts --dts --format esm,cjs",
    "dev": "tsup src/index.ts --watch --dts --format esm,cjs"
  }
}
\`\`\`

## 4. Typing — strict TypeScript, no compromise

TypeScript in \`strict\` mode plus a few extra flags:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
\`\`\`

- \`noUncheckedIndexedAccess\`: \`arr[0]\` becomes \`T | undefined\`, forcing empty-case handling
- \`exactOptionalPropertyTypes\`: \`{ a?: string }\` no longer accepts explicit \`undefined\`, only absence
- \`isolatedModules\` + \`verbatimModuleSyntax\`: perfect compatibility with esbuild/Vite

These flags cost time upfront but eliminate an entire class of bugs. On Nexus, enabling \`noUncheckedIndexedAccess\` revealed 17 latent bugs in a one-day refactor.

## 5. Runtime validation — Zod or Valibot

TypeScript validates at compile time. To validate at runtime (HTTP input, queue message, external payload), a runtime schema is essential.

**Zod**: de facto standard, massive ecosystem, integration with tRPC, OpenAPI, etc.

**Valibot**: 7x lighter, ideal for client bundles. API very close to Zod.

\`\`\`typescript
import { z } from "zod";

export const depositSchema = z.object({
  amount: z.number().int().positive().max(10_000_000),
  currency: z.enum(["XOF", "USD", "EUR"]),
  gateway: z.enum(["mtn_momo", "orange_money", "stripe"]),
  reference: z.string().min(3).max(64),
});

export type Deposit = z.infer<typeof depositSchema>;
\`\`\`

Rule: **all data coming from outside passes through a runtime schema**. No blind \`as Deposit\`. No "it comes from the frontend, it's OK".

## 6. The linter — ESLint flat config + TypeScript ESLint

ESLint v9 in flat config (\`eslint.config.js\`) is now standard.

\`\`\`javascript
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);
\`\`\`

\`strictTypeChecked\` adds rules requiring type analysis (slow but valuable): \`no-floating-promises\`, \`no-misused-promises\`, \`require-await\`. These three alone catch 80% of typical async bugs.

## 7. The formatter — Prettier or Biome?

**Prettier** remains the mature standard. Its plugin ecosystem (Tailwind, etc.) is unmatched.

**Biome** is 10–30x faster. On big monorepos, life-changing. Its linter (Biome includes its own) is still behind ESLint but catching up fast.

**My 2026 default**: Biome for new projects, Prettier+ESLint for existing. Biome migration is work but the speed gain is tangible.

## 8. Testing — Vitest, Bun test or node:test

**Vitest**: Jest-compatible, native ESM, ultra-fast watch, snapshot, mocking, v8 coverage. The modern Swiss Army knife.

**Bun test**: integrated with Bun runtime, instant startup. Excellent if you already run Bun.

**node:test**: native Node 20+ module, no dependency. Enough for simple tests but ecosystem is thin.

\`\`\`typescript
import { describe, it, expect, vi } from "vitest";
import { PaymentRouter } from "./PaymentRouter";

describe("PaymentRouter", () => {
  it("resolves the right gateway for a method", () => {
    const router = new PaymentRouter();
    const fakeGateway = { name: "mtn", supports: ["mobile_money_mtn"] };
    router.register(fakeGateway as never);
    expect(router.resolve("mobile_money_mtn")).toBe(fakeGateway);
  });

  it("throws on unregistered method", () => {
    const router = new PaymentRouter();
    expect(() => router.resolve("card")).toThrow(/no gateway/i);
  });
});
\`\`\`

## 9. The package manager — pnpm

**pnpm** by default. Three reasons:

1. **Disk**: ~5x smaller \`node_modules\` (shared hardlinked store)
2. **Strict**: no access to undeclared dependencies (prevents phantom imports)
3. **Speed**: install 2–3x faster than npm

npm stays OK for very small projects or a well-structured monorepo with npm workspaces. Yarn berry is technically excellent but learning curve and smaller ecosystem make it less justifiable in 2026.

## 10. The monorepo — Turborepo or Nx?

For a monorepo of 3 to 15 packages: **Turborepo**. Simple config, Vercel remote cache, perfectly integrated with pnpm.

For an enterprise monorepo with 30+ packages and strong architectural constraints: **Nx**. More powerful, more complex, steeper curve.

\`\`\`json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
\`\`\`

## 11. CI — GitHub Actions by default

GitHub Actions became the practical standard in 2026. GitLab CI stays excellent if you're already on GitLab.

For a TypeScript/Node project:

\`\`\`yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
\`\`\`

Well-done pnpm cache: 2 minutes vs 6 without on an average project.

## 12. The default stack that works

My 2026 stack for a new Node/TS project:

| Category | Pick |
|----------|------|
| Runtime | Node 22 LTS |
| Package manager | pnpm |
| TypeScript | strict + extra flags |
| Runtime validation | Zod |
| Linter | ESLint flat + typescript-eslint strict |
| Formatter | Biome (new) or Prettier (existing) |
| Tests | Vitest |
| Web app bundler | Vite |
| Service bundler | esbuild + tsup for packages |
| Monorepo | Turborepo + pnpm workspaces |
| CI | GitHub Actions |

This stack is boring, and that's exactly the point. No component is revolutionary. All are mature, documented, hireable. Time not spent on the stack is time spent on the product.

## 13. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Exotic stack to look cool | Degraded DX, hard hiring | Default choice unless precise justification |
| Non-strict TypeScript | Frequent runtime bugs | \`strict: true\` + extra flags |
| No runtime validation | Crash on unexpected input | Zod or Valibot on all inputs |
| Too lax linter | Normalized dubious patterns | typescript-eslint strict + async rules |
| No CI cache | Slow builds demoralize | pnpm cache + Turbo cache |
| Premature monorepo | Complexity without benefit | Single package up to 2-3 apps |
| Targetless tests | Symbolic coverage | Tests on business logic, not framework |

## 14. Closing

The best 2026 stack isn't the newest. It's the one that saves the most minutes per day without cognitive overhead.

My selection criteria, in order:
1. Maturity and stability
2. Daily DX (build speed, error quality, hot reload)
3. Ecosystem and hireability
4. Raw performance (often secondary)

A team of 4 developers with the right stack ships 30–50% faster than with a poorly chosen stack. The math is rarely spelled out but it's massive.

If starting today, take the default stack. Customize only when a precise, quantified need justifies it. The rest is cosmetics.`;

export const dx2026NodeTsStack: BlogPostSeed = {
  title:
    "DX 2026 — choisir son socle Node.js + TypeScript sans se piéger",
  title_en:
    "DX 2026 — picking your Node.js + TypeScript stack without falling into traps",
  slug: "dx-2026-stack-node-typescript",
  excerpt:
    "Node 22 LTS, pnpm, Vite, Vitest, ESLint flat, Zod, Turborepo : la stack que j'utilise par défaut en 2026 et pourquoi ennuyeuse vaut mieux que révolutionnaire.",
  excerpt_en:
    "Node 22 LTS, pnpm, Vite, Vitest, ESLint flat, Zod, Turborepo: the stack I default to in 2026 and why boring beats revolutionary.",
  content,
  content_en: contentEn,
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: [
    "typescript",
    "dx",
    "stack",
    "productivity",
    "nodejs",
    "tooling",
  ],
};

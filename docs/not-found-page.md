# 404 — Not Found page

## What

A premium, branded 404 screen served by the Next.js App Router for every unmatched route
and for every explicit `notFound()` call (blog articles, case studies).

## Why

Before this page, an unknown URL fell back to the default Next.js error screen: unbranded,
in English, with no way back into the site. On a portfolio, a dead end costs a lead. The
page turns the error into a recovery path and keeps the brand system intact.

## Contract

| Item | Value |
| --- | --- |
| Route | `src/app/not-found.tsx` (App Router convention, no route segment) |
| HTTP status | `404`, handled by the framework |
| Indexing | `robots: { index: false, follow: true }` — never indexed, links still crawled |
| Rendering | Server Component; no client-side state |
| Language | French by default, English via the existing locale system |

### Modules

| File | Responsibility |
| --- | --- |
| `src/app/not-found.tsx` | Orchestrator: metadata, layout, wiring only |
| `src/components/not-found/NotFoundDiagnostic.tsx` | HTTP diagnostic panel |
| `src/components/not-found/NotFoundRoutes.tsx` | Recovery destinations grid |
| `src/components/not-found/NotFoundReads.tsx` | Latest articles shortlist |
| `messages/fr.json`, `messages/en.json` | Localized recovery content (`NotFoundPremium`) |
| `src/utils/date.ts` | `formatArticleDate`, shared with the article hero |
| `src/styles/not-found.css` | `notfound-*` scoped styles, imported by `globals.css` |

### Content source

Destinations and diagnostic checks reuse the original premium layout with translated
content from `NotFoundPremium`. Latest reads come from the existing backend blog loader,
sorted by date descending and limited to three published articles. Recovery links
use the active locale and the integrated branch's project/experience routes.

## Design

Reuses the existing design system rather than introducing a new one:

- Shell, buttons, kickers, section rhythm: existing tokens and utility classes.
- The diagnostic panel reuses `.hero-visual`, `.saas-readiness-card`, `.visual-header` and
  `.readiness-header`, so it inherits the hover sweep and the dark theme for free.
- Everything specific to the page is namespaced `notfound-*` to avoid collisions.
- Light and dark themes, `prefers-reduced-motion`, and breakpoints at 920px / 620px are
  covered.

## Covered states

- Unknown URL anywhere on the site.
- `notFound()` from localized blog, project and experience detail routes.
- Empty blog dataset: the latest-reads section is omitted instead of rendering an empty block.
- Reduced motion: the numeric shimmer and card transforms are disabled.

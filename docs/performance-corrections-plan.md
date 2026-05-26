# Performance Corrections Plan

## Context

The production homepage currently exposes several performance risks on mobile:

- `https://lesourcier.space/` redirects to `/fr`, adding an extra network round trip.
- HTML output is large for a portfolio homepage, measured around `273 KB`.
- Production responses currently include `Cache-Control: private, no-cache, no-store, max-age=0`.
- The locale configuration still reads `cookies()` and `headers()`, which can make pages dynamic and reduce cacheability.
- The assistant is mounted globally and its dependencies are part of the initial client surface.
- The localized layout still loads assistant-related datasets even though the current assistant component no longer uses those props.
- Several project/blog images come from external sources and are requested in large dimensions.
- Both light and dark logo variants are preloaded early.

## Goals

- Reduce first-load work on mobile.
- Restore cacheability for public localized pages.
- Keep `/fr` and `/en` as the SEO source of truth.
- Avoid changing the visual direction of the platform.
- Keep all dynamic backend-driven content functional.
- Preserve the assistant, analytics, cookie consent, theme switching and language switching.

## Progress Checklist

### Phase 1 — Remove Unnecessary Server Work

- [ ] Remove unused assistant data fetching from `src/app/[locale]/layout.tsx`.
- [ ] Keep `PortfolioAssistant` mounted with no unused `projects`, `posts`, or `experiences` props.
- [ ] Confirm the initial RSC/HTML payload is smaller after removal.
- [ ] Run `npm run build`.

Expected impact:
Less server work per page render and less serialized page data.

Risk:
Low. The assistant already resolves rich intents through the backend and does not use these props.

### Phase 2 — Fix Locale Cacheability

- [ ] Update `src/i18n/request.ts` so `/fr` and `/en` use the URL locale as the primary source.
- [ ] Avoid reading `cookies()` and `headers()` inside the locale request config for already-prefixed routes.
- [ ] Keep browser/cookie detection only in non-prefixed redirect routes such as `/`, `/blog`, `/projects`, and `/experiences`.
- [ ] Verify language switching still updates URL, UI labels, assistant labels and links.
- [ ] Run `npm run build`.

Expected impact:
Public localized pages become easier for Next.js and the CDN/reverse proxy to cache.

Risk:
Medium. The redirect behavior from `/` must still respect the saved cookie or browser language.

### Phase 3 — Improve Production Cache Headers

- [ ] Check whether `no-store` comes from Next dynamic rendering or server/proxy configuration.
- [ ] Configure cache headers for static assets under `/_next/static/*`.
- [ ] Configure reasonable cache headers for images, fonts and icons.
- [ ] Keep API responses and personalized routes out of aggressive public cache.
- [ ] Re-test response headers for `/fr`, `/en`, `/fr/blog`, `/fr/projects`.

Expected impact:
Repeat visits become noticeably faster and PageSpeed cache diagnostics should improve.

Risk:
Medium. Bad cache headers can make content updates slower to appear if revalidation is not configured correctly.

### Phase 4 — Lazy Load Assistant

- [ ] Split the assistant into a lightweight always-visible launcher and a lazy-loaded panel.
- [ ] Load assistant store, markdown renderer, OTP UI and message panel only after opening the assistant.
- [ ] Keep the button visible and interactive immediately.
- [ ] Ensure assistant language is still synchronized with `/fr` and `/en`.
- [ ] Run build and test opening/closing assistant on mobile.

Expected impact:
Less JavaScript on first load, better main-thread responsiveness.

Risk:
Low to medium. The assistant first open may take slightly longer, but the page itself becomes faster.

### Phase 5 — Optimize Images

- [ ] Add `images.remotePatterns` in `next.config.ts` for trusted image domains.
- [ ] Replace critical external `<img>` usages with `next/image` where appropriate.
- [ ] Avoid requesting `w=1600` images for mobile cards.
- [ ] Define responsive `sizes` for project cards, blog cards and hero media.
- [ ] Prefer locally optimized or CDN-hosted WebP/AVIF assets for key portfolio images.
- [ ] Keep decorative images lazy unless they are truly above the fold.

Expected impact:
Lower transfer size and better LCP on mobile.

Risk:
Medium. Incorrect `sizes` can cause blurry images or oversized downloads.

### Phase 6 — Logo and Font Loading

- [ ] Stop preloading both light and dark logo variants as priority assets.
- [ ] Use one primary logo asset where possible, or make the non-active theme logo lazy.
- [ ] Review font preloads and confirm only required weights are loaded.
- [ ] Keep `font-display` behavior stable.

Expected impact:
Slightly smaller critical request chain.

Risk:
Low. Main concern is avoiding logo flicker during theme initialization.

### Phase 7 — Reduce Initial Client Components

- [ ] Review client components mounted on the homepage.
- [ ] Keep interactive components client-side only when necessary.
- [ ] Consider moving static sections back to server components where possible.
- [ ] Keep carousels interactive, but avoid loading heavy logic before needed.
- [ ] Ensure theme, language and contact behavior still work.

Expected impact:
Less hydration cost and better mobile interactivity.

Risk:
Medium. Some UI components depend on client state and must not be converted blindly.

### Phase 8 — Validate SEO and Routing

- [ ] Ensure `/fr` and `/en` have correct canonical URLs.
- [ ] Add or verify `hreflang` alternates for localized pages.
- [ ] Keep non-prefixed routes as redirects only.
- [ ] Ensure sitemap includes localized routes.
- [ ] Confirm PageSpeed and Search Console test the intended localized URL.

Expected impact:
Cleaner indexing and no duplicate-content ambiguity.

Risk:
Low. Incorrect canonical/hreflang values can confuse indexing, so validation is required.

## Validation Checklist

- [ ] `npm run build` passes.
- [ ] `/` redirects to the expected locale.
- [ ] `/fr` renders French without hydration mismatch.
- [ ] `/en` renders English without stale French assistant labels.
- [ ] Language switch updates URL and UI immediately.
- [ ] Header/footer links stay localized.
- [ ] Assistant opens and responds.
- [ ] Cookie consent still works.
- [ ] Contact form still works.
- [ ] PageSpeed mobile is retested on `/fr` and `/en`.
- [ ] Response headers are checked with `curl -I`.
- [ ] HTML payload size is compared before/after.

## Priority Order

1. Remove unused assistant data fetching.
2. Fix locale request config to stop forcing dynamic behavior on localized pages.
3. Correct cache headers.
4. Lazy-load assistant panel.
5. Optimize images.
6. Refine logo/font loading.
7. Reduce unnecessary client components.
8. Validate SEO metadata and sitemap.

## Expected Outcome

The biggest expected gains should come from:

- Smaller server-rendered payload.
- Better cacheability.
- Less JavaScript on first load.
- Smaller mobile image downloads.
- Reduced work during initial hydration.

The visual design should remain unchanged unless image handling reveals a need for better crops or responsive art direction.

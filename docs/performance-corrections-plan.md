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

- [x] Remove unused assistant data fetching from `src/app/[locale]/layout.tsx`.
- [x] Keep `PortfolioAssistant` mounted with no unused `projects`, `posts`, or `experiences` props.
- [ ] Confirm the initial RSC/HTML payload is smaller after removal.
- [x] Run `npm run build`.

Expected impact:
Less server work per page render and less serialized page data.

Risk:
Low. The assistant already resolves rich intents through the backend and does not use these props.

### Phase 2 — Fix Locale Cacheability

- [x] Update `src/i18n/request.ts` so `/fr` and `/en` use the URL locale as the primary source.
- [x] Avoid reading `cookies()` and `headers()` inside the locale request config for already-prefixed routes.
- [x] Keep browser/cookie detection only in non-prefixed redirect routes such as `/`, `/blog`, `/projects`, and `/experiences`.
- [x] Call `setRequestLocale(locale)` in the localized layout to prevent `next-intl` from falling back to request headers.
- [ ] Verify language switching still updates URL, UI labels, assistant labels and links.
- [x] Run `npm run build`.

Expected impact:
Public localized pages become easier for Next.js and the CDN/reverse proxy to cache.

Risk:
Medium. The redirect behavior from `/` must still respect the saved cookie or browser language.

### Phase 3 — Improve Production Cache Headers

- [x] Check whether `no-store` comes from Next dynamic rendering or server/proxy configuration.
- [x] Confirm Next already manages immutable cache headers for `/_next/static/*`.
- [ ] Configure reasonable cache headers for images, fonts and icons.
- [x] Configure public CDN cache headers for localized public pages.
- [ ] Keep API responses and personalized routes out of aggressive public cache.
- [ ] Re-test response headers for `/fr`, `/en`, `/fr/blog`, `/fr/projects`.

Expected impact:
Repeat visits become noticeably faster and PageSpeed cache diagnostics should improve.

Risk:
Medium. Bad cache headers can make content updates slower to appear if revalidation is not configured correctly.

### Phase 4 — Lazy Load Assistant

- [x] Split the assistant into a lightweight always-visible launcher and a lazy-loaded panel.
- [x] Load assistant store, markdown renderer, OTP UI and message panel only after opening the assistant.
- [x] Keep the button visible and interactive immediately.
- [ ] Ensure assistant language is still synchronized with `/fr` and `/en`.
- [x] Run build.
- [ ] Test opening/closing assistant on mobile.

Expected impact:
Less JavaScript on first load, better main-thread responsiveness.

Risk:
Low to medium. The assistant first open may take slightly longer, but the page itself becomes faster.

### Phase 5 — Optimize Images

- [x] Add `images.remotePatterns` in `next.config.ts` for trusted image domains.
- [x] Replace critical external `<img>` usages with `next/image` where appropriate.
- [x] Disable the Next image optimizer in production config because remote `/_next/image` requests currently return `400` on the deployed server.
- [x] Avoid requesting `w=1600` images for mobile cards.
- [x] Define responsive `sizes` for project cards and blog cards.
- [x] Define responsive `sizes` for hero media on detail pages.
- [ ] Prefer locally optimized or CDN-hosted WebP/AVIF assets for key portfolio images.
- [ ] Keep decorative images lazy unless they are truly above the fold.
- [ ] Define a safe markdown image pipeline before replacing arbitrary article images with `next/image`.

Expected impact:
Lower transfer size and better LCP on mobile.

Risk:
Medium. Incorrect `sizes` can cause blurry images or oversized downloads.

### Phase 6 — Logo and Font Loading

- [x] Stop preloading both light and dark logo variants as priority assets.
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

- [x] Ensure `/fr` and `/en` have correct canonical URLs.
- [x] Add or verify `hreflang` alternates for localized pages.
- [ ] Keep non-prefixed routes as redirects only.
- [x] Ensure sitemap includes localized routes.
- [ ] Confirm PageSpeed and Search Console test the intended localized URL.

Expected impact:
Cleaner indexing and no duplicate-content ambiguity.

Risk:
Low. Incorrect canonical/hreflang values can confuse indexing, so validation is required.

## Validation Checklist

- [x] `npm run build` passes.
- [ ] `/` redirects to the expected locale.
- [ ] `/fr` renders French without hydration mismatch.
- [ ] `/en` renders English without stale French assistant labels.
- [ ] Language switch updates URL and UI immediately.
- [ ] Header/footer links stay localized.
- [x] Root metadata no longer injects a canonical URL pointing every page to the domain root.
- [x] Generic `aria-label` containers now expose an explicit semantic role.
- [x] Closed mobile navigation is hidden from the accessibility tree to avoid duplicate links.
- [x] The likely non-composited animation has been identified without changing it.
- [ ] Assistant opens and responds.
- [ ] Cookie consent still works.
- [ ] Contact form still works.
- [x] Blog, project and experience detail pages expose route-level skeletons while server data loads.
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

## Progress Notes

### 2026-05-26

- Removed unused `loadProjects`, `loadBlogPosts`, and `loadExperiences` calls from `src/app/[locale]/layout.tsx`.
- `PortfolioAssistant` is still mounted globally under localized routes, but no longer receives unused server-fetched datasets.
- Simplified `src/i18n/request.ts` so localized routes use the URL/request locale directly.
- Cookie and browser-language detection remain isolated in redirect routes through `src/lib/routing/localeRedirect.ts`.
- Production build passes after these changes.
- Local payload measurement is pending because the sandbox blocked starting a production server on an alternate port (`EPERM`).
- Next step: re-check payload/cache behavior in a normal local server or production environment.

### 2026-05-26 — Assistant lazy loading

- Added `src/components/assistant/AssistantRuntime.tsx` for the heavy assistant panel/runtime.
- Updated `PortfolioAssistant` so the initial page only mounts the assistant launcher button.
- The assistant runtime is dynamically imported after the first user interaction.
- Production build passes after assistant lazy loading.
- Next step: manual browser verification for opening, closing and language sync.

### 2026-05-26 — Image and logo preparation

- Added trusted remote image domains to `next.config.ts`.
- Enabled AVIF/WebP output formats for Next image optimization.
- Removed forced `priority` preloading from the two header logo variants to avoid preloading both theme assets.
- Replaced external `<img>` usages in home project cards, home blog cards, `BlogDirectory`, and `ProjectsDirectory` with `next/image`.
- Added responsive `sizes` for project and blog listing images to reduce oversized mobile downloads.
- Guarded optional blog cover images instead of assuming every backend post has a cover.
- Production build passes after the image conversion work.
- Remaining image work: markdown-rendered images need a separate pass because their sizing depends on arbitrary article content.

### 2026-05-26 — Locale and cache headers

- Added `setRequestLocale(locale)` in `src/app/[locale]/layout.tsx` so `next-intl` can use the URL locale without reading request headers for localized pages.
- Added `Cache-Control: public, s-maxage=60, stale-while-revalidate=86400` for `/fr`, `/en`, and nested localized public routes.
- Intentionally did not override `/_next/static/*` cache headers because Next already handles immutable static asset caching and warns against custom overrides there.
- Production build passes after the cache header update.
- Build output still reports localized pages as dynamic because they are backend-driven SSR routes; header behavior must be validated with `curl -I` against a running production server.

### 2026-05-26 — Detail hero image optimization

- Replaced article detail cover images with `next/image`, `sizes="100vw"` and `priority` for the above-the-fold hero.
- Replaced project detail cover images with `next/image`, `sizes="100vw"` and `priority`.
- Replaced experience hero cover images with `next/image`, responsive `sizes`, and priority loading.
- Production build passes after the detail hero conversion.

### 2026-05-26 — Secondary image optimization

- Replaced testimonial avatars with `next/image` using fixed 56px sizing.
- Replaced experience gallery images with `next/image` and responsive `sizes` for featured versus secondary gallery tiles.
- Production build passes after the secondary image conversion.
- Markdown-rendered images remain intentionally unchanged for now because they need content-aware handling to avoid invalid HTML nesting and hydration regressions.

### 2026-05-27 — Production image optimizer fallback

- Production test showed external image optimizer URLs returning `400 Bad Request`, for example `/_next/image?url=https%3A%2F%2Fimages.unsplash.com...`.
- The original source image URL returned `200`, so the failure is in the deployed Next image optimization route, not in the image host itself.
- A local/public asset through `/_next/image` returned `200`, which suggests the issue is specifically with remote image optimization or the deployed image config/build.
- Set `images.unoptimized = true` in `next.config.ts` so `next/image` keeps dimensions, lazy loading and layout behavior but outputs direct image URLs instead of `/_next/image` optimizer URLs.
- This is a pragmatic production fix for cPanel/custom hosting. Long-term, the best solution remains serving editorial media from a controlled CDN/storage with already optimized WebP/AVIF files.
- Production build passes after this change.

### 2026-05-26 — Language switch note

- The current language toggle is left unchanged because manual behavior is already acceptable.
- No assistant/language synchronization code was changed during this pass.

### 2026-05-26 — SEO alternates

- Added `localizedLanguages()` in `src/lib/routing/localizedPath.ts` to generate FR/EN alternate route paths from one source.
- Added localized canonical and language alternates to the home page, blog index, project index, experience index, blog detail, project detail and experience detail metadata.
- Confirmed the sitemap already includes localized `/fr` and `/en` routes for main pages, projects and blog posts.
- Production build passes after the SEO metadata update.

### 2026-05-27 — Detail route skeletons

- Added route-level loading states for blog detail, project detail and experience detail pages.
- The skeletons mirror each page family instead of using a generic spinner:
  - article cover, meta/sidebar and markdown body placeholders for blog posts;
  - immersive cover, case-study body, metrics/chart and aside placeholders for projects;
  - split hero, signal row, content flow and aside placeholders for experiences.
- Added a shared shimmer system with dark/light theme support and reduced-motion fallback.
- Production build passes after the skeleton implementation.

### 2026-05-27 — PageSpeed SEO and accessibility follow-up

- Removed the global root canonical from `src/app/layout.tsx`; localized pages already define their own canonical URLs.
- Added explicit `role="group"` to labeled generic UI containers such as theme/language toggles, filter rows, carousel controls, contact shortcuts, assistant suggestions and metadata groups.
- Changed the experience stack label container from a generic paragraph with `aria-label` to a semantic grouped container.
- Updated cookie consent toggles to use `role="switch"` with `aria-checked` instead of button press semantics.
- Hid the closed mobile navigation with `hidden={!isMenuOpen}` to avoid duplicate hidden links being exposed to assistive technologies.
- Identified the likely non-composited animation as `body::before` using `animation: aurora-drift` in `src/app/globals.css`. It animates a fixed, blurred, full-page pseudo-element and may be the PageSpeed-reported animated element. It was intentionally left unchanged pending visual/performance judgement.
- Production build passes after these fixes.

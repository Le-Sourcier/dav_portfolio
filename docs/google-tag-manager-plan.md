# Google Tag Manager Integration Plan

## Context

The portfolio platform now has:

- localized public routes (`/fr`, `/en`);
- a custom cookie consent banner;
- backend-driven blog, projects and experience pages;
- contact, newsletter, assistant and outbound social actions;
- an active performance correction plan focused on mobile loading, cacheability and SEO.

Google Tag Manager can be useful, but only if it is implemented with consent, performance and data minimization in mind.

Official references:

- Google Tag Manager consent mode support: https://support.google.com/tagmanager/answer/10718549
- Google Consent Mode setup for websites: https://developers.google.com/tag-platform/security/guides/consent
- Basic vs advanced consent mode: https://support.google.com/tagmanager/answer/14009635
- Consent Mode overview: https://developers.google.com/tag-platform/security/concepts/consent-mode

## Recommendation

Use Google Tag Manager, but start with a conservative setup.

Recommended first version:

- Google Tag Manager container loaded only after the user accepts audience measurement.
- Google Analytics 4 configured through GTM.
- No advertising, remarketing or personalization tags at this stage.
- Only useful product/business events, not noisy vanity tracking.
- Consent stored through the existing cookie consent system.
- A documented event taxonomy before adding tags.

This keeps the platform measurable without turning it into a heavy marketing stack.

## Why It Makes Sense

### Advantages

- Centralized tag management: analytics events can be adjusted without redeploying the frontend.
- Cleaner conversion measurement: contact clicks, form submissions, newsletter subscriptions, assistant opens and CV downloads can be tracked consistently.
- Better content decisions: blog reads, project detail visits and CTA interactions can show what actually attracts potential clients.
- Better SEO feedback loop: GTM + GA4 can complement Search Console by showing post-click behavior.
- Future-ready: if paid acquisition or retargeting becomes relevant later, the platform will already have a controlled measurement layer.
- Safer iteration: tags can be tested in GTM preview before publishing.

### Disadvantages

- Performance risk: every third-party script adds network, parsing and execution cost.
- Privacy risk: poor configuration can fire tags before consent.
- Debugging complexity: tracking bugs can become harder because logic lives partly outside the repo.
- Governance risk: it becomes easy to add “just one more tag” until the site is slow and noisy.
- SEO/performance risk: careless tags can negatively affect PageSpeed, especially on mobile.
- Data quality risk: without a clear event naming strategy, analytics becomes inconsistent and hard to interpret.

## Consent Strategy

### Current Best Fit: Basic Consent Mode

For this platform, the safest first implementation is closer to Basic Consent Mode:

- Before consent: do not load GTM analytics/marketing tags.
- After “essential only”: keep analytics disabled.
- After “audience measurement” or “accept all”: load GTM and allow analytics events.

Why:

- It is privacy-first.
- It avoids unnecessary third-party work on first paint.
- It matches the current user-facing consent UI.
- It is easier to reason about and debug.

### Future Option: Advanced Consent Mode

Advanced Consent Mode can be considered later if:

- Google Ads is introduced;
- conversion modeling becomes important;
- the privacy/legal position is clarified;
- we accept that cookieless pings may be sent before full consent.

For now, advanced mode is not necessary.

## Consent Categories

### Required

These should always remain active:

- theme preference;
- language preference;
- security/session data;
- cookie consent choice;
- core navigation and UI state.

Google consent equivalent:

- `functionality_storage`: required for useful preferences such as language/theme.
- `security_storage`: required for security/session protection.

### Optional: Audience Measurement

Enabled only if the user accepts analytics:

- page views;
- project detail views;
- blog article reads;
- CTA clicks;
- newsletter submission events;
- contact form submission success;
- assistant opened;
- CV download;
- outbound GitHub/LinkedIn/WhatsApp clicks.

Google consent equivalent:

- `analytics_storage`: granted only after consent.

### Not Recommended Yet

These should remain disabled until there is a real marketing need:

- advertising cookies;
- remarketing;
- personalized ads;
- third-party marketing pixels.

Google consent equivalents:

- `ad_storage`;
- `ad_user_data`;
- `ad_personalization`;
- `personalization_storage`.

## Event Taxonomy

Use stable, descriptive event names. Avoid random names that only make sense once.

Recommended first events:

- `contact_form_submit_success`
- `contact_channel_click`
- `newsletter_subscribe_success`
- `project_card_click`
- `project_detail_view`
- `blog_card_click`
- `blog_article_view`
- `blog_share_click`
- `assistant_open`
- `assistant_quick_action_click`
- `cv_download_click`
- `outbound_social_click`
- `language_switch`
- `theme_switch`
- `cookie_consent_update`

Recommended event parameters:

- `locale`: `fr` or `en`
- `page_path`
- `page_title`
- `content_type`: `project`, `blog`, `experience`, `home`
- `content_slug`
- `cta_label`
- `cta_target`
- `source_section`
- `consent_level`: `essential` or `all`

## Implementation Checklist

### Phase 1 — Decision and Scope

- [x] Confirm that GTM is useful for the platform.
- [x] Choose a conservative first version.
- [x] Keep advertising and remarketing out of the first integration.
- [ ] Create the GTM web container.
- [ ] Record the GTM container ID in environment variables.

### Phase 2 — Consent Architecture

- [x] Confirm the platform already stores cookie consent in cookies.
- [x] Confirm the current consent UI separates essential and analytics choices.
- [ ] Map the existing consent state to Google consent states.
- [ ] Ensure GTM does not load before analytics consent in the first version.
- [ ] Add a documented reset path from the footer cookie preferences button.

### Phase 3 — GTM Loader

- [ ] Add a client-side GTM loader component.
- [ ] Load the GTM script only after analytics consent.
- [ ] Avoid `beforeInteractive` for GTM in the first version.
- [ ] Keep GTM out of server-rendered critical path.
- [ ] Verify GTM is absent from the network tab before consent.
- [ ] Verify GTM appears after accepting analytics.

### Phase 4 — Data Layer

- [ ] Create a typed `dataLayer` helper.
- [ ] Push `page_view` only when analytics is allowed.
- [ ] Push CTA and content events through one helper.
- [ ] Include locale and content metadata in event payloads.
- [ ] Prevent duplicate events during client navigation.

### Phase 5 — GTM Container Configuration

- [ ] Add GA4 configuration tag.
- [ ] Add GA4 event tags for the first event taxonomy.
- [ ] Add consent checks for analytics tags.
- [ ] Keep advertising consent denied/not configured for now.
- [ ] Enable Consent Overview in GTM.
- [ ] Test with GTM Preview mode.

### Phase 6 — Validation

- [ ] Test with “essential only”: no analytics network requests.
- [ ] Test with “accept all”: GTM and GA4 fire correctly.
- [ ] Test route changes between `/fr` and `/en`.
- [ ] Test blog detail, project detail and contact events.
- [ ] Retest PageSpeed mobile after GTM is enabled.
- [ ] Verify Search Console and GA4 data after deployment.

## Performance Rules

- GTM must not block first paint.
- GTM must not be loaded for users who only accept essential cookies.
- GA4 events should be minimal and meaningful.
- Do not add heatmaps, session replay or ad pixels without a separate review.
- Do not add tags directly in GTM without updating this document.
- Retest PageSpeed after each new third-party tag.

## Data Minimization Rules

Do not send:

- raw email addresses;
- phone numbers;
- full contact message content;
- personal names from form fields;
- private assistant message content;
- IP-derived or device fingerprinting data beyond what Google collects by default.

Allowed:

- event name;
- locale;
- page path;
- content slug;
- CTA label;
- generic contact channel name;
- success/failure status.

## Recommended First GTM Setup

Container:

- one Web container for `lesourcier.space`;
- environments: Development, Production if needed;
- preview mode used before publishing.

Tags:

- GA4 configuration;
- GA4 event tags for conversion-like actions.

Triggers:

- analytics consent granted;
- page route change;
- CTA click;
- form success;
- assistant open;
- newsletter success.

Variables:

- `locale`;
- `page_path`;
- `content_slug`;
- `content_type`;
- `cta_label`;
- `source_section`.

## Expected Impact

Positive:

- better understanding of what converts visitors into leads;
- better content/product decisions;
- easier measurement iteration;
- cleaner event governance if documented.

Negative if misused:

- slower page loads;
- privacy/compliance risk;
- noisy analytics;
- more debugging complexity.

Net recommendation:

GTM is worth adding, but only after the current performance pass is stable and only with a consent-gated loader.

## Relation to Existing Performance Plan

The existing performance plan is not fully completed yet.

Completed or mostly completed:

- unused assistant data fetching removed;
- localized request config simplified;
- assistant lazy loading added;
- important listing and hero images moved to `next/image`;
- SEO alternates added;
- production build passing.

Still open:

- response headers must be verified on a running production server;
- initial payload size must be measured before/after;
- PageSpeed must be retested after deployment;
- markdown image pipeline remains unresolved;
- font/logo optimization is not fully finished;
- manual checks for assistant, consent, contact form and localized routing remain open.

Practical conclusion:

Do not add GTM before validating the current performance changes in production or staging. GTM should be the next controlled layer, not a source of new uncertainty.

## Decision

- [x] GTM is strategically useful for the platform.
- [x] Initial setup should be analytics-only.
- [x] GTM should be consent-gated.
- [x] No advertising tags in the first version.
- [ ] Implement GTM loader.
- [ ] Configure GA4 tags in GTM.
- [ ] Validate consent behavior.
- [ ] Retest performance after deployment.

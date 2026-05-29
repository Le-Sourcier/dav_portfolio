# LinkedIn Autopost Plan

## Objective

Automatically prepare and publish LinkedIn posts when a blog article is published, without turning the platform into a blind auto-publisher.

The recommended implementation is **assisted autoposting**:

1. A blog article is published or scheduled.
2. The backend generates a LinkedIn-ready post draft.
3. The admin can review, edit, approve, publish now, or schedule it.
4. A cron job publishes scheduled LinkedIn posts.
5. The platform stores the LinkedIn status, external post ID, URL, error history, and publication metadata.

This keeps the workflow fast while protecting the brand from weak, repetitive, or inaccurate posts.

## Feasibility

This feature is feasible, but it depends on LinkedIn API access and OAuth configuration.

LinkedIn publishing is not only a technical task. The application must be configured through the LinkedIn Developer Portal and must request the correct permissions.

Required capabilities:

- Create and configure a LinkedIn Developer application.
- Configure OAuth redirect URLs.
- Request the correct LinkedIn scopes.
- Store and refresh access tokens safely.
- Publish posts through LinkedIn's API.
- Handle permission failures, token expiration, API version headers, and rate limits.

## LinkedIn API Requirements

### Developer Application

Create an app in the LinkedIn Developer Portal and configure:

- App name and logo.
- Company association if publishing to an organization page.
- OAuth 2.0 redirect URLs.
- Products or permissions needed for posting.

### OAuth

The admin must connect a LinkedIn account from the admin panel.

Expected OAuth flow:

1. Admin clicks `Connect LinkedIn`.
2. Backend redirects to LinkedIn OAuth authorization URL.
3. LinkedIn redirects back to the backend callback URL with a code.
4. Backend exchanges the code for an access token.
5. Backend stores the token securely.
6. Backend uses the token to publish posts.

### Scopes

For personal profile posting:

- `w_member_social`

For organization/page posting:

- `w_organization_social`

Depending on monitoring needs:

- `r_member_social`
- `r_organization_social`

The exact access depends on LinkedIn app approval and the type of author being used.

### API Endpoint

Use LinkedIn's REST Posts API:

```txt
POST https://api.linkedin.com/rest/posts
```

Required headers:

```txt
Authorization: Bearer <access_token>
Linkedin-Version: YYYYMM
X-Restli-Protocol-Version: 2.0.0
Content-Type: application/json
```

Typical post payload:

```json
{
  "author": "urn:li:person:<person_id>",
  "commentary": "Post content here",
  "visibility": "PUBLIC",
  "distribution": {
    "feedDistribution": "MAIN_FEED",
    "targetEntities": [],
    "thirdPartyDistributionChannels": []
  },
  "lifecycleState": "PUBLISHED",
  "isReshareDisabledByAuthor": false
}
```

## Recommended Architecture

### Do Not Add LinkedIn Fields Directly Everywhere

Avoid scattering LinkedIn-specific fields across `blog_posts`.

Prefer a dedicated `social_posts` table because the system can later support:

- LinkedIn
- X/Twitter
- Facebook
- Newsletter excerpts
- Manual social drafts

### Proposed Table: `social_posts`

```txt
id
provider                     linkedin | x | facebook | newsletter
entity_type                  blog | project | experience
entity_id
locale                       fr | en
status                       draft | scheduled | publishing | published | failed | cancelled
content
hook
cta
hashtags                     JSONB
scheduled_at
published_at
external_urn
external_url
error_message
retry_count
created_by
created_at
updated_at
```

### LinkedIn Account Storage

Use a separate `social_accounts` table:

```txt
id
provider                     linkedin
account_type                 person | organization
account_urn
account_name
access_token_encrypted
refresh_token_encrypted
expires_at
scopes                       JSONB
connected_by
is_active
created_at
updated_at
```

Tokens must never be exposed to the frontend.

## Backend Services

### `linkedin.service.ts`

Responsibilities:

- Build OAuth URL.
- Exchange authorization code for token.
- Store encrypted tokens.
- Validate token/account state.
- Publish a post.
- Map LinkedIn API errors into readable backend errors.

### `socialPost.service.ts`

Responsibilities:

- Create draft social posts from blog articles.
- Generate AI-assisted LinkedIn text.
- Save draft content.
- Publish immediately.
- Schedule publication.
- Retry failed posts safely.
- Prevent duplicate publishing.

### Cron Job

A cron job should run every few minutes:

```txt
Every 5 minutes:
  find social_posts where status = scheduled and scheduled_at <= now()
  mark as publishing
  publish to LinkedIn
  mark as published or failed
```

The cron must be idempotent. If the process crashes midway, it should not publish the same post twice.

## Admin UI Requirements

### Blog Editor Integration

Add a `LinkedIn Distribution` panel in the blog editor.

Fields and actions:

- Toggle: `Prepare LinkedIn post`
- Target: `Personal profile` or `Company page`
- Locale: `FR` / `EN`
- Hook field
- Body field
- CTA/question field
- Hashtags field
- Button: `Generate draft`
- Button: `Preview`
- Button: `Publish now`
- Button: `Schedule`
- Status badge: draft, scheduled, published, failed
- Error display if publication fails

### Social Posts Page

Create a dedicated admin page later:

- List social posts.
- Filter by provider, status, locale, entity.
- Search by title/content.
- Retry failed posts.
- Cancel scheduled posts.
- Open related blog article.
- View LinkedIn external URL after publication.

## Content Generation Strategy

The LinkedIn post should not be a generic article announcement.

Weak format to avoid:

```txt
New article published: <title>
Read it here: <url>
```

Recommended structure:

```txt
Strong hook.

Short problem framing.

What the article covers:
- point 1
- point 2
- point 3

Article link.

Question that invites comments.
```

## Hook Patterns

A good hook should be understood in less than 3 seconds.

Useful hook formats:

### Contrarian

```txt
Technical debt rarely starts with bad code.
It starts with unclear decisions.
```

### Pain-first

```txt
If your SaaS needs three people to explain one feature, the architecture is already costing you money.
```

### Outcome-first

```txt
The best backend is not the one with the most patterns.
It is the one a team can safely change under pressure.
```

### Specific lesson

```txt
I stopped treating logs as a DevOps detail.
They are now part of the product architecture.
```

### Story-based

```txt
I once joined a project where the hardest part was not writing code.
It was understanding what the previous code was trying to protect.
```

## LinkedIn Feed Best Practices

These rules are not guarantees, but they improve the chance of stronger feed performance.

### First Lines Matter

The first 1-2 lines are the post preview. They must create curiosity without clickbait.

Good:

```txt
Most SaaS platforms do not fail because of missing features.
They fail because every feature makes the next one slower to ship.
```

Bad:

```txt
I published a new article about SaaS architecture.
```

### Avoid External Link Too Early

LinkedIn often gives stronger initial engagement to posts that keep people reading.

Recommended:

- Put the link after the core value.
- Or put the link in the first comment if testing shows better reach.

For this platform, default should be:

```txt
Value first, link near the end.
```

### Use One Clear Topic

Do not mix too many themes in one post.

Bad:

```txt
SaaS architecture, AI, React, DevOps, hiring and productivity...
```

Good:

```txt
How to make a SaaS backend easier to maintain after launch.
```

### Make It Commentable

End with a real question.

Good:

```txt
What is the first signal you look for when judging if a codebase is maintainable?
```

Bad:

```txt
What do you think?
```

### Keep Formatting Readable

LinkedIn posts should use short paragraphs.

Recommended:

- 1 idea per paragraph.
- 2-4 bullet points max.
- No large block of text.
- No excessive emojis.
- No hashtag spam.

### Hashtags

Use 2-4 relevant hashtags.

Examples:

```txt
#SaaS
#SoftwareArchitecture
#ProductEngineering
#Automation
```

Avoid:

```txt
#react #nodejs #backend #frontend #javascript #typescript #developer #coding #ai #startup #business
```

### Timing

Initial recommendation:

- Tuesday to Thursday.
- Morning or early afternoon for professional audience.
- Avoid posting several times a day from the same account.

This should be configurable later after real analytics.

### Avoid Duplicate-Looking Posts

If every article post follows the exact same template, LinkedIn users will ignore it.

The generator should rotate among:

- Contrarian insight
- Problem framing
- Mini story
- Tactical checklist
- Strong lesson learned

## AI Prompt Requirements

The AI generator must receive:

- Article title.
- Article excerpt.
- Article content summary.
- Target locale.
- Desired audience.
- URL.
- Optional admin instructions.

The prompt must require:

- No invented metrics.
- No fake client claims.
- No exaggerated promises.
- No generic “I’m excited to share”.
- Short hook.
- Clear reader value.
- Professional tone.
- Valid output JSON.

Expected AI output:

```json
{
  "hook": "Short opening lines",
  "body": "Main post content",
  "cta": "Final question",
  "hashtags": ["SaaS", "SoftwareArchitecture"],
  "fullText": "Complete LinkedIn post"
}
```

## Publication Rules

### On Article Publish

Default recommended behavior:

```txt
If blog post is published:
  create LinkedIn draft
  do not publish automatically unless admin enabled autopublish
```

### On Scheduled Article Publish

If article is scheduled:

```txt
When blog article becomes public:
  generate or publish linked social post depending on settings
```

### Newsletter Compatibility

The newsletter and LinkedIn workflows should be separate.

Publishing an article can trigger:

- Newsletter email
- LinkedIn draft
- LinkedIn scheduled post

Each channel must have its own status.

## Safety Rules

- Never publish unpublished articles.
- Never publish scheduled articles before their `published_at`.
- Never publish duplicate LinkedIn posts for the same article/locale/provider unless admin explicitly creates another one.
- Never expose access tokens to the admin frontend.
- Store token errors and API responses for debugging.
- Use retries cautiously to avoid duplicate posts.
- Give admins a manual retry button.

## Environment Variables

Required:

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=
LINKEDIN_API_VERSION=202605
LINKEDIN_DEFAULT_AUTHOR_URN=
LINKEDIN_DEFAULT_TARGET=person
SOCIAL_POST_CRON_ENABLED=true
```

Optional:

```env
LINKEDIN_DEFAULT_HASHTAGS=SaaS,SoftwareArchitecture,ProductEngineering
LINKEDIN_POST_LINK_PLACEMENT=body
LINKEDIN_AUTO_PUBLISH=false
```

## API Endpoints

Suggested backend endpoints:

```txt
GET    /api/admin/social/linkedin/connect
GET    /api/admin/social/linkedin/callback
GET    /api/admin/social/accounts

GET    /api/admin/social-posts
POST   /api/admin/social-posts/generate
POST   /api/admin/social-posts/:id/publish
PATCH  /api/admin/social-posts/:id
PATCH  /api/admin/social-posts/:id/schedule
PATCH  /api/admin/social-posts/:id/cancel
POST   /api/admin/social-posts/:id/retry
DELETE /api/admin/social-posts/:id
```

## Implementation Checklist

### Phase 1 — Research and Configuration

- [ ] Create LinkedIn Developer application.
- [ ] Configure OAuth redirect URI.
- [ ] Confirm whether posting will target a personal profile or company page.
- [ ] Request required LinkedIn scopes.
- [ ] Add LinkedIn environment variables.
- [ ] Document local/prod callback URLs.

### Phase 2 — Database

- [ ] Add `social_accounts` model.
- [ ] Add encrypted token fields.
- [ ] Add `social_posts` model.
- [ ] Add indexes for `provider`, `entity_type`, `entity_id`, `status`, `scheduled_at`.
- [ ] Add migration or sync-safe model updates.
- [ ] Add seed-safe defaults if needed.

### Phase 3 — LinkedIn OAuth

- [ ] Add LinkedIn OAuth URL builder.
- [ ] Add callback handler.
- [ ] Exchange authorization code for token.
- [ ] Fetch or store author URN.
- [ ] Save token securely.
- [ ] Add admin endpoint to list connected accounts.
- [ ] Add disconnect/reconnect flow.

### Phase 4 — LinkedIn Publisher

- [ ] Add `linkedin.service.ts`.
- [ ] Implement `publishTextPost`.
- [ ] Validate author URN.
- [ ] Map LinkedIn errors into readable admin messages.
- [ ] Store external post URN.
- [ ] Resolve external post URL when possible.
- [ ] Prevent duplicate post publication.

### Phase 5 — AI Draft Generator

- [ ] Add `socialPostGenerator.service.ts`.
- [ ] Generate hook/body/CTA/hashtags/fullText.
- [ ] Support `fr` and `en`.
- [ ] Support admin custom instructions.
- [ ] Validate generated output.
- [ ] Prevent fake claims or invented metrics.
- [ ] Save draft to `social_posts`.

### Phase 6 — Blog Publish Integration

- [ ] On blog publish, create LinkedIn draft.
- [ ] On scheduled blog publish, create/publish LinkedIn post at the correct time.
- [ ] Respect article locale.
- [ ] Skip LinkedIn if disabled for the article.
- [ ] Prevent duplicated drafts for the same blog/locale/provider.
- [ ] Keep newsletter workflow separate.

### Phase 7 — Cron

- [ ] Add social post cron job.
- [ ] Query scheduled posts due for publication.
- [ ] Lock rows or mark as `publishing` before API call.
- [ ] Publish to LinkedIn.
- [ ] Mark as `published` or `failed`.
- [ ] Store error message on failure.
- [ ] Add retry count.

### Phase 8 — Admin UI

- [ ] Add LinkedIn connection settings screen.
- [ ] Add `LinkedIn Distribution` panel in blog editor.
- [ ] Add draft generator button.
- [ ] Add preview component.
- [ ] Add publish now button.
- [ ] Add schedule picker.
- [ ] Add status badges.
- [ ] Add error state.
- [ ] Add retry button.
- [ ] Add social posts management page.

### Phase 9 — Analytics and Monitoring

- [ ] Store published post metadata.
- [ ] Show LinkedIn publication status in blog list.
- [ ] Show failed LinkedIn posts in admin dashboard.
- [ ] Add admin notification on failure.
- [ ] Add logs for publish attempts.
- [ ] Add manual retry.

### Phase 10 — Quality and Safety

- [ ] Test draft generation with short articles.
- [ ] Test draft generation with long Markdown articles.
- [ ] Test French post generation.
- [ ] Test English post generation.
- [ ] Test scheduled blog + scheduled LinkedIn post.
- [ ] Test token expiration.
- [ ] Test LinkedIn permission failure.
- [ ] Test duplicate prevention.
- [ ] Test failed publish retry.
- [ ] Verify no token leaks in frontend or logs.

## Recommended Default Behavior

Initial default:

```txt
LinkedIn autopublish: disabled
LinkedIn draft generation: enabled after blog publish
Admin approval required: enabled
Scheduled LinkedIn posts: enabled
Post locale: same as article locale
Link placement: near end of post
Hashtags: 2-4
```

After the workflow is proven stable, autopublish can be enabled per article or globally.

## Final Recommendation

Build this as a controlled distribution system, not as a simple webhook.

The best version is:

- AI-assisted post generation.
- Human-editable draft.
- Optional automatic scheduling.
- Safe LinkedIn API publishing.
- Full admin visibility.
- No blind publishing by default.

This gives speed without sacrificing credibility.

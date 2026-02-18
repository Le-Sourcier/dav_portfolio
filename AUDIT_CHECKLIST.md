# Visual Story Folio — Audit & Checklist

> Derniere mise a jour : 2026-02-17

## Priorite 1 — Securite (CRITIQUE)

- [x] **S1** — Creer `settings.validator.ts` pour valider `PUT /api/settings` ✅
- [x] **S2** — Ajouter rate limiters dedies sur les endpoints publics POST ✅
- [x] **S3** — `GET /api/blog/:id` filtre les brouillons pour les visiteurs publics ✅
- [x] **S4** — `GET /api/testimonials/:id` filtre les temoignages caches pour les visiteurs publics ✅
- [x] **S5** — Socket.io chatbot handler : rate limit ajoute (30 msg/min par socket) ✅

## Priorite 2 — Nettoyage code mort

- [x] **N1** — Supprimer `frontend/src/data/blogMockData.ts` ✅
- [x] **N2** — Supprimer `frontend/src/services/api.legacy.ts` ✅
- [x] **N3** — Supprimer `frontend/src/components/portfolio/ExperienceModal.tsx` ✅
- [x] **N4** — Supprimer `frontend/src/components/admin/AdminDashboard.tsx` ✅
- [x] **N5** — Supprimer `frontend/src/components/admin/AdminForms.tsx` ✅
- [x] **N6** — Nettoyer exports morts `AWARDS`/`TESTIMONIALS`/types dans mockData ✅

## Priorite 3 — Migration React Query + suppression fallbacks mock

- [x] **M1** — `ProjectDetailPage` migre vers `useProject()`, mock supprime, etats loading/erreur/vide ✅
- [x] **M2** — `About.tsx` experiences migre vers `useExperiences()` ✅
- [x] **M3** — `ExperienceDetailPage` mock supprime, message contextuel au lieu de redirect 404 ✅

## Priorite 4 — Base de donnees

- [x] **D1** — Index sur `comments.post_id` ✅
- [x] **D2** — Index composite sur `blog_views(post_id, visitor_hash)` ✅
- [x] **D3** — Index sur `appointments.date` ✅
- [x] **D4** — Index sur `appointments.email` ✅

## Priorite 5 — Backend hardcode

- [x] **B1** — `BlogPost.ts` author default lit depuis `config.owner.name` (env) ✅
- [x] **B2** — `chatbot.service.ts` entierement dynamique — welcome msg, quick actions, personal info depuis settings DB + env fallback ✅
- [x] **B3** — Validations ajoutees : `blogSlugValidator`, `sendArticleValidator`, `availableSlotsValidator` ✅

## Priorite 6 — UX / Qualite

- [x] **U1** — ChatWindow "Portfolio Agent" → "Assistant" ✅ (reste : Testimonials, LatestBlogPosts, ProjectGallery, ProjectDetailPage)
- [ ] **U2** — Pages legales : `LegalMentions.tsx` et `TermsOfService.tsx` — donnees fictives a remplacer
- [x] **U3** — `AdminForms.tsx` — SUPPRIME ✅
- [ ] **U4** — Accents manquants dans certains textes FR

## Bonus — Chatbox responsive

- [x] Chatbox depassait le viewport (haut coupe) — corrige avec `max-h-[calc(100vh-4rem)]` ✅
- [x] Bouton trigger repositionne pour etre coherent avec la fenetre ✅

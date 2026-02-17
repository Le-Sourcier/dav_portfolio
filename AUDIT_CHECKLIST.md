# Visual Story Folio — Audit & Checklist

> Derniere mise a jour : 2026-02-17

## Priorite 1 — Securite (CRITIQUE)

- [x] **S1** — Creer `settings.validator.ts` pour valider `PUT /api/settings` ✅
- [x] **S2** — Ajouter rate limiters dedies sur les endpoints publics POST ✅
- [x] **S3** — `GET /api/blog/:id` expose les brouillons non publies — filtre ajoute ✅
- [x] **S4** — `GET /api/testimonials/:id` expose les temoignages caches — filtre ajoute ✅
- [x] **S5** — Socket.io chatbot handler : rate limit ajoute (30 msg/min par socket) ✅

## Priorite 2 — Nettoyage code mort

- [ ] **N1** — Supprimer `frontend/src/data/blogMockData.ts` (plus importe nulle part)
- [ ] **N2** — Supprimer `frontend/src/services/api.legacy.ts` (URL port 5000 obsolete, jamais importe)
- [ ] **N3** — Supprimer `frontend/src/components/portfolio/ExperienceModal.tsx` (exporte, jamais importe)
- [ ] **N4** — Supprimer `frontend/src/components/admin/AdminDashboard.tsx` (legacy, remplace par AdminLayout)
- [ ] **N5** — Supprimer `frontend/src/components/admin/AdminForms.tsx` (importe uniquement par AdminDashboard mort)
- [ ] **N6** — Nettoyer imports inutiles : `Zap` dans ProjectDetailPage, `nextProject` variable morte, exports `AWARDS`/`TESTIMONIALS` dans mockData

## Priorite 3 — Migration React Query + suppression fallbacks mock

- [ ] **M1** — Migrer `ProjectDetailPage` : `api.get('/projects')` → hook React Query, supprimer fallback PROJECTS mock, ajouter etats loading/erreur/vide
- [ ] **M2** — Migrer `About.tsx` experiences : `api.get('/experiences')` → hook React Query
- [ ] **M3** — Supprimer fallback mock sur `ExperienceDetailPage` (`cvData.experience`), ajouter message contextuel au lieu de redirect 404

## Priorite 4 — Base de donnees

- [ ] **D1** — Ajouter index sur `comments.postId`
- [ ] **D2** — Ajouter index composite sur `blog_views(postId, visitorHash)`
- [ ] **D3** — Ajouter index sur `appointments.date`
- [ ] **D4** — Ajouter index sur `appointments.email`

## Priorite 5 — Backend hardcode

- [ ] **B1** — `BlogPost.ts:117` — `defaultValue: 'Yao David Logan'` pour author → lire depuis settings/env
- [ ] **B2** — `chatbot.service.ts` — message initial, skills, quick actions, DEFAULT_INFO tous en dur → lire depuis settings
- [ ] **B3** — Validation manquante sur `POST /newsletter/send-article`, `GET /blog/slug/:slug`, `GET /appointments/available`

## Priorite 6 — UX / Qualite

- [ ] **U1** — Uniformiser la langue FR : Testimonials ("Voices of Partners"), LatestBlogPosts ("INSIGHTS &"), ChatWindow ("Portfolio Agent"), ProjectGallery ("Portfolio"), ProjectDetailPage ("Services", "Stack")
- [ ] **U2** — Pages legales : `LegalMentions.tsx` et `TermsOfService.tsx` contiennent des donnees fictives ("Alexandre Riviere", "Creative Studio SAS", adresse Paris) — remplacer par donnees dynamiques depuis env/settings
- [ ] **U3** — `AdminForms.tsx:229` — `author: 'Alexandre Riviere'` en dur
- [ ] **U4** — Accents manquants dans certains textes FR (inconsistance entre `é` et `e`)

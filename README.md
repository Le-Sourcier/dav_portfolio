# Visual Story Folio

Portfolio personnel fullstack avec blog, prise de rendez-vous, chatbot IA, et espace d'administration complet.

## Stack technique

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — theming via CSS custom properties (oklch)
- **shadcn/ui** — composants UI (Radix UI)
- **TanStack React Query** — gestion cache/requetes API
- **Zustand** — state management (auth, settings, UI)
- **Framer Motion** — animations et transitions
- **Sonner** — notifications toast

### Backend
- **Express** + **TypeScript**
- **Sequelize** + **PostgreSQL**
- **JWT** — authentification admin + visiteur (OTP)
- **node-cron** — auto-expiration rendez-vous + nettoyage OTP
- **express-validator** — validation des entrees

## Fonctionnalites

### Portfolio public
- Page d'accueil avec hero, projets, experiences, temoignages, blog, contact
- **Blog** — articles Markdown, recherche, filtres par categorie, hero post, cartes CTA (newsletter, services)
- **Commentaires** — verification email par OTP avant publication
- **Prise de rendez-vous** — calendrier, creneaux horaires, verification OTP, state machine (pending → confirmed → completed → expired)
- **Chatbot IA** — assistant conversationnel avec actions rapides configurables
- **Newsletter** — inscription/desinscription avec notification par email
- **Contact** — formulaire direct (sans OTP)
- **Theme** — dark/light avec transition View Transitions API (clip-path circle reveal)
- **Pages legales** — mentions legales, CGU, politique de confidentialite (donnees dynamiques)

### Espace admin (`/dashboard`)
- **Dashboard** — statistiques (contacts, RDV, articles, temoignages)
- **Blog** — editeur Markdown complet, publication, gestion commentaires
- **Projets** — CRUD avec images, technologies, liens
- **Experiences** — editeur pleine page
- **Temoignages** — moderation, pagination
- **Rendez-vous** — gestion statuts (state machine), transitions valides uniquement
- **Contacts** — lecture, marquage lu/non-lu
- **Newsletter** — statistiques, envoi d'articles aux abonnes
- **Parametres** :
  - Profil (nom, email, titre, bio, avatar, telephone)
  - Expertise (competences frontend/backend/outils + formation)
  - Liens sociaux
  - SEO & Open Graph
  - Chatbot (activation, message de bienvenue, actions rapides)
  - Securite (mot de passe)
  - Apparence (theme, preferences d'affichage)

## Demarrage rapide

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env    # Configurer les variables
npm install
npm run dev             # Port 3002
```

### Frontend

```bash
cd frontend
cp .env.example .env    # Configurer les variables
npm install
npm run dev             # Port 3000
```

### Variables d'environnement (frontend)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l'API backend |
| `VITE_APP_BRAND` | Nom de la marque |
| `VITE_OWNER_NAME` | Nom du proprietaire |
| `VITE_OWNER_EMAIL` | Email de contact |
| `VITE_OWNER_TITLE` | Titre professionnel |
| `VITE_OWNER_AVATAR` | URL de l'avatar |
| `VITE_CHATBOT_ENABLED` | Activer le chatbot (true/false) |

## Structure du projet

```
frontend/src/
├── components/
│   ├── admin/          # Pages et composants admin
│   ├── portfolio/      # Pages et composants publics
│   │   ├── blog/       # BlogCard, BlogCtaCard, AuthorCard, RelatedPosts
│   │   ├── chatbot/    # ChatbotContainer, useChatbot, MessageBubble
│   │   └── ...         # About, Contact, Navbar, ThemeToggle, etc.
│   ├── shared/         # MarkdownRenderer, OtpVerification, SeoHead
│   └── ui/             # shadcn/ui components
├── config/             # envConfig (centralise .env)
├── data/               # cvData (fallback), mockData
├── hooks/
│   ├── queries/        # TanStack Query hooks par entite
│   ├── useProfile.ts   # Donnees profil unifiees (API > store > env)
│   └── useVisitorSession.ts  # Session visiteur + OTP
├── services/api/       # Clients API types par entite
├── stores/             # Zustand (auth, settings, UI)
└── types/              # Types TypeScript

backend/src/
├── config/             # Database, JWT, env
├── controllers/        # Controllers par entite
├── cron/               # Auto-expiration RDV + cleanup OTP
├── middlewares/         # Auth, rate limiting, validation, visitor auth
├── models/             # Sequelize models
├── routes/             # Express routes
├── services/           # Business logic par entite
├── validators/         # express-validator schemas
└── views/emails/       # Templates email (OTP, etc.)
```

## Securite

- **Admin** : JWT via `/api/auth/login`
- **Visiteur** : verification email par OTP (6 chiffres, 10min TTL) + JWT visiteur distinct
- **Rate limiting** : sur tous les endpoints publics POST
- **CORS** : configuration stricte avec `X-Visitor-Token` autorise
- **Validation** : express-validator sur toutes les entrees
- **Deduplication** : vues blog par hash SHA256 (IP + User-Agent)

## Licence

MIT.

import type { BlogPostSeed } from "../types.js";

const content = `> Six mois de production sur Next.js 14 avec l'App Router et les Server Components. Ce qui a marché, ce qui a fait mal, ce que je referais et ce que je ne referais plus.

## 1. Le contexte

Sur Nexus (plateforme fintech), j'ai migré une stack Pages Router de Next.js 13 vers App Router en 14. Les promesses : Server Components, streaming, layouts imbriqués, data fetching simplifié, parallèles routes. Six mois plus tard, le bilan est nuancé. Énormément de valeur, mais aussi quelques pièges qui coûtent cher en production.

Cet article condense les apprentissages. Pas de "Next.js c'est génial" générique : ce qui fonctionne vraiment, ce qui dérape, et comment s'en sortir.

## 2. Ce qui a marché immédiatement

### 2.1 Layouts imbriqués

L'avantage est énorme. Avant, on avait un \`_app.tsx\` global et des composants \`Layout\` partagés à la main. Maintenant chaque segment a son \`layout.tsx\`, qui ne re-render pas quand on navigue dans ses enfants.

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <DashboardSidebar />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

Le sidebar reste statique entre les routes \`/dashboard/portfolio\` et \`/dashboard/transactions\`. Gain perçu énorme côté utilisateur.

### 2.2 Streaming + Suspense

Pouvoir streamer une page section par section change le ressenti de chargement. Le hero s'affiche immédiatement, les blocs de données arrivent progressivement. Sur Nexus, le LCP a chuté de 3,2 s à 1,4 s en moyenne juste avec ça.

\`\`\`tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <>
      <PortfolioHeader />
      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <MarketChart />
      </Suspense>
    </>
  );
}
\`\`\`

### 2.3 generateMetadata par segment

La métadonnée par page est devenue trivial. Plus de \`next/head\` à orchestrer manuellement.

\`\`\`tsx
// app/projects/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await fetchProject(params.slug);
  return {
    title: \`\${project.title} — Portfolio\`,
    description: project.excerpt,
    openGraph: { images: [project.image] },
  };
}
\`\`\`

## 3. Ce qui m'a fait mal

### 3.1 La frontière Server / Client est subtile

\`"use client"\` au sommet d'un fichier marque tout l'arbre comme client. Une lib qui dépend de \`window\` importée transitivement casse silencieusement. Le premier mois j'ai eu plusieurs builds qui passaient en dev et plantaient en prod.

La discipline : **isoler les composants client** dans leurs propres fichiers, garder les pages et layouts en server par défaut.

\`\`\`tsx
// app/dashboard/page.tsx — Server Component
import { InteractiveChart } from "@/components/InteractiveChart";

export default async function DashboardPage() {
  const data = await fetchData(); // serveur
  return <InteractiveChart data={data} />; // composant client, fichier séparé
}

// components/InteractiveChart.tsx
"use client";
import { useState } from "react";
// ... composant interactif
\`\`\`

### 3.2 Le cache agressif de \`fetch\`

Par défaut, \`fetch\` dans un Server Component est mis en cache "force-cache". Personne ne s'y attend la première fois. Sur Nexus, le dashboard affichait un solde gelé pendant 60 minutes.

\`\`\`tsx
// ❌ Mauvais — solde figé à la première requête
const balance = await fetch("/api/balance").then(r => r.json());

// ✅ Bon — refetch à chaque requête
const balance = await fetch("/api/balance", { cache: "no-store" }).then(r => r.json());

// ✅ Aussi bon — revalidate régulier
const balance = await fetch("/api/balance", { next: { revalidate: 30 } }).then(r => r.json());
\`\`\`

Règle de pouce : pour toute donnée utilisateur ou financière, \`cache: "no-store"\`. Pour les contenus marketing/blog : \`revalidate\` selon la fraîcheur acceptable.

### 3.3 Hydratation et flash

Quand un Server Component renvoie du contenu différent de ce que le client recalcule (typiquement à cause d'un \`Date.now()\` ou d'un \`localStorage\`), on a un mismatch d'hydratation. Erreur console + flash visuel.

Patterns qui ont marché :
- Pour le rendu conditionnel basé sur \`window\` ou \`localStorage\` → \`useEffect\` après mount, jamais en rendu initial
- Pour les dates "il y a X minutes" → calculer côté serveur uniquement, envoyer un ISO au client qui le formate dans son fuseau

### 3.4 Parallel routes — puissant mais ésotérique

Les routes parallèles (\`@modal\`, \`@notifications\`) sont une bombe d'expressivité. Mais la doc est mince et les patterns peu documentés. J'ai mis du temps à comprendre comment intercepter une route pour afficher une modale au-dessus d'une page sans perdre l'URL.

\`\`\`
app/
  layout.tsx
  page.tsx                      ← page d'accueil
  @modal/
    default.tsx                 ← rien par défaut
    (.)projects/[slug]/page.tsx  ← intercepté : ouvre une modale
  projects/
    [slug]/page.tsx             ← navigation directe : page complète
\`\`\`

Quand on clique sur une carte projet depuis la home, ça ouvre une modale (route interceptée). Quand on partage l'URL, ça ouvre la page complète. Le même routeur sert les deux. Gain UX énorme une fois maîtrisé.

## 4. Server Actions — la vraie révolution

Pouvoir écrire une mutation côté serveur sans construire d'API REST, c'est ce qui m'a fait le plus gagner de temps.

\`\`\`tsx
// app/(auth)/login/actions.ts
"use server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const session = await authService.login(email, password);
  if (!session) {
    return { error: "Identifiants invalides" };
  }

  cookies().set("session", session.token, { httpOnly: true, secure: true });
  redirect("/dashboard");
}

// app/(auth)/login/page.tsx
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <form action={loginAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Connexion</button>
    </form>
  );
}
\`\`\`

Avantages :
- Pas d'API REST à câbler
- Validation côté serveur, plus de risque de bypass client
- Progressive enhancement natif (marche sans JS)

Limites :
- Pas de support natif pour les progress streams pendant la mutation
- Erreurs réseau remontées côté client en tant que message générique — il faut wrapper pour avoir un meilleur UX

## 5. Le coût des Server Components

Le marketing parle de "JavaScript bundle minimal". C'est vrai et c'est faux.

Vrai : un Server Component pur ne shippe aucun JS. Faux : dès qu'on a des composants client (formulaires, interactions), le bundle grandit. Sur Nexus, après 4 mois, le bundle JS first-party était à 280 ko gzippé — plus que ce qu'on avait avec Pages Router et un peu d'optimisation manuelle.

La leçon : **Server Components réduit le JS *par défaut*, mais ne dispense pas de surveiller le bundle**. \`next-bundle-analyzer\` reste indispensable.

## 6. Le déploiement Vercel vs self-hosted

Next.js 14 sur Vercel : tout marche. ISR, Edge Functions, streaming, cache distribué.

Next.js 14 self-hosted : la moitié des features demande un setup spécifique. Pour Nexus qui tourne sur infrastructure dédiée (souveraineté des données fintech) :
- ISR avec \`revalidate\` : OK avec un cache filesystem partagé entre instances
- Streaming : OK si Nginx ne buffer pas (config \`X-Accel-Buffering: no\`)
- Edge Functions : non disponibles, fallback Node Runtime
- Image Optimization : nécessite un CDN externe ou un proxy local

Le coût "self-hosted" est sous-estimé dans la doc officielle. Compter 1 à 2 semaines de setup et de tuning si vous ne voulez pas Vercel.

## 7. SEO et SSR pur

Pour un blog ou un site contenu, Server Components + ISR est imbattable. Pour Nexus blog (sous-domaine, ~200 articles), la migration depuis Gatsby a divisé le LCP par 2 et amélioré les Core Web Vitals.

Quelques patterns :
- \`generateStaticParams\` pour pré-générer les slugs au build
- \`revalidate: 3600\` pour rafraîchir l'heure passée
- Sitemap dynamique via \`app/sitemap.ts\`
- RSS via \`app/feed.xml/route.ts\`

\`\`\`tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllSlugs();
  return posts.map((slug) => ({ slug }));
}

export const revalidate = 3600;
\`\`\`

## 8. Migrations difficiles

### 8.1 \`getServerSideProps\` → Server Component

Mécanique mais souvent piégeux. La signature change, le pattern de redirection aussi.

\`\`\`tsx
// Avant (Pages Router)
export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/login", permanent: false } };
  return { props: { user: session.user } };
}

// Après (App Router)
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <Dashboard user={session.user} />;
}
\`\`\`

### 8.2 \`next/router\` → \`next/navigation\`

Les hooks changent : \`useRouter\`, \`usePathname\`, \`useSearchParams\` au lieu d'un seul \`useRouter\`. Refactor systématique mais simple.

### 8.3 API Routes → Route Handlers

\`pages/api/foo.ts\` devient \`app/api/foo/route.ts\` avec des fonctions exportées \`GET\`, \`POST\`, etc. La signature change, le typage devient plus strict.

\`\`\`tsx
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await db.user.create({ data: body });
  return NextResponse.json(created, { status: 201 });
}
\`\`\`

## 9. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| \`"use client"\` trop large | Bundle JS gonfle | Isoler les composants client dans des fichiers dédiés |
| Cache fetch implicite | Données figées | \`cache: "no-store"\` ou \`revalidate\` |
| Hydratation mismatch | Console warnings + flash | Calculs runtime via \`useEffect\` |
| ISR sur données utilisateur | Données d'un user montrées à un autre | Jamais d'ISR sur du contenu personnalisé |
| Self-hosted sans tuning | Streaming buffer, ISR cassée | Config Nginx + cache filesystem partagé |
| Server Actions sans validation | Risque bypass client | Zod ou validateur côté serveur systématique |
| Routes parallèles non documentées | Équipe perdue | README + diagrammes explicites |

## 10. Ce que je referais

- Server Components pour les pages contenu
- Streaming + Suspense systématique
- Server Actions pour les mutations simples
- Layouts imbriqués pour structurer le menu/sidebar
- ISR pour le marketing et blog
- generateMetadata pour le SEO par page

## 11. Ce que je ne referais plus

- Migrer une app fortement interactive juste pour "être à jour" — le gain est faible et le coût élevé
- Compter sur le cache fetch par défaut — toujours expliciter
- Self-hoster sur infrastructure exotique — partir sur Vercel ou un Kubernetes très standardisé

## 12. Conclusion

App Router est une vraie avancée pour les apps contenu et les portails à structure claire. Pour les apps très interactives, le gain est modéré et les pièges réels.

Si vous démarrez aujourd'hui : foncez sur App Router. Si vous avez une grosse base Pages Router : migrez section par section, jamais en big bang.

L'investissement de 4 à 8 semaines de montée en compétence sur les patterns Server Components paie ensuite chaque mois. Mais il faut accepter la courbe d'apprentissage.`;

const contentEn = `> Six months of production on Next.js 14 with App Router and Server Components. What worked, what hurt, what I'd do again and what I wouldn't.

## 1. The context

On Nexus (fintech platform), I migrated a Pages Router stack from Next.js 13 to App Router on 14. Promises: Server Components, streaming, nested layouts, simplified data fetching, parallel routes. Six months later, the verdict is nuanced. Massive value, but real pitfalls that cost in production.

This article condenses the learnings. No generic "Next.js is great": what actually works, what derails, and how to recover.

## 2. What worked immediately

### 2.1 Nested layouts

Huge advantage. Before, we had a global \`_app.tsx\` and shared \`Layout\` components glued by hand. Now each segment has its own \`layout.tsx\` that doesn't re-render when navigating among its children.

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <DashboardSidebar />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

The sidebar stays static between \`/dashboard/portfolio\` and \`/dashboard/transactions\`. Big perceived UX gain.

### 2.2 Streaming + Suspense

Being able to stream a page section by section changes the loading feel. The hero appears immediately, data blocks come progressively. On Nexus, LCP dropped from 3.2 s to 1.4 s average just from this.

\`\`\`tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <>
      <PortfolioHeader />
      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <MarketChart />
      </Suspense>
    </>
  );
}
\`\`\`

### 2.3 Per-segment generateMetadata

Per-page metadata became trivial. No more \`next/head\` orchestration.

\`\`\`tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await fetchProject(params.slug);
  return {
    title: \`\${project.title} — Portfolio\`,
    description: project.excerpt,
    openGraph: { images: [project.image] },
  };
}
\`\`\`

## 3. What hurt

### 3.1 The Server/Client boundary is subtle

\`"use client"\` at the top of a file marks the entire tree as client. A lib depending on \`window\` imported transitively breaks silently. The first month I had several builds passing in dev and crashing in prod.

Discipline: **isolate client components** in their own files, keep pages and layouts as server by default.

\`\`\`tsx
// app/dashboard/page.tsx — Server Component
import { InteractiveChart } from "@/components/InteractiveChart";

export default async function DashboardPage() {
  const data = await fetchData(); // server
  return <InteractiveChart data={data} />; // client component, separate file
}

// components/InteractiveChart.tsx
"use client";
import { useState } from "react";
\`\`\`

### 3.2 Aggressive \`fetch\` cache

By default, \`fetch\` in a Server Component is "force-cache". Nobody expects it first time. On Nexus, the dashboard displayed a frozen balance for 60 minutes.

\`\`\`tsx
// ❌ Bad — balance frozen at first request
const balance = await fetch("/api/balance").then(r => r.json());

// ✅ Good — refetch each request
const balance = await fetch("/api/balance", { cache: "no-store" }).then(r => r.json());

// ✅ Also good — regular revalidate
const balance = await fetch("/api/balance", { next: { revalidate: 30 } }).then(r => r.json());
\`\`\`

Rule of thumb: for any user or financial data, \`cache: "no-store"\`. For marketing/blog content: \`revalidate\` per acceptable freshness.

### 3.3 Hydration and flash

When a Server Component returns content different from what the client recomputes (typically because of \`Date.now()\` or \`localStorage\`), you get a hydration mismatch. Console error + visual flash.

Working patterns:
- For conditional rendering based on \`window\` or \`localStorage\` → \`useEffect\` after mount, never in initial render
- For "X minutes ago" dates → compute server-side only, send an ISO to the client which formats in its timezone

### 3.4 Parallel routes — powerful but esoteric

Parallel routes (\`@modal\`, \`@notifications\`) are an expressiveness bomb. But docs are thin and patterns sparsely documented. Took me time to figure out how to intercept a route to show a modal over a page without losing the URL.

\`\`\`
app/
  layout.tsx
  page.tsx                      ← home
  @modal/
    default.tsx                 ← nothing by default
    (.)projects/[slug]/page.tsx  ← intercepted: opens a modal
  projects/
    [slug]/page.tsx             ← direct navigation: full page
\`\`\`

Clicking a project card from home opens a modal (intercepted route). Sharing the URL opens the full page. Same router serves both. Huge UX gain once mastered.

## 4. Server Actions — the real revolution

Being able to write a server-side mutation without building a REST API is what saved me the most time.

\`\`\`tsx
// app/(auth)/login/actions.ts
"use server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const session = await authService.login(email, password);
  if (!session) return { error: "Invalid credentials" };

  cookies().set("session", session.token, { httpOnly: true, secure: true });
  redirect("/dashboard");
}
\`\`\`

Pros:
- No REST API to wire
- Server-side validation, no client bypass risk
- Native progressive enhancement (works without JS)

Limits:
- No native support for progress streams during mutation
- Network errors surfaced as generic messages on client — need to wrap for better UX

## 5. The Server Components cost

Marketing talks of "minimal JavaScript bundle". True and false.

True: a pure Server Component ships zero JS. False: as soon as you have client components (forms, interactions), the bundle grows. On Nexus, after 4 months, first-party JS bundle was at 280 KB gzipped — more than we had with Pages Router and some manual optimization.

Lesson: **Server Components reduce JS *by default*, but don't exempt you from watching the bundle**. \`next-bundle-analyzer\` stays essential.

## 6. Vercel vs self-hosted deployment

Next.js 14 on Vercel: everything works. ISR, Edge Functions, streaming, distributed cache.

Next.js 14 self-hosted: half the features need specific setup. For Nexus running on dedicated infrastructure (fintech data sovereignty):
- ISR with \`revalidate\`: OK with a shared filesystem cache between instances
- Streaming: OK if Nginx doesn't buffer (\`X-Accel-Buffering: no\`)
- Edge Functions: not available, Node Runtime fallback
- Image Optimization: needs an external CDN or local proxy

The self-hosted cost is underestimated in official docs. Plan 1–2 weeks of setup and tuning if you skip Vercel.

## 7. SEO and pure SSR

For a blog or content site, Server Components + ISR is unbeatable. For Nexus blog (subdomain, ~200 articles), migrating from Gatsby halved LCP and improved Core Web Vitals.

Patterns:
- \`generateStaticParams\` to pre-generate slugs at build
- \`revalidate: 3600\` to refresh hourly
- Dynamic sitemap via \`app/sitemap.ts\`
- RSS via \`app/feed.xml/route.ts\`

## 8. Difficult migrations

### 8.1 \`getServerSideProps\` → Server Component

Mechanical but often tricky. Signature changes, redirect pattern too.

\`\`\`tsx
// Before
export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/login", permanent: false } };
  return { props: { user: session.user } };
}

// After
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <Dashboard user={session.user} />;
}
\`\`\`

### 8.2 \`next/router\` → \`next/navigation\`

Hooks change: \`useRouter\`, \`usePathname\`, \`useSearchParams\` instead of a single \`useRouter\`. Mechanical refactor.

### 8.3 API Routes → Route Handlers

\`pages/api/foo.ts\` becomes \`app/api/foo/route.ts\` with exported \`GET\`, \`POST\` functions. Signature changes, typing becomes stricter.

## 9. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| \`"use client"\` too broad | JS bundle bloat | Isolate client components in dedicated files |
| Implicit fetch cache | Frozen data | \`cache: "no-store"\` or \`revalidate\` |
| Hydration mismatch | Console warnings + flash | Runtime computations in \`useEffect\` |
| ISR on user data | One user's data shown to another | Never ISR on personalized content |
| Self-hosted without tuning | Streaming buffer, broken ISR | Nginx config + shared filesystem cache |
| Server Actions without validation | Client bypass risk | Always Zod or server validator |
| Undocumented parallel routes | Team lost | README + explicit diagrams |

## 10. What I'd do again

- Server Components for content pages
- Systematic Streaming + Suspense
- Server Actions for simple mutations
- Nested layouts to structure menu/sidebar
- ISR for marketing and blog
- generateMetadata for per-page SEO

## 11. What I wouldn't redo

- Migrate a highly interactive app just "to be current" — gain is small, cost is high
- Rely on default fetch cache — always explicit
- Self-host on exotic infrastructure — go Vercel or very standardized Kubernetes

## 12. Closing

App Router is a real advance for content apps and well-structured portals. For highly interactive apps, gain is moderate and pitfalls real.

Starting today: go App Router. Big Pages Router base: migrate section by section, never big bang.

The 4–8 weeks investment in Server Components patterns pays back monthly. But you must accept the learning curve.`;

export const nextjs14AppRouterRex: BlogPostSeed = {
  title: "Next.js 14 App Router en production — leçons après 6 mois sur Nexus",
  title_en:
    "Next.js 14 App Router in production — lessons after 6 months on Nexus",
  slug: "nextjs-14-app-router-rex-production",
  excerpt:
    "Server Components, streaming, layouts imbriqués, Server Actions, parallel routes : ce qui marche vraiment et ce qui pique en production sur une plateforme fintech.",
  excerpt_en:
    "Server Components, streaming, nested layouts, Server Actions, parallel routes: what actually works and what stings in production on a fintech platform.",
  content,
  content_en: contentEn,
  category: "Retour d'experience",
  imageUrl:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1600&q=80",
  readTime: "16 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["nextjs", "app-router", "react", "ssr", "server-components"],
};

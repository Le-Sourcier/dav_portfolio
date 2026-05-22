import type { BlogPostSeed } from "../types.js";

const content = `> Neuf mois à enseigner le développement fullstack à des apprenants en reconversion. Ce que j'ai appris sur le clean code, la dette technique et la pédagogie réelle.

## 1. Le contexte

De juillet 2024 à mars 2025, j'ai formé une promotion de 18 apprenants à l'IAFP La Pyramide (institut de formation modulaire accrédité au Togo). Programme : fondamentaux algorithmiques, JavaScript, TypeScript, Dart, Next.js, Flutter, React Native, Git. Objectif : qu'ils soient capables de livrer des applications fullstack autonomes à la sortie.

Taux de certification final : 85 %. Mais ce n'est pas ce qui m'a marqué le plus. Ce qui m'a marqué, c'est ce que j'ai appris **moi** sur le code et la dette technique en regardant des débutants l'écrire pour la première fois.

## 2. Ce qu'on raconte n'est pas ce qu'on fait

Premier choc : ce que je croyais "instinctif" dans mon code ne l'est pas. Quand je nomme une fonction \`fetchUserPortfolio\`, je sais pourquoi je n'ai pas mis \`getData\`. Mais cette connaissance est implicite. Un apprenant écrit \`getData\` et ne voit pas le problème — parce que ça marche.

Le clean code n'est pas un ensemble de règles esthétiques. C'est un **contrat de communication** entre le code et le futur lecteur (qui sera vous dans 6 mois). Ce contrat n'est pas inné. Il s'apprend en regardant le code des autres se casser en production.

J'ai dû verbaliser des choses que je n'avais jamais expliquées : pourquoi un nom de variable de 3 lettres dans une fonction de 80 lignes est un drame, pourquoi un \`if\` imbriqué à 5 niveaux est une dette, pourquoi un commentaire qui paraphrase le code est du bruit.

## 3. La règle qui a tout changé : "ton code sera lu 10 fois"

Première chose que j'ai martelée : **le code est lu 10 fois plus qu'il est écrit**. Pas par marketing — par calcul mathématique.

Un projet vit 2 à 5 ans en production. Pendant ce temps, vous le relisez :
- Pour ajouter une fonctionnalité
- Pour fixer un bug
- Pour expliquer à un collègue
- Pour le porter sur une nouvelle techno
- Pour rendre compte au PO

Si écrire une fonction prend 10 minutes mais la rendre lisible en prend 12, le surcoût initial est récupéré dès le premier débogage.

J'ai forcé cette discipline avec une règle pratique : **chaque PR doit pouvoir être expliquée à voix haute en 2 minutes**. Si l'apprenant n'arrivait pas, c'est que le code était trop dense, trop confus, ou faisait trop de choses. On refactorait avant de merger.

## 4. Les anti-patterns qui sont revenus le plus souvent

### 4.1 Les noms vagues

\`data\`, \`info\`, \`result\`, \`temp\`, \`val\`. Symptômes de "je sais pas comment l'appeler, mais ça marche".

Correction : **toujours nommer par ce que c'est, pas par ce que c'est techniquement**. Pas \`array\`, mais \`activeUsers\`. Pas \`fn\`, mais \`computeMonthlyRevenue\`.

\`\`\`typescript
// ❌ Vague
function getData(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  return data;
}

// ✅ Précis
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(\`/api/users/\${userId}\`);
  return response.json();
}
\`\`\`

### 4.2 Les fonctions qui font tout

J'ai vu des fonctions de 200 lignes qui validaient, fetchaient, transformaient, enregistraient et notifiaient. Toutes en une seule.

Règle : **une fonction = un verbe = une responsabilité**. Si le nom contient un "et", c'est suspect. Si on doit faire défiler pour voir la fin, c'est cassé.

Limite pratique enseignée : **30 lignes pour une fonction, refactor obligatoire à 50**. Pas une règle dogmatique, un signal d'alerte.

### 4.3 Le \`if\` qui pyramide

\`\`\`typescript
// ❌ Pyramide
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        if (order.payment.status === "valid") {
          // ... 40 lignes de logique
        }
      }
    }
  }
}

// ✅ Early returns
function processOrder(order: Order): OrderResult {
  if (!order) return { ok: false, reason: "no_order" };
  if (order.items.length === 0) return { ok: false, reason: "empty_cart" };
  if (!order.payment) return { ok: false, reason: "no_payment" };
  if (order.payment.status !== "valid") return { ok: false, reason: "invalid_payment" };

  // logique principale, à plat
}
\`\`\`

La pyramide de \`if\` est un sucre lent qui s'accumule. Les early returns sortent le code de la pyramide. Toujours rejeter d'abord, traiter ensuite.

### 4.4 Les commentaires qui paraphrasent

\`\`\`typescript
// ❌ Bruit
// On incrémente le compteur
counter += 1;

// ❌ Faux ami : ce commentaire devient faux quand le code change
// Récupère les utilisateurs actifs des 30 derniers jours
const users = await User.findAll({ where: { lastSeen: { [Op.gt]: thirtyDaysAgo } } });

// ✅ Commente le pourquoi, pas le quoi
// Cache 5 min pour réduire la charge sur la base — voir incident 2025-01-14
const users = await User.findAll({ ... });
\`\`\`

La règle enseignée : **le commentaire doit expliquer ce que le code ne peut pas dire**. Pas paraphraser. Si le code est confus au point qu'il demande un commentaire pour être compris, refactor d'abord, commente ensuite.

### 4.5 Les paramètres sans nom

\`\`\`typescript
// ❌ Quel est ce true ? Et ce 30 ?
createUser("Alice", "alice@test.com", true, 30);

// ✅ Objet avec champs explicites
createUser({
  name: "Alice",
  email: "alice@test.com",
  isAdmin: true,
  ageYears: 30,
});
\`\`\`

Règle pratique : **3 paramètres maximum, au-delà on prend un objet**. Le call-site devient auto-documenté.

## 5. La discipline de Git

90 % des apprenants arrivaient avec un compte GitHub vide ou un seul commit "Initial commit". J'ai imposé tôt :

- Branches par fonctionnalité, jamais en \`main\` direct
- Commits atomiques (un commit = un changement cohérent)
- Messages descriptifs au présent (\`add login form\`, pas \`added login form\`)
- PR avec description : "qu'est-ce que ça change, pourquoi"
- Review entre apprenants avant merge

Le but n'était pas la perfection git. Le but était d'**ancrer la culture du code public**. Une fois qu'ils ont compris que leur code serait lu, les habitudes ont basculé.

## 6. Le pair-programming systématique

Une heure par jour de pair-programming forcé (driver/navigator). Au début, douloureux. Après 2 semaines, transformation visible :

- Les apprenants verbalisent leur raisonnement
- Les erreurs sont rattrapées en 30 secondes au lieu de 30 minutes
- Le vocabulaire technique s'aligne dans la promotion
- La culture de "demander n'est pas une faiblesse" s'installe

C'est aussi le moment où j'ai vu naître les meilleurs développeurs : pas forcément ceux qui codaient le plus vite, mais ceux qui posaient les meilleures questions.

## 7. L'évaluation par projet

J'ai supprimé les QCM théoriques. À la place : un projet de fin de module, défendu à l'oral devant la promotion.

Critères :
1. Le code tourne et fait ce qu'il prétend faire (50 %)
2. Le code est lisible par un dev qui ne l'a pas écrit (25 %)
3. Le code gère les erreurs prévisibles (15 %)
4. Le code a un README et un déploiement (10 %)

Aucun bonus pour la "performance pure" ou les "techniques avancées". Juste la livrable et sa qualité de communication.

Ce barème a tué l'apprentissage par cœur et forcé la compréhension. Les meilleurs apprenants n'étaient pas ceux qui avaient retenu le plus de syntaxe, mais ceux qui livraient le code le plus clair.

## 8. La dette technique vue par un débutant

Le plus étonnant : les débutants voient la dette technique mieux qu'on ne le croit. Ils ne savent juste pas la nommer.

Quand un apprenant arrive et dit "je comprends pas mon propre code d'hier", c'est qu'il a écrit de la dette. Quand il dit "ça marche mais je sais pas pourquoi", c'est un signal qu'il faut refactor avant de continuer.

J'ai institutionnalisé le **"daily refactor"** : tous les matins, 30 minutes, chaque apprenant relit le code de la veille et le rend meilleur. Cette pratique seule a changé le niveau moyen de la promotion en 6 semaines.

## 9. Les outils qui ont compté

- **ESLint + Prettier** : automatisation de l'esthétique pour ne pas avoir à en discuter
- **TypeScript strict** : pour qu'erreur de logique devienne erreur de compilation
- **VS Code + GitHub Copilot** : surtout pour les boilerplate, ne JAMAIS pour la logique métier (sinon ils n'apprennent pas)
- **Cypress / Playwright** pour les tests E2E sur les projets de fin
- **Vercel / Railway** pour le déploiement (gratuit, rapide, motivant)

## 10. Ce qui m'a fait changer ma propre pratique

Trois choses que j'ai changées dans **mon** code après cette mission :

1. **Je nomme mieux** — la verbalisation devant des apprenants m'a forcé à voir mes mauvais noms
2. **Je refactor plus tôt** — voir la dette s'accumuler en accéléré chez des débutants m'a rendu allergique à laisser un fichier dégrader
3. **J'écris moins de commentaires** — je préfère un nom explicite à un commentaire descriptif

## 11. Pièges à éviter en formation

| Piège | Symptôme | Correction |
|-------|----------|------------|
| Théorie sans pratique | Apprenants qui récitent sans comprendre | 70 % pratique minimum |
| Frameworks sans fondations | Bloqués dès que le framework change | Commencer par JS pur, ajouter ensuite |
| Évaluation théorique | Apprentissage par cœur | Évaluation par projet livré |
| Pas de Git tôt | Habitudes solo dangereuses | Branches dès le jour 3 |
| Tutos copiés sans compréhension | Bloqués hors du chemin balisé | Forcer à débugger seul avant aide |
| Pas de pair-programming | Solitude + dette accumulée | Sessions quotidiennes forcées |

## 12. Conclusion

Enseigner m'a rendu meilleur développeur, plus que n'importe quelle formation suivie. Verbaliser des choix tacites, expliquer pourquoi un nom est mauvais, regarder la dette se créer en temps réel — tout ça change la manière dont vous écrivez votre propre code.

Si vous avez l'occasion de former, prenez-la. Pas pour la rémunération (souvent faible), pas pour le statut (souvent ignoré). Pour ce que ça vous apprend sur votre propre métier.

Le clean code n'est pas une exigence du code. C'est une exigence du futur lecteur. Et le futur lecteur, c'est vous.`;

const contentEn = `> Nine months teaching fullstack development to career-switchers. What I learned about clean code, technical debt, and real pedagogy.

## 1. The context

From July 2024 to March 2025, I trained a cohort of 18 learners at IAFP La Pyramide (a state-accredited modular training institute in Togo). Program: algorithmic fundamentals, JavaScript, TypeScript, Dart, Next.js, Flutter, React Native, Git. Goal: that they ship autonomous fullstack applications by the end.

Final certification rate: 85%. But that's not what marked me most. What marked me is what I learned **about myself** on code and technical debt by watching beginners write it for the first time.

## 2. What we say isn't what we do

First shock: what I thought was "instinctive" in my code isn't. When I name a function \`fetchUserPortfolio\`, I know why I didn't write \`getData\`. But that knowledge is implicit. A learner writes \`getData\` and doesn't see the problem — because it works.

Clean code isn't an aesthetic ruleset. It's a **communication contract** between the code and the future reader (which will be you in 6 months). That contract isn't innate. It's learned by watching others' code break in production.

I had to verbalize things I'd never explained: why a 3-letter variable name in an 80-line function is a drama, why a 5-level nested \`if\` is debt, why a comment paraphrasing the code is noise.

## 3. The rule that changed everything: "your code will be read 10 times"

First thing I hammered: **code is read 10 times more than it's written**. Not by marketing — by math.

A project lives 2–5 years in production. During that time, you re-read it:
- To add a feature
- To fix a bug
- To explain to a colleague
- To port to a new tech
- To report to the PO

If writing a function takes 10 minutes but making it readable takes 12, the initial overhead is recovered at the first debug.

I enforced this with a practical rule: **every PR must be explainable aloud in 2 minutes**. If the learner couldn't, the code was too dense, too confused, or did too much. Refactor before merge.

## 4. The anti-patterns I saw most

### 4.1 Vague names

\`data\`, \`info\`, \`result\`, \`temp\`, \`val\`. Symptoms of "I don't know what to call it but it works."

Fix: **always name by what it is, not by what it is technically**. Not \`array\`, but \`activeUsers\`. Not \`fn\`, but \`computeMonthlyRevenue\`.

\`\`\`typescript
// ❌ Vague
function getData(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  return data;
}

// ✅ Precise
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(\`/api/users/\${userId}\`);
  return response.json();
}
\`\`\`

### 4.2 Functions that do everything

I saw 200-line functions that validated, fetched, transformed, persisted and notified. All in one.

Rule: **one function = one verb = one responsibility**. If the name contains an "and", it's suspect. If you have to scroll to see the end, it's broken.

Practical limit taught: **30 lines per function, mandatory refactor at 50**. Not a dogma, a warning signal.

### 4.3 The pyramid \`if\`

\`\`\`typescript
// ❌ Pyramid
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        if (order.payment.status === "valid") {
          // ... 40 lines of logic
        }
      }
    }
  }
}

// ✅ Early returns
function processOrder(order: Order): OrderResult {
  if (!order) return { ok: false, reason: "no_order" };
  if (order.items.length === 0) return { ok: false, reason: "empty_cart" };
  if (!order.payment) return { ok: false, reason: "no_payment" };
  if (order.payment.status !== "valid") return { ok: false, reason: "invalid_payment" };

  // main logic, flat
}
\`\`\`

The \`if\` pyramid is slow sugar that piles up. Early returns flatten the code. Always reject first, process after.

### 4.4 Paraphrasing comments

\`\`\`typescript
// ❌ Noise
// Increment the counter
counter += 1;

// ❌ Liar: comment becomes wrong when code changes
// Fetch active users of the last 30 days
const users = await User.findAll({ where: { lastSeen: { [Op.gt]: thirtyDaysAgo } } });

// ✅ Comment the why, not the what
// 5-min cache to reduce DB load — see incident 2025-01-14
const users = await User.findAll({ ... });
\`\`\`

Rule taught: **comments explain what code cannot**. Don't paraphrase. If code is confused to the point of needing a comment to understand, refactor first, comment second.

### 4.5 Nameless parameters

\`\`\`typescript
// ❌ What's this true? And this 30?
createUser("Alice", "alice@test.com", true, 30);

// ✅ Object with explicit fields
createUser({
  name: "Alice",
  email: "alice@test.com",
  isAdmin: true,
  ageYears: 30,
});
\`\`\`

Practical rule: **3 parameters max, beyond that use an object**. The call-site becomes self-documenting.

## 5. Git discipline

90% of learners arrived with an empty GitHub account or a single "Initial commit". Early imposed:

- Branches per feature, never direct to \`main\`
- Atomic commits (one commit = one coherent change)
- Descriptive present-tense messages (\`add login form\`, not \`added login form\`)
- PRs with description: "what does this change, why"
- Peer review before merge

The goal wasn't git perfection. The goal was to **anchor the culture of public code**. Once they understood their code would be read, habits flipped.

## 6. Systematic pair programming

One hour per day of forced pair programming (driver/navigator). At start, painful. After 2 weeks, visible transformation:

- Learners verbalize their reasoning
- Errors caught in 30 seconds instead of 30 minutes
- Technical vocabulary aligns across the cohort
- The "asking isn't weakness" culture sets in

It's also where I saw the best developers emerge: not necessarily those who coded fastest, but those who asked the best questions.

## 7. Project-based evaluation

I removed theoretical QCMs. Instead: an end-of-module project, defended orally before the cohort.

Criteria:
1. Code runs and does what it claims (50%)
2. Code is readable by a dev who didn't write it (25%)
3. Code handles foreseeable errors (15%)
4. Code has a README and a deployment (10%)

No bonus for "pure performance" or "advanced techniques". Just deliverable and communication quality.

This grid killed rote learning and forced understanding. The best learners weren't those who memorized the most syntax, but those shipping the clearest code.

## 8. Technical debt seen by a beginner

Most surprising: beginners see technical debt better than we think. They just can't name it.

When a learner arrives saying "I don't understand my own code from yesterday", they wrote debt. When they say "it works but I don't know why", it's a signal to refactor before continuing.

I institutionalized the **"daily refactor"**: every morning, 30 minutes, each learner re-reads yesterday's code and improves it. This practice alone changed the cohort's average level in 6 weeks.

## 9. Tools that mattered

- **ESLint + Prettier**: automation of aesthetics to skip the debate
- **TypeScript strict**: so logic errors become compile errors
- **VS Code + GitHub Copilot**: only for boilerplate, NEVER for business logic (otherwise they don't learn)
- **Cypress / Playwright** for E2E tests on final projects
- **Vercel / Railway** for deployment (free, fast, motivating)

## 10. What changed in my own practice

Three things I changed in **my** code after this mission:

1. **I name better** — verbalizing in front of learners forced me to see my bad names
2. **I refactor earlier** — seeing debt pile up in accelerated form with beginners made me allergic to letting a file degrade
3. **I write fewer comments** — I prefer an explicit name to a descriptive comment

## 11. Pitfalls to avoid in training

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Theory without practice | Learners reciting without understanding | 70% practice minimum |
| Frameworks without foundations | Stuck when framework changes | Start with pure JS, add later |
| Theoretical evaluation | Rote memorization | Project-based evaluation |
| No Git early | Dangerous solo habits | Branches from day 3 |
| Copied tutorials without understanding | Stuck off the beaten path | Force solo debugging before help |
| No pair programming | Loneliness + accumulated debt | Daily forced sessions |

## 12. Closing

Teaching made me a better developer, more than any training I've taken. Verbalizing tacit choices, explaining why a name is bad, watching debt being created in real time — all of that changes how you write your own code.

If you get a chance to teach, take it. Not for the pay (often weak), not for the status (often ignored). For what it teaches you about your own craft.

Clean code isn't a code requirement. It's a future-reader requirement. And the future reader is you.`;

export const cleanCodeFormationRex: BlogPostSeed = {
  title:
    "Clean code et dette technique — REX neuf mois de formation fullstack",
  title_en:
    "Clean code and technical debt — nine months teaching fullstack",
  slug: "clean-code-formation-iafp-rex",
  excerpt:
    "Nommer précis, early returns, fonctions courtes, daily refactor, pair-programming et évaluation par projet : ce que neuf mois à former 18 apprenants m'ont appris sur mon propre code.",
  excerpt_en:
    "Precise naming, early returns, short functions, daily refactor, pair programming and project-based evaluation: what nine months training 18 learners taught me about my own code.",
  content,
  content_en: contentEn,
  category: "Retour d'experience",
  imageUrl:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80",
  readTime: "15 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: [
    "clean-code",
    "teaching",
    "mentoring",
    "software-craft",
    "refactoring",
  ],
};

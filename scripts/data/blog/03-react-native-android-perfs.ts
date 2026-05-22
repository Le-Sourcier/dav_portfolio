import type { BlogPostSeed } from "../types.js";

const content = `> Sur l'app Nexus, 68 % des utilisateurs ont un Android entrée de gamme à moins de 100 €, 2 Go de RAM et un CPU 4 cœurs lent. Voici le guide qui m'a permis de faire tenir 60 fps sur ces appareils.

## 1. Pourquoi ça compte

Quand on développe sur un iPhone Pro à 1 200 €, on ne voit jamais les vrais problèmes. Tout est fluide. Mais la majorité des utilisateurs francophones d'Afrique de l'Ouest, et une part substantielle des marchés émergents en général, tournent sur des appareils Android d'entrée de gamme : Tecno, Itel, Infinix, Xiaomi série A. Ces téléphones ont :

- 2 Go de RAM (parfois 3, rarement 4)
- CPU 4 cœurs ARM Cortex-A53 ou A55 — lents
- GPU Mali-G52 ou équivalent — limité
- Stockage eMMC lent (lecture < 100 Mo/s)
- Réseau 3G/4G avec latence 600+ ms et bande passante 500 kbps

Sur ces conditions, une app React Native par défaut rame. Pas un peu — beaucoup. Frame drops sur le scroll, transitions saccadées, démarrage à froid de 8 secondes. La perception : "cette app est cassée".

L'article : ce que j'ai changé sur l'app mobile Nexus pour passer de 18 fps à 58 fps stable sur un Tecno Spark Go.

## 2. Mesurer avant d'optimiser

Sans mesure, on optimise à l'aveugle. Trois outils ont compté :

**Flipper + Performance Monitor** : affiche les FPS UI et JS thread en overlay. C'est ma référence. Si je vois le JS thread descendre sous 30 fps, j'ai un problème de logique. Si c'est l'UI thread, c'est un problème de rendu.

**Android Studio Profiler** : pour le démarrage à froid et l'usage mémoire. Je profile la phase \`onCreate\` jusqu'au premier écran interactif.

**Reactotron** : pour tracer les re-renders. Si un composant re-render 12 fois pendant une transition, je le sais.

\`\`\`tsx
// hooks/useRenderCount.ts — utile en dev
import { useRef } from "react";

export function useRenderCount(name: string) {
  const count = useRef(0);
  count.current += 1;
  if (__DEV__) {
    console.log(\`[render] \${name} — \${count.current}\`);
  }
}
\`\`\`

## 3. Le démarrage à froid

C'est le premier coup d'œil de l'utilisateur. Sur un Tecno Spark Go, l'app par défaut prenait 7,8 secondes. Cible : sous 3 secondes. Voici ce qui a bougé l'aiguille :

### 3.1 Hermes activé

Hermes est le moteur JavaScript optimisé pour React Native sur Android. Il pré-compile le bytecode, réduit la taille du bundle et démarre 30 à 50 % plus vite. Sur Spark Go : -2,1 secondes.

\`\`\`json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
]
\`\`\`

### 3.2 Splash screen natif

Le splash JS classique attend que React monte. Sur entrée de gamme c'est lent. Le splash natif s'affiche dès le démarrage Android, avant React. Combiné à \`react-native-bootsplash\`, ça donne l'illusion d'un démarrage instantané.

### 3.3 Lazy load des écrans

Le router charge tous les écrans à l'init par défaut. Mauvais. Avec \`React.lazy\` ou un router qui supporte le lazy loading natif (React Navigation 6+ avec \`@react-navigation/native-stack\`) :

\`\`\`tsx
// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { lazy } from "react";

const HomeScreen = lazy(() => import("../screens/HomeScreen"));
const PortfolioScreen = lazy(() => import("../screens/PortfolioScreen"));
// ... 14 autres écrans tous lazy

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />
    </Stack.Navigator>
  );
}
\`\`\`

Le bundle initial passe de 4,2 Mo à 1,8 Mo. Démarrage : -1,2 secondes.

## 4. Les listes — où tout se joue

90 % des problèmes de fluidité viennent des listes. Sur Nexus, l'écran "Mes investissements" affiche jusqu'à 200 lignes. Voici les règles :

### 4.1 Toujours \`FlatList\` (ou \`FlashList\`), jamais \`ScrollView + map\`

\`ScrollView\` rend tous les enfants même hors écran. \`FlatList\` virtualise. \`FlashList\` de Shopify va encore plus loin en utilisant le recyclage de cellules natif :

\`\`\`tsx
// ❌ Mauvais — rend les 200 items en mémoire
<ScrollView>
  {investments.map((inv) => (
    <InvestmentCard key={inv.id} investment={inv} />
  ))}
</ScrollView>

// ✅ Bon — virtualise, pré-rend une dizaine
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={investments}
  estimatedItemSize={88}
  renderItem={({ item }) => <InvestmentCard investment={item} />}
  keyExtractor={(item) => item.id}
/>
\`\`\`

### 4.2 \`getItemLayout\` quand la hauteur est connue

Si chaque item a la même hauteur, le donner à \`FlatList\` évite le mesurage et accélère le scroll :

\`\`\`tsx
<FlatList
  data={investments}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  renderItem={...}
/>
\`\`\`

### 4.3 \`React.memo\` sur l'item

Sans \`memo\`, chaque scroll re-render tous les items visibles, même si leur prop n'a pas changé :

\`\`\`tsx
// src/components/InvestmentCard.tsx
export const InvestmentCard = React.memo(function InvestmentCard({ investment }: Props) {
  return (
    <View style={styles.card}>
      <Text>{investment.label}</Text>
      <Text>{investment.amount}</Text>
    </View>
  );
}, (prev, next) => prev.investment.id === next.investment.id && prev.investment.amount === next.investment.amount);
\`\`\`

Le comparateur custom évite la comparaison shallow par défaut qui re-render dès qu'une prop change de référence.

## 5. Les images — votre pire ennemi

Une image 4 Mo téléchargée et décodée bloque le JS thread plusieurs secondes. Sur Spark Go, c'est mortel. Trois règles :

### 5.1 Servir des tailles adaptées au device

Demander au backend l'image à la bonne taille selon \`PixelRatio.get()\`. Pas 1 920 × 1 080 sur un écran 720 p.

\`\`\`tsx
import { PixelRatio } from "react-native";

const width = 360;
const ratio = PixelRatio.get(); // 2 sur entrée de gamme typique
const imageUrl = \`\${cdn}/photo.jpg?w=\${width * ratio}&q=80\`;
\`\`\`

### 5.2 \`react-native-fast-image\`

Le composant \`Image\` de React Native a un cache faible et bloque le décodage. \`react-native-fast-image\` utilise SDWebImage (iOS) et Glide (Android) — décodage natif hors thread JS, cache disque et mémoire intelligent.

### 5.3 Format moderne

WebP réduit la taille de 30 à 40 % vs JPEG, et est nativement supporté sur Android 4.0+. AVIF encore plus mais le support est limité aux Android 12+. Faire servir AVIF quand le client l'accepte, fallback WebP.

## 6. Les animations — InteractionManager + Reanimated

Animer en JS sur entrée de gamme = drop frames garantis. La règle : **toute animation doit tourner sur l'UI thread**.

\`react-native-reanimated\` v3 permet d'écrire des "worklets" qui s'exécutent sur l'UI thread sans aller-retour vers le JS :

\`\`\`tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

function SwipeableRow() {
  const offset = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  // Triggered by gesture handler — pure UI thread
  const onSwipe = (delta: number) => {
    offset.value = withSpring(delta);
  };

  return <Animated.View style={style} />;
}
\`\`\`

Pour les transitions d'écran lourdes (animations + chargement de données), déférer les calculs non critiques avec \`InteractionManager.runAfterInteractions\`. Ça laisse le runtime terminer la transition avant de lancer le fetch.

## 7. Mode offline-first

Sur 3G avec 600 ms de latence, attendre une requête réseau pour afficher quelque chose est insupportable. La règle : **toujours afficher d'abord, recharger ensuite**.

\`\`\`tsx
// hooks/useInvestments.ts — pattern stale-while-revalidate
import { useQuery } from "@tanstack/react-query";

export function useInvestments(userId: string) {
  return useQuery({
    queryKey: ["investments", userId],
    queryFn: () => api.fetchInvestments(userId),
    staleTime: 0, // toujours en arrière-plan
    gcTime: 1000 * 60 * 60 * 24, // garde 24 h
    refetchOnMount: "always",
  });
}
\`\`\`

Couplé à un persister AsyncStorage de React Query, l'utilisateur ouvre l'app et voit ses dernières données immédiatement, même hors ligne. Le fetch suit en arrière-plan et met à jour.

## 8. Bundle size — chaque kilo compte

Sur connexion 3G, 1 Mo = 16 secondes de téléchargement. Le bundle doit être minimal :

1. **Audit avec \`source-map-explorer\`** — visualise qui pèse quoi. Souvent, une librairie de 800 ko ajoutée pour une fonction \`debounce\`.
2. **Tree-shaking strict** — imports nommés (\`import { debounce } from "lodash-es"\`) pas globaux.
3. **Polyfills minimaux** — \`core-js\` configuré pour la cible Android API 21+, pas Android 4.
4. **ProGuard activé** en release — shrink, obfuscation, suppression du code mort.

## 9. Le réseau — battle-tested patterns

| Pattern | Quand | Gain |
|---------|-------|------|
| Compression gzip côté serveur | Toujours | -60 % de payload |
| HTTP/2 multiplexé | Toujours | -300 ms par requête en cascade |
| Pré-fetch sur idle | Avant transition probable | Transition perçue instantanée |
| Connexion keep-alive | Toujours | -100 ms par requête supplémentaire |
| Backoff exponentiel | Sur retry | Évite la surcharge en cas de panne réseau |

## 10. Bilan sur Spark Go

Après application de tous ces patterns sur Nexus Mobile :

| Métrique | Avant | Après |
|----------|-------|-------|
| Démarrage à froid | 7,8 s | 2,4 s |
| FPS scroll liste 200 items | 18 | 58 |
| Mémoire au repos | 280 Mo | 145 Mo |
| Bundle initial | 4,2 Mo | 1,8 Mo |
| Time-to-interactive | 9,1 s | 3,2 s |

Le travail le plus rentable a été le passage à FlashList + memo (+30 fps d'un coup) et l'activation de Hermes + lazy loading (-3,2 s au démarrage). Le reste est de la rigueur quotidienne.

## 11. Conclusion

React Native sur Android entrée de gamme n'est pas un problème de framework, c'est un problème de discipline. Hermes, listes virtualisées, animations sur UI thread, images natives, bundle audit, offline-first. Aucun de ces patterns n'est révolutionnaire, mais leur application systématique fait la différence entre une app qui fonctionne et une app qu'on garde sur son téléphone.

La métrique à surveiller : **time-to-interactive sur un appareil cible défini**. Si c'est sous 3 secondes sur le bas du marché, votre app est utilisable partout.`;

const contentEn = `> On the Nexus mobile app, 68% of users have an entry-level Android device under €100 with 2 GB of RAM and a slow 4-core CPU. Here's the playbook that took me to a stable 60 fps on those devices.

## 1. Why it matters

When you develop on a €1,200 iPhone Pro, you never see the real problems. Everything is smooth. But the majority of French-speaking West African users — and a substantial slice of emerging markets in general — run on entry-level Android devices: Tecno, Itel, Infinix, Xiaomi A-series. These phones have:

- 2 GB of RAM (sometimes 3, rarely 4)
- 4-core ARM Cortex-A53 or A55 CPU — slow
- Mali-G52 GPU or equivalent — limited
- Slow eMMC storage (read < 100 MB/s)
- 3G/4G with 600+ ms latency and 500 kbps bandwidth

In these conditions, a default React Native app stutters. Not a little — a lot. Scroll frame drops, choppy transitions, 8-second cold starts. The perception: "this app is broken."

This article: what I changed on the Nexus mobile app to go from 18 fps to a stable 58 fps on a Tecno Spark Go.

## 2. Measure before optimizing

Without measurement, you optimize blind. Three tools mattered:

**Flipper + Performance Monitor**: shows UI and JS thread FPS as overlay. It's my reference. If I see the JS thread drop below 30 fps, I have a logic problem. If it's the UI thread, it's a rendering problem.

**Android Studio Profiler**: for cold start and memory usage. I profile from \`onCreate\` to the first interactive screen.

**Reactotron**: to trace re-renders. If a component re-renders 12 times during a transition, I know.

\`\`\`tsx
// hooks/useRenderCount.ts — handy in dev
import { useRef } from "react";

export function useRenderCount(name: string) {
  const count = useRef(0);
  count.current += 1;
  if (__DEV__) {
    console.log(\`[render] \${name} — \${count.current}\`);
  }
}
\`\`\`

## 3. Cold start

That's the user's first glance. On Spark Go, the default app took 7.8 seconds. Target: under 3 seconds. What moved the needle:

### 3.1 Hermes enabled

Hermes is the JavaScript engine optimized for React Native on Android. It pre-compiles bytecode, shrinks the bundle and starts 30–50% faster. On Spark Go: -2.1 seconds.

\`\`\`json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
]
\`\`\`

### 3.2 Native splash screen

The classic JS splash waits for React to mount. Slow on entry-level. The native splash shows from Android boot, before React. Combined with \`react-native-bootsplash\`, it creates the illusion of instant startup.

### 3.3 Lazy load screens

The router loads all screens at init by default. Bad. With \`React.lazy\` or a router that supports native lazy loading (React Navigation 6+ with \`@react-navigation/native-stack\`):

\`\`\`tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { lazy } from "react";

const HomeScreen = lazy(() => import("../screens/HomeScreen"));
const PortfolioScreen = lazy(() => import("../screens/PortfolioScreen"));

const Stack = createNativeStackNavigator();
\`\`\`

Initial bundle drops from 4.2 MB to 1.8 MB. Startup: -1.2 seconds.

## 4. Lists — where it all plays out

90% of fluidity problems come from lists. On Nexus, "My investments" displays up to 200 rows. Rules:

### 4.1 Always \`FlatList\` (or \`FlashList\`), never \`ScrollView + map\`

\`ScrollView\` renders all children even off-screen. \`FlatList\` virtualizes. Shopify's \`FlashList\` goes further by using native cell recycling:

\`\`\`tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={investments}
  estimatedItemSize={88}
  renderItem={({ item }) => <InvestmentCard investment={item} />}
  keyExtractor={(item) => item.id}
/>
\`\`\`

### 4.2 \`getItemLayout\` when height is known

If each item has the same height, giving it to \`FlatList\` avoids measurement and speeds up scrolling.

### 4.3 \`React.memo\` on items

Without \`memo\`, every scroll re-renders all visible items, even if props haven't changed:

\`\`\`tsx
export const InvestmentCard = React.memo(function InvestmentCard({ investment }: Props) {
  return (
    <View style={styles.card}>
      <Text>{investment.label}</Text>
      <Text>{investment.amount}</Text>
    </View>
  );
}, (prev, next) =>
  prev.investment.id === next.investment.id &&
  prev.investment.amount === next.investment.amount
);
\`\`\`

The custom comparator skips the default shallow check that re-renders as soon as a prop changes reference.

## 5. Images — your worst enemy

A 4 MB image downloaded and decoded blocks the JS thread for seconds. On Spark Go, deadly. Three rules:

### 5.1 Serve sizes adapted to device

Ask the backend for the right size based on \`PixelRatio.get()\`. Not 1920×1080 on a 720p screen.

\`\`\`tsx
import { PixelRatio } from "react-native";

const width = 360;
const ratio = PixelRatio.get();
const imageUrl = \`\${cdn}/photo.jpg?w=\${width * ratio}&q=80\`;
\`\`\`

### 5.2 \`react-native-fast-image\`

The default \`Image\` component has weak cache and blocks decoding. \`react-native-fast-image\` uses SDWebImage (iOS) and Glide (Android) — native off-thread decoding, smart disk and memory cache.

### 5.3 Modern format

WebP shrinks file size by 30–40% vs JPEG and is natively supported on Android 4.0+. AVIF even more, but limited to Android 12+. Serve AVIF when the client accepts it, fallback WebP.

## 6. Animations — InteractionManager + Reanimated

Animating in JS on entry-level = guaranteed frame drops. The rule: **every animation must run on the UI thread**.

\`react-native-reanimated\` v3 lets you write "worklets" that execute on the UI thread with no round-trip to JS:

\`\`\`tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

function SwipeableRow() {
  const offset = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const onSwipe = (delta: number) => {
    offset.value = withSpring(delta);
  };

  return <Animated.View style={style} />;
}
\`\`\`

For heavy screen transitions (animation + data load), defer non-critical work with \`InteractionManager.runAfterInteractions\`. It lets the runtime finish the transition before fetching.

## 7. Offline-first

On 3G with 600 ms latency, waiting for a network request before showing anything is unbearable. Rule: **always show first, refresh later**.

\`\`\`tsx
import { useQuery } from "@tanstack/react-query";

export function useInvestments(userId: string) {
  return useQuery({
    queryKey: ["investments", userId],
    queryFn: () => api.fetchInvestments(userId),
    staleTime: 0,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: "always",
  });
}
\`\`\`

Combined with an AsyncStorage persister for React Query, the user opens the app and sees their last data immediately, even offline. Fetch follows in background and updates.

## 8. Bundle size — every kilo counts

On 3G, 1 MB = 16 seconds of download. The bundle must be minimal:

1. **Audit with \`source-map-explorer\`** — visualizes who weighs what. Often an 800 KB library added for a single \`debounce\` function.
2. **Strict tree-shaking** — named imports (\`import { debounce } from "lodash-es"\`) not whole libs.
3. **Minimal polyfills** — \`core-js\` configured for Android API 21+, not Android 4.
4. **ProGuard enabled** in release — shrink, obfuscate, dead-code removal.

## 9. Network — battle-tested patterns

| Pattern | When | Gain |
|---------|------|------|
| Server-side gzip compression | Always | -60% payload |
| Multiplexed HTTP/2 | Always | -300 ms per cascading request |
| Idle pre-fetch | Before likely transition | Perceived-instant transition |
| Keep-alive connection | Always | -100 ms per additional request |
| Exponential backoff | On retry | Avoids overload on network failure |

## 10. Spark Go verdict

After applying all patterns on Nexus Mobile:

| Metric | Before | After |
|--------|--------|-------|
| Cold start | 7.8 s | 2.4 s |
| 200-item scroll FPS | 18 | 58 |
| Idle memory | 280 MB | 145 MB |
| Initial bundle | 4.2 MB | 1.8 MB |
| Time-to-interactive | 9.1 s | 3.2 s |

The highest-leverage moves were switching to FlashList + memo (+30 fps instantly) and enabling Hermes + lazy loading (-3.2 s startup). The rest is daily rigor.

## 11. Closing

React Native on entry-level Android isn't a framework problem, it's a discipline problem. Hermes, virtualized lists, UI-thread animations, native images, bundle audit, offline-first. None of these patterns is revolutionary, but their systematic application separates an app that works from an app users keep on their phone.

The metric to watch: **time-to-interactive on a defined target device**. If it's under 3 seconds on the low end of the market, your app is usable anywhere.`;

export const reactNativeAndroidPerfs: BlogPostSeed = {
  title:
    "60 fps sur Android entrée de gamme — guide perfs React Native pour les marchés émergents",
  title_en:
    "60 fps on entry-level Android — React Native performance playbook for emerging markets",
  slug: "react-native-android-entree-de-gamme-perfs",
  excerpt:
    "Hermes, FlashList, react-native-fast-image, Reanimated UI-thread, offline-first React Query : le guide complet pour tenir 60 fps stable sur un Tecno Spark Go à 2 Go de RAM.",
  excerpt_en:
    "Hermes, FlashList, react-native-fast-image, UI-thread Reanimated, offline-first React Query: the complete guide to a stable 60 fps on a 2 GB Tecno Spark Go.",
  content,
  content_en: contentEn,
  category: "Tutoriel",
  imageUrl:
    "https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&w=1600&q=80",
  readTime: "17 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: [
    "react-native",
    "android",
    "performance",
    "mobile",
    "emerging-markets",
  ],
};

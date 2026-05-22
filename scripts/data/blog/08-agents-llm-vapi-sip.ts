import type { BlogPostSeed } from "../types.js";

const content = `> Brancher un agent LLM sur une ligne téléphonique via Vapi + SIP (IllyVoIP, Vonage), c'est techniquement séduisant. En production, c'est un terrain miné. Retour d'expérience.

## 1. Le contexte

Sur une mission d'agence, le client voulait automatiser ses appels sortants de qualification (B2B, prise de rendez-vous, relance). Cahier des charges : agent vocal naturel, intégration au CRM, opérateurs humains qui prennent le relais sur demande, conformité légale (consentement, opt-out).

Le stack final : Vapi pour l'orchestration vocale + SIP (IllyVoIP en backup, Vonage en principal) pour la connectivité PSTN, OpenAI GPT-4 pour la logique conversationnelle, N8N pour le pipeline CRM, PostgreSQL pour les logs.

L'objectif de cet article : partager ce qui a marché, ce qui a explosé en vol, et comment je relancerais aujourd'hui.

## 2. Pourquoi c'est tentant et piégeur

L'agent vocal LLM coche toutes les cases du buzz : automatisation, IA générative, scale, ROI marketing. Mais sous le capot, c'est l'intégration de cinq systèmes asynchrones qui dialoguent en temps réel :

- Le LLM (OpenAI/Anthropic) : latence 800-2000 ms, parfois plus
- Le TTS (Vapi/ElevenLabs) : latence 200-500 ms par phrase
- Le STT (Deepgram/Whisper) : latence 100-300 ms streaming
- Le SIP (IllyVoIP/Vonage) : latence 50-150 ms par paquet RTP
- Le CRM (HubSpot/Pipedrive) : latence 200-1000 ms

À 3 secondes de latence cumulée, l'agent paraît "lent et perdu". À 1.2 seconde, "robot mais OK". Sous 800 ms, "presque humain". L'optimisation de latence est le projet, pas un détail.

## 3. Architecture cible

\`\`\`
[Utilisateur]  ←  PSTN/SIP  →  [IllyVoIP / Vonage]
                                     │
                                     ▼
                                  [Vapi]
                                 ╱   │   ╲
                          [Deepgram] │   [ElevenLabs]
                            STT      │      TTS
                                     ▼
                                 [Agent API]
                                  Node.js
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                      [OpenAI]   [Postgres]   [N8N]
                      reasoning   logs        CRM
\`\`\`

Vapi orchestre la boucle audio (STT → agent → TTS) avec un streaming bidirectionnel. L'Agent API (mon code) reçoit le texte transcrit, appelle OpenAI, retourne la réponse à parler. Postgres trace tout. N8N intègre avec le CRM.

## 4. Pattern 1 — Streaming partout

La règle absolue : **jamais attendre la fin d'une étape pour commencer la suivante**.

\`\`\`typescript
// src/agent/handleTurn.ts
export async function handleTurn(userText: string, context: TurnContext) {
  // 1. Stream OpenAI dès que disponible
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [...context.history, { role: "user", content: userText }],
    stream: true,
    temperature: 0.4,
  });

  let buffer = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    buffer += delta;

    // 2. Émettre par phrase (split sur la ponctuation forte)
    const sentenceEnd = buffer.search(/[.!?]\\s/);
    if (sentenceEnd > 0) {
      const sentence = buffer.slice(0, sentenceEnd + 1);
      buffer = buffer.slice(sentenceEnd + 2);

      // 3. Pousser à TTS sans attendre la fin du stream LLM
      await vapi.speak(sentence);
    }
  }

  // 4. Flush le reste
  if (buffer.trim()) await vapi.speak(buffer);
}
\`\`\`

Bénéfice mesuré : latence perçue divisée par 3. Au lieu d'attendre 2 secondes de génération puis 1 seconde de TTS, l'utilisateur entend la première phrase au bout de 700 ms.

## 5. Pattern 2 — Le system prompt comme une checklist

Un agent vocal n'est pas un chatbot textuel. Trois exigences spécifiques :

1. **Phrases courtes** — pas de listes à puces (impossible à dire), pas de paragraphes longs
2. **Une question par tour** — sinon l'utilisateur en oublie
3. **Confirmation explicite** — l'utilisateur ne voit pas le texte, il faut répéter les infos critiques

\`\`\`
Tu es Sarah, assistante commerciale chez Acme Corp.

Règles obligatoires :
- Phrases courtes (max 15 mots)
- Une question par tour, jamais plus
- Confirme à voix haute les noms, emails, dates et numéros
- Si tu n'as pas compris, dis "je n'ai pas bien entendu, pouvez-vous répéter ?"
- N'invente jamais une information

Objectif de l'appel :
- Qualifier le prospect (budget, besoin, échéance)
- Proposer un rendez-vous dans la semaine prochaine
- Récupérer email et meilleur créneau

Si le prospect refuse : remercie poliment et propose un opt-out définitif.
\`\`\`

L'ordre des règles compte. Les modèles GPT-4 et Claude appliquent mieux les contraintes formulées en premier.

## 6. Pattern 3 — Détection de barge-in

L'utilisateur va interrompre l'agent. C'est normal et c'est sain. L'agent doit s'arrêter immédiatement, pas continuer à parler pendant 3 secondes par-dessus l'utilisateur.

Vapi expose un événement \`barge-in\` quand le STT détecte que l'utilisateur commence à parler. Côté agent :

\`\`\`typescript
vapi.on("barge-in", () => {
  // 1. Couper le TTS immédiatement
  vapi.stopSpeaking();

  // 2. Marquer le tour LLM en cours comme abandonné
  currentTurn?.abort();

  // 3. Reprendre l'écoute
  vapi.resumeListening();
});
\`\`\`

Sans ça, l'agent paraît "sourd" et l'expérience devient frustrante. C'est le détail qui fait passer "robot bizarre" à "agent acceptable".

## 7. Pattern 4 — Function calling pour les actions réelles

L'agent ne doit JAMAIS s'inventer un numéro de téléphone, un email ou une disponibilité. Tout ce qui touche au monde réel passe par function calling structuré.

\`\`\`typescript
const tools = [
  {
    type: "function",
    function: {
      name: "checkAvailability",
      description: "Vérifie les créneaux disponibles dans le calendrier",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          durationMin: { type: "number" },
        },
        required: ["startDate", "endDate", "durationMin"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bookAppointment",
      description: "Réserve un rendez-vous (à n'appeler qu'après confirmation utilisateur)",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string" },
          slotIso: { type: "string", format: "date-time" },
        },
        required: ["email", "name", "slotIso"],
      },
    },
  },
];
\`\`\`

Quand GPT-4 décide d'appeler \`checkAvailability\`, mon code consulte vraiment le Google Calendar du commercial, retourne les créneaux, et GPT-4 formule la réponse. Pas de hallucination possible.

Important : \`bookAppointment\` n'est appelable qu'après confirmation explicite ("Je confirme votre RDV mardi 14h, c'est bien ça ?" → "oui"). Le system prompt impose cette discipline.

## 8. Pattern 5 — Conformité dès le bonjour

Trois exigences légales en France/UE pour l'appel sortant automatisé :

1. **Information** : "Cet appel peut être enregistré et traité par un système automatisé"
2. **Consentement Bloctel/RGPD** : vérifier que le numéro n'est pas sur liste rouge avant d'appeler
3. **Opt-out explicite** : à la demande "ne m'appelez plus", l'opt-out est instantané et journalisé

\`\`\`typescript
// src/agent/optOut.ts
const OPT_OUT_PHRASES = [
  "ne m'appelez plus",
  "ne plus me contacter",
  "supprimez-moi",
  "rgpd",
  "opt out",
];

export function detectOptOut(userText: string): boolean {
  const normalized = userText.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
  return OPT_OUT_PHRASES.some((phrase) => normalized.includes(phrase));
}

// dans la boucle conversationnelle
if (detectOptOut(userText)) {
  await vapi.speak("Très bien, je note votre demande. Vous ne recevrez plus d'appels de notre part. Bonne journée.");
  await OptOut.create({ phone: context.phone, reason: "user_request", at: new Date() });
  await vapi.endCall();
  return;
}
\`\`\`

L'opt-out est non négociable. Pas de "êtes-vous sûr ?", pas de "puis-je vous proposer autre chose ?". On ferme, on log, on respecte.

## 9. Pattern 6 — Handover humain

Aucun agent LLM ne remplace un humain pour les cas sensibles. Détecter quand transférer :

- Demande explicite ("je veux parler à un humain")
- Conversation qui patine (3 incompréhensions de suite)
- Sujet hors périmètre (réclamation, litige, urgence)
- Émotion négative détectée (sentiment analysis sur le texte transcrit)

\`\`\`typescript
async function transferToHuman(reason: string, context: TurnContext) {
  await vapi.speak("Je vais vous mettre en contact avec un conseiller, ne quittez pas.");
  await Transfer.create({ callId: context.callId, reason, at: new Date() });
  await vapi.transferCall({ destination: HUMAN_QUEUE_NUMBER });
}
\`\`\`

L'agent doit savoir "je ne sais pas faire ça" sans honte, et passer la main rapidement.

## 10. Mesures et qualité

Tracer chaque appel sur trois plans :

| Métrique | Définition | Seuil acceptable |
|----------|------------|------------------|
| Latence p95 par tour | Temps user-parle-fini → agent-commence-à-parler | < 1200 ms |
| Taux de barge-in | % d'appels avec ≥1 interruption | Stable autour de 20-30 % |
| Taux d'opt-out | % d'appels finissant par opt-out | < 5 % |
| Taux de handover | % d'appels transférés à un humain | < 15 % |
| Taux de complétion | % d'appels atteignant l'objectif (RDV pris, qualif faite) | > 30 % |

Si la latence dérive, l'expérience explose en deux jours. Surveiller en continu.

## 11. Pièges à éviter

| Piège | Symptôme | Correction |
|-------|----------|------------|
| TTS sans streaming | Latence perçue insupportable | Streaming phrase par phrase |
| Pas de barge-in | Agent parle par-dessus | Listener \`barge-in\` + \`stopSpeaking\` |
| Hallucination sur dates/emails | Mauvais RDV pris, email faux | Function calling pour tout fait réel |
| Opt-out flou | Risque légal | Détection lexicale + journal + fin d'appel |
| Pas de handover | Frustration garantie | Détection multi-signaux + transfert |
| System prompt trop long | Modèle hallucine plus | Maximum 800 tokens, règles ordonnées |
| Pas de Bloctel | Risque légal | Vérification systématique avant chaque appel |

## 12. Économie

Coût mesuré par appel (qualif B2B, durée moyenne 3 min) :

- Vapi (orchestration) : ~0,15 €
- IllyVoIP/Vonage (SIP) : ~0,02 €
- OpenAI GPT-4o : ~0,05 €
- ElevenLabs TTS : ~0,10 €
- Deepgram STT : ~0,02 €
- **Total : ~0,34 € par appel**

Vs un commercial humain : ~3 à 5 € par appel (salaire chargé + frais). L'économie est réelle, mais elle suppose un volume d'appels conséquent — sous 200 appels/jour, l'humain reste meilleur en qualité de relation.

## 13. Conclusion

L'agent vocal LLM n'est pas un gadget. C'est un outil professionnel quand on respecte trois principes : streaming partout, function calling pour la vérité, conformité légale par défaut. Sans ces trois, c'est un démo qui ne tient pas en production.

L'agent n'est pas non plus un remplaçant universel du commercial humain. Il excelle sur la qualification massive et standardisée. Il échoue sur la nuance, la négociation et l'émotion. Hybride humain + agent reste le meilleur calcul économique.

Si vous démarrez : Vapi + GPT-4o + Deepgram + ElevenLabs est la stack qui a le mieux marché pour moi en 2026. Mais comptez 6 à 10 semaines pour livrer un agent réellement utilisable en production, pas le sprint week-end vendu sur LinkedIn.`;

const contentEn = `> Wiring an LLM agent to a phone line via Vapi + SIP (IllyVoIP, Vonage) is technically appealing. In production, it's a minefield. Field notes.

## 1. The context

On an agency mission, the client wanted to automate outbound qualification calls (B2B, appointment booking, follow-up). Specs: natural-feeling voice agent, CRM integration, human operators taking over on demand, legal compliance (consent, opt-out).

Final stack: Vapi for voice orchestration + SIP (IllyVoIP backup, Vonage primary) for PSTN connectivity, OpenAI GPT-4 for conversational logic, N8N for the CRM pipeline, PostgreSQL for logs.

The goal of this article: share what worked, what blew up in flight, and how I'd restart today.

## 2. Why it's tempting and tricky

The LLM voice agent ticks every hype box: automation, generative AI, scale, marketing ROI. But under the hood, it's the integration of five asynchronous systems talking in real time:

- LLM (OpenAI/Anthropic): 800-2000 ms latency, sometimes more
- TTS (Vapi/ElevenLabs): 200-500 ms latency per sentence
- STT (Deepgram/Whisper): 100-300 ms streaming latency
- SIP (IllyVoIP/Vonage): 50-150 ms per RTP packet
- CRM (HubSpot/Pipedrive): 200-1000 ms

At 3 seconds cumulative latency, the agent feels "slow and lost". At 1.2 seconds, "robot but OK". Under 800 ms, "almost human". Latency optimization is the project, not a detail.

## 3. Target architecture

\`\`\`
[User]  ←  PSTN/SIP  →  [IllyVoIP / Vonage]
                                │
                                ▼
                              [Vapi]
                             ╱   │   ╲
                      [Deepgram] │   [ElevenLabs]
                        STT      │      TTS
                                 ▼
                             [Agent API]
                              Node.js
                                 │
                      ┌──────────┼──────────┐
                      ▼          ▼          ▼
                  [OpenAI]   [Postgres]   [N8N]
                  reasoning   logs        CRM
\`\`\`

Vapi orchestrates the audio loop (STT → agent → TTS) with bidirectional streaming. Agent API (my code) receives transcribed text, calls OpenAI, returns the response to speak. Postgres traces everything. N8N integrates with the CRM.

## 4. Pattern 1 — Stream everywhere

Absolute rule: **never wait for a step to finish before starting the next**.

\`\`\`typescript
// src/agent/handleTurn.ts
export async function handleTurn(userText: string, context: TurnContext) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [...context.history, { role: "user", content: userText }],
    stream: true,
    temperature: 0.4,
  });

  let buffer = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    buffer += delta;

    const sentenceEnd = buffer.search(/[.!?]\\s/);
    if (sentenceEnd > 0) {
      const sentence = buffer.slice(0, sentenceEnd + 1);
      buffer = buffer.slice(sentenceEnd + 2);
      await vapi.speak(sentence);
    }
  }

  if (buffer.trim()) await vapi.speak(buffer);
}
\`\`\`

Measured benefit: perceived latency divided by 3. Instead of waiting 2 seconds of generation then 1 second of TTS, the user hears the first sentence after 700 ms.

## 5. Pattern 2 — The system prompt as a checklist

A voice agent isn't a text chatbot. Three specific requirements:

1. **Short sentences** — no bulleted lists (impossible to say), no long paragraphs
2. **One question per turn** — otherwise the user forgets
3. **Explicit confirmation** — the user doesn't see text, you must echo critical info

\`\`\`
You are Sarah, a sales assistant at Acme Corp.

Mandatory rules:
- Short sentences (max 15 words)
- One question per turn, never more
- Echo aloud names, emails, dates and numbers for confirmation
- If you didn't catch something, say "I didn't catch that, could you repeat?"
- Never invent information

Call objective:
- Qualify the prospect (budget, need, deadline)
- Propose an appointment within next week
- Capture email and best slot

If the prospect refuses: thank politely and offer a definitive opt-out.
\`\`\`

Rule order matters. GPT-4 and Claude apply constraints stated first more reliably.

## 6. Pattern 3 — Barge-in detection

The user will interrupt the agent. Normal and healthy. The agent must stop immediately, not keep talking 3 seconds over the user.

Vapi exposes a \`barge-in\` event when STT detects the user starts speaking. Agent side:

\`\`\`typescript
vapi.on("barge-in", () => {
  vapi.stopSpeaking();
  currentTurn?.abort();
  vapi.resumeListening();
});
\`\`\`

Without this, the agent feels "deaf" and the experience becomes frustrating. It's the detail that moves "weird robot" to "acceptable agent".

## 7. Pattern 4 — Function calling for real-world actions

The agent must NEVER invent a phone number, an email, an availability. Anything touching reality goes through structured function calling.

\`\`\`typescript
const tools = [
  {
    type: "function",
    function: {
      name: "checkAvailability",
      description: "Check available slots in the calendar",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          durationMin: { type: "number" },
        },
        required: ["startDate", "endDate", "durationMin"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bookAppointment",
      description: "Book an appointment (call only after user confirmation)",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string" },
          slotIso: { type: "string", format: "date-time" },
        },
        required: ["email", "name", "slotIso"],
      },
    },
  },
];
\`\`\`

When GPT-4 decides to call \`checkAvailability\`, my code actually queries the sales rep's Google Calendar, returns slots, GPT-4 phrases the answer. No hallucination possible.

Important: \`bookAppointment\` callable only after explicit confirmation ("I confirm your appointment Tuesday 2 PM, correct?" → "yes"). The system prompt enforces this discipline.

## 8. Pattern 5 — Compliance from "hello"

Three legal requirements in France/EU for automated outbound calls:

1. **Information**: "This call may be recorded and processed by an automated system"
2. **Bloctel/GDPR consent**: verify the number isn't on do-not-call list before calling
3. **Explicit opt-out**: on "don't call me again", opt-out is instant and logged

\`\`\`typescript
const OPT_OUT_PHRASES = [
  "don't call me again",
  "stop contacting me",
  "remove me",
  "gdpr",
  "opt out",
];

export function detectOptOut(userText: string): boolean {
  const normalized = userText.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
  return OPT_OUT_PHRASES.some((phrase) => normalized.includes(phrase));
}

if (detectOptOut(userText)) {
  await vapi.speak("Understood, I'm noting your request. You won't receive calls from us anymore. Have a good day.");
  await OptOut.create({ phone: context.phone, reason: "user_request", at: new Date() });
  await vapi.endCall();
  return;
}
\`\`\`

Opt-out is non-negotiable. No "are you sure?", no "can I offer something else?". Close, log, respect.

## 9. Pattern 6 — Human handover

No LLM agent replaces a human for sensitive cases. Detect when to transfer:

- Explicit request ("I want to speak to a human")
- Stalling conversation (3 misunderstandings in a row)
- Out-of-scope topic (complaint, dispute, emergency)
- Detected negative emotion (sentiment analysis on transcribed text)

\`\`\`typescript
async function transferToHuman(reason: string, context: TurnContext) {
  await vapi.speak("I'll connect you with a counselor, please hold.");
  await Transfer.create({ callId: context.callId, reason, at: new Date() });
  await vapi.transferCall({ destination: HUMAN_QUEUE_NUMBER });
}
\`\`\`

The agent must know "I can't do this" without shame, and hand off fast.

## 10. Metrics and quality

Trace each call on three axes:

| Metric | Definition | Acceptable threshold |
|--------|------------|----------------------|
| p95 latency per turn | User-stops-speaking → agent-starts | < 1200 ms |
| Barge-in rate | % calls with ≥1 interrupt | Stable around 20-30% |
| Opt-out rate | % calls ending in opt-out | < 5% |
| Handover rate | % calls transferred to human | < 15% |
| Completion rate | % calls reaching objective | > 30% |

If latency drifts, experience explodes in two days. Monitor continuously.

## 11. Pitfalls to avoid

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| TTS without streaming | Unbearable perceived latency | Sentence-by-sentence streaming |
| No barge-in | Agent talks over user | \`barge-in\` listener + \`stopSpeaking\` |
| Date/email hallucination | Wrong appointment booked, fake email | Function calling for all real facts |
| Fuzzy opt-out | Legal risk | Lexical detection + log + end call |
| No handover | Guaranteed frustration | Multi-signal detection + transfer |
| Over-long system prompt | Model hallucinates more | Max 800 tokens, ordered rules |
| No do-not-call check | Legal risk | Systematic check before each call |

## 12. Economics

Measured cost per call (B2B qualification, 3 min average):

- Vapi (orchestration): ~€0.15
- IllyVoIP/Vonage (SIP): ~€0.02
- OpenAI GPT-4o: ~€0.05
- ElevenLabs TTS: ~€0.10
- Deepgram STT: ~€0.02
- **Total: ~€0.34 per call**

Vs a human sales rep: ~€3 to €5 per call (loaded salary + overhead). Real savings, but assume substantial call volume — under 200 calls/day, human stays better on relationship quality.

## 13. Closing

The LLM voice agent isn't a gadget. It's a professional tool when you respect three principles: stream everywhere, function calling for truth, legal compliance by default. Without these three, it's a demo that doesn't hold in production.

Nor is the agent a universal replacement for human sales. It excels at massive standardized qualification. It fails on nuance, negotiation and emotion. Hybrid human + agent stays the best economic calculation.

If starting: Vapi + GPT-4o + Deepgram + ElevenLabs is the stack that worked best for me in 2026. But count 6 to 10 weeks to ship a truly production-ready agent, not the weekend sprint sold on LinkedIn.`;

export const agentsLlmVapiSip: BlogPostSeed = {
  title:
    "Agents LLM autonomes au téléphone — REX Vapi + SIP + GPT-4 en production",
  title_en:
    "Autonomous LLM agents on the phone — Vapi + SIP + GPT-4 field notes",
  slug: "agents-llm-vapi-sip-production",
  excerpt:
    "Streaming partout, function calling pour la vérité, barge-in, opt-out conforme, handover humain : les six patterns qui transforment un agent vocal LLM en outil de production.",
  excerpt_en:
    "Stream everywhere, function calling for truth, barge-in, compliant opt-out, human handover: the six patterns that turn an LLM voice agent into a production tool.",
  content,
  content_en: contentEn,
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80",
  readTime: "17 min de lecture",
  author: "Yao David Logan",
  published: true,
  tags: ["llm", "agents", "vapi", "voice-ai", "openai", "sip"],
};

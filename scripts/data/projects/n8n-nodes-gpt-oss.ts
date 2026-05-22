import type { ProjectSeed } from "../types.js";

export const n8nNodesGptOss: ProjectSeed = {
  slug: "n8n-nodes-gpt-oss",
  title: "n8n-nodes-gpt-oss",
  title_en: "n8n-nodes-gpt-oss",
  name: "n8n-nodes-gpt-oss",
  category: "Backend",
  image:
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  headline:
    "Nœud N8N pour modèles GPT open-source self-hosted — orchestration locale d'agents LLM.",
  description: `Package NPM qui apporte à N8N un nœud dédié aux modèles GPT open-source self-hosted (LM Studio, Ollama, vLLM, Text Generation Inference). Objectif : orchestrer des agents LLM dans des workflows N8N sans dépendre d'une API cloud, en gardant la donnée 100% on-prem.

Le nœud expose les opérations chat, complétion et embeddings, avec une couche d'abstraction qui supporte plusieurs serveurs d'inférence via une seule configuration.`,
  description_en: `NPM package that brings N8N a dedicated node for self-hosted open-source GPT models (LM Studio, Ollama, vLLM, Text Generation Inference). Goal: orchestrate LLM agents in N8N workflows without depending on a cloud API, keeping data 100% on-prem.

The node exposes chat, completion and embeddings operations, with an abstraction layer that supports several inference servers through a single configuration.`,
  problem: `L'orchestration d'agents LLM dans N8N était jusqu'ici monopolisée par OpenAI. Les organisations avec contraintes RGPD ou souveraineté des données n'avaient pas d'option pour utiliser des modèles open-source self-hosted dans leurs workflows existants.`,
  problem_en: `LLM agent orchestration in N8N was so far monopolized by OpenAI. Organizations with GDPR or data sovereignty constraints had no option to use self-hosted open-source models in their existing workflows.`,
  solution: `Nœud N8N abstrait par-dessus 4 serveurs d'inférence (LM Studio, Ollama, vLLM, TGI) — configuration par URL + modèle, opérations chat/completion/embeddings. Streaming supporté pour les réponses longues.

Conçu pour glisser dans des workflows existants sans changer la structure du graphe : entrée prompt, sortie texte ou embedding, gestion d'erreurs N8N standard.`,
  solution_en: `N8N node that abstracts over 4 inference servers (LM Studio, Ollama, vLLM, TGI) — configuration by URL + model, chat/completion/embeddings operations. Streaming supported for long responses.

Built to drop into existing workflows without changing graph structure: prompt input, text or embedding output, standard N8N error handling.`,
  result:
    "Orchestration N8N x modèles open-source self-hosted en version 0.1.0, prête pour les usages on-prem.",
  metric: "4 backends d'inférence supportés en version 0.1.0",
  role: "Auteur & mainteneur open-source",
  tech: ["TypeScript", "N8N", "Ollama", "vLLM", "LM Studio", "Node.js"],
  links: [
    {
      label: "Page NPM",
      href: "https://www.npmjs.com/package/n8n-nodes-gpt-oss",
    },
  ],
  featured: false,
  results: [
    "Abstraction unifiée sur LM Studio, Ollama, vLLM et Text Generation Inference",
    "Opérations chat, completion et embeddings",
    "Streaming supporté pour les réponses longues",
    "Gestion d'erreurs alignée sur les patterns N8N",
  ],
  metrics: [
    { name: "Backends supportés", value: 4, previousValue: 0, unit: "" },
    { name: "Opérations exposées", value: 6, previousValue: 0, unit: "" },
    { name: "Version publiée", value: 0.1, previousValue: 0, unit: "" },
  ],
  chartData: [
    { name: "PoC", value: 1 },
    { name: "Alpha", value: 2 },
    { name: "Beta", value: 3 },
    { name: "v0.1", value: 4 },
  ],
  url: "https://www.npmjs.com/package/n8n-nodes-gpt-oss",
  impactGraph: [
    { label: "Souveraineté donnée", value: 92 },
    { label: "Couverture backends", value: 86 },
    { label: "Facilité intégration", value: 88 },
    { label: "Streaming", value: 84 },
  ],
};

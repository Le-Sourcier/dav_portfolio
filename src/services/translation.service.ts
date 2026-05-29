import OpenAI from "openai";
import { config } from "../config/index.js";

type TranslationEntity = "project" | "blog" | "experience" | "settings";
type TranslationLocale = "fr" | "en";
type TranslationFields = Record<string, unknown>;
type TranslationItem = { key: string; value: unknown };

export interface TranslationPayload {
  entity: TranslationEntity;
  sourceLocale: TranslationLocale;
  targetLocale: TranslationLocale;
  fields: TranslationFields;
  instructions?: string;
}

export interface TranslationResult {
  translations: TranslationFields;
  provider: "openrouter" | "openai";
  model: string;
}

const ENTITY_CONTEXT: Record<TranslationEntity, string> = {
  project: "technical case study / portfolio project",
  blog: "technical blog article",
  experience: "professional experience / mission page",
  settings: "portfolio profile/settings content",
};

class TranslationService {
  private openaiClient: OpenAI | null = null;
  private routerClient: OpenAI | null = null;

  isEnabled(): boolean {
    return config.openai.routerEnabled || config.openai.enabled;
  }

  async translate(payload: TranslationPayload): Promise<TranslationResult> {
    if (!this.isEnabled()) {
      throw Object.assign(new Error("AI translation provider is not configured"), { status: 503 });
    }

    if (payload.sourceLocale === payload.targetLocale) {
      throw Object.assign(new Error("Source and target locales must be different"), { status: 400 });
    }

    const fields = this.cleanFields(payload.fields);
    if (!Object.keys(fields).length) {
      throw Object.assign(new Error("No translatable fields provided"), { status: 400 });
    }

    const items = this.fieldsToItems(fields);
    const messages = this.buildMessages({ ...payload, fields }, items);

    if (config.openai.routerEnabled) {
      try {
        const model = config.openai.routerModel;
        const content = await this.callClient(this.getRouterClient(), model, messages);
        const translations = this.parseTranslations(content, fields);
        this.assertUsefulTranslation(fields, translations);
        return {
          translations,
          provider: "openrouter",
          model,
        };
      } catch (error) {
        if (!config.openai.enabled) throw error;
      }
    }

    const model = config.openai.model;
    const content = await this.callClient(this.getOpenAIClient(), model, messages);
    const translations = this.parseTranslations(content, fields);
    this.assertUsefulTranslation(fields, translations);
    return {
      translations,
      provider: "openai",
      model,
    };
  }

  private getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({
        apiKey: config.openai.apiKey,
        organization: config.openai.orgId || undefined,
        timeout: 45000,
        maxRetries: 1,
      });
    }
    return this.openaiClient;
  }

  private getRouterClient(): OpenAI {
    if (!this.routerClient) {
      this.routerClient = new OpenAI({
        apiKey: config.openai.routerApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        timeout: 45000,
        maxRetries: 1,
        defaultHeaders: {
          "HTTP-Referer": config.frontendUrl,
          "X-Title": "Le Sourcier Admin",
        },
      });
    }
    return this.routerClient;
  }

  private buildMessages(payload: TranslationPayload, items: TranslationItem[]) {
    const source = payload.sourceLocale === "fr" ? "French" : "English";
    const target = payload.targetLocale === "fr" ? "French" : "English";
    const context = ENTITY_CONTEXT[payload.entity];
    const extra = payload.instructions?.trim();

    return [
      {
        role: "system" as const,
        content: [
          `You are a senior product/technical editor translating ${context} content.`,
          `Translate from ${source} to ${target}.`,
          "Return ONLY a valid JSON object.",
          'The response shape must be exactly: {"translations":[{"key":"same-key","value":"translated-value"}]}',
          "Each returned item key must match exactly one input item key.",
          "Translate the item values. Ignore field names when detecting language; values are source-language drafts.",
          "Preserve the same value type and structure for arrays and objects.",
          "Translate text values only. Preserve URLs, slugs, code, Markdown syntax, numbers, brand names, acronyms, and technology names when they are not natural language.",
          "Never copy a source-language sentence unchanged unless it is only a brand name, URL, code token, acronym, number, or technology name.",
          "If the input value is an array, return an array with the same length and translated text items.",
          "Do not invent facts, metrics, links, dates, companies, or claims.",
          "Use a concise, premium, credible technical tone.",
          "Avoid literal awkward translation; adapt idioms professionally.",
          extra ? `Custom admin instructions: ${extra}` : "",
        ].filter(Boolean).join("\n"),
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          sourceLocale: payload.sourceLocale,
          targetLocale: payload.targetLocale,
          items,
        }, null, 2),
      },
    ];
  }

  private async callClient(
    client: OpenAI,
    model: string,
    messages: Array<{ role: "system" | "user"; content: string }>,
  ): Promise<string> {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.15,
      response_format: { type: "json_object" },
    } as any);

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Translation provider returned an empty response");
    }
    return content;
  }

  private parseTranslations(content: string, sourceFields: TranslationFields): TranslationFields {
    const normalized = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(normalized) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Translation provider did not return a JSON object");
    }

    const object = parsed as Record<string, unknown>;
    if (Array.isArray(object.translations)) {
      const translations: TranslationFields = {};
      const validKeys = new Set(Object.keys(sourceFields));
      for (const item of object.translations) {
        if (!item || typeof item !== "object") continue;
        const key = (item as { key?: unknown }).key;
        if (typeof key !== "string" || !validKeys.has(key)) continue;
        translations[key] = (item as { value?: unknown }).value;
      }
      if (Object.keys(translations).length) return translations;
    }

    // Backward-compatible fallback for providers that return { key: value }.
    const fallback: TranslationFields = {};
    for (const key of Object.keys(sourceFields)) {
      if (key in object) fallback[key] = object[key];
    }
    if (Object.keys(fallback).length) return fallback;

    throw new Error("Translation provider returned an unusable JSON shape");
  }

  private cleanFields(fields: TranslationFields): TranslationFields {
    const cleaned: TranslationFields = {};
    for (const [key, value] of Object.entries(fields || {})) {
      if (this.hasTranslatableContent(value)) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  private fieldsToItems(fields: TranslationFields): TranslationItem[] {
    return Object.entries(fields).map(([key, value]) => ({ key, value }));
  }

  private assertUsefulTranslation(source: TranslationFields, translated: TranslationFields): void {
    const sourceEntries = Object.entries(source);
    const translatedEntries = Object.entries(translated);
    if (!translatedEntries.length) {
      throw new Error("Translation provider returned no translated fields");
    }

    const allReturnedValuesAreSame = sourceEntries.every(([key, value]) => {
      if (!(key in translated)) return false;
      return this.normalizeComparable(value) === this.normalizeComparable(translated[key]);
    });

    if (allReturnedValuesAreSame) {
      throw new Error("Translation provider returned unchanged content");
    }
  }

  private normalizeComparable(value: unknown): string {
    if (typeof value === "string") return value.trim().toLowerCase().replace(/\s+/g, " ");
    if (Array.isArray(value)) return value.map((item) => this.normalizeComparable(item)).join("|");
    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => `${key}:${this.normalizeComparable(item)}`)
        .join("|");
    }
    return String(value ?? "");
  }

  private hasTranslatableContent(value: unknown): boolean {
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.some((item) => this.hasTranslatableContent(item));
    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>).some((item) => this.hasTranslatableContent(item));
    }
    return false;
  }
}

export const translationService = new TranslationService();
export default translationService;

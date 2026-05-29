import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Image,
  Trophy,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Cpu,
  AlertCircle,
  ChevronRight,
  Layers,
  BarChart3,
} from "lucide-react";
import { useCreateExperience, useTranslateFields, useUpdateExperience } from "@/hooks/queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "../shared/MarkdownEditor";
import { LangToggle } from "@/components/admin/shared/LangToggle";
import { PublicationControl } from "@/components/admin/shared/PublicationControl";
import { AssetUploadField } from "@/components/admin/shared/AssetUploadField";
import { TranslationPanel } from "@/components/admin/shared/TranslationPanel";
import type {
  DiagramConnection,
  DiagramNode,
  Experience,
  ExperienceAchievement,
  ExperienceFormData,
  ExperienceLink,
  ImpactData,
} from "@/types/admin.types";

// ======================== PROPS ========================

interface ExperienceEditorPageProps {
  initialData?: Experience | null;
  onBack: () => void;
}

const normalizeText = (value: unknown) =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, " ")
    : "";

const isBlank = (value: unknown) =>
  typeof value !== "string" || value.trim().length === 0;

const isMissingTranslation = (source: unknown, target: unknown) =>
  isBlank(target) || (!!normalizeText(source) && normalizeText(source) === normalizeText(target));

const toTextArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const hasUsefulTranslations = (
  fields: Record<string, unknown>,
  translations: Record<string, unknown>,
) =>
  Object.entries(fields).some(([key, source]) => {
    const translated = translations[key];
    if (typeof source === "string" && typeof translated === "string") {
      return normalizeText(translated).length > 0 && normalizeText(source) !== normalizeText(translated);
    }
    if (Array.isArray(source) && Array.isArray(translated)) {
      return translated.some((item, index) => {
        if (typeof item !== "string") return false;
        return normalizeText(item).length > 0 && normalizeText(item) !== normalizeText(source[index]);
      });
    }
    return false;
  });

// ======================== DEFAULTS ========================

const defaultForm: ExperienceFormData = {
  title: "",
  company: "",
  location: "",
  dates: "",
  description: "",
  details: [""],
  details_en: [""],
  coverImage: "",
  illustrativeImages: [""],
  stack: [""],
  challenges: [""],
  challenges_en: [""],
  achievements: [{ title: "", description: "" }],
  links: [{ label: "", url: "" }],
  solutionDiagram: { nodes: [], connections: [] },
  impactGraph: [{ label: "", value: 0 }],
  published: true,
  publishedAt: null,
};

// ======================== COMPONENT ========================

export function ExperienceEditorPage({
  initialData,
  onBack,
}: ExperienceEditorPageProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const translateMutation = useTranslateFields();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [translationInstructions, setTranslationInstructions] = useState("");

  const [form, setForm] = useState<ExperienceFormData>(() => {
    if (!initialData)
      return { ...defaultForm, title_en: "", description_en: "" };
    return {
      title: initialData.title,
      title_en: initialData.title_en || "",
      company: initialData.company,
      location: initialData.location || "",
      dates: initialData.dates,
      description: initialData.description || "",
      description_en: initialData.description_en || "",
      details: initialData.details?.length ? initialData.details : [""],
      details_en: initialData.details_en?.length ? initialData.details_en : [""],
      coverImage: initialData.coverImage || "",
      illustrativeImages: initialData.illustrativeImages?.length
        ? initialData.illustrativeImages
        : [""],
      stack: initialData.stack?.length ? initialData.stack : [""],
      challenges: initialData.challenges?.length
        ? initialData.challenges
        : [""],
      challenges_en: initialData.challenges_en?.length
        ? initialData.challenges_en
        : [""],
      achievements: initialData.achievements?.length
        ? initialData.achievements
        : [{ title: "", description: "" }],
      links: initialData.links?.length
        ? initialData.links
        : [{ label: "", url: "" }],
      solutionDiagram: initialData.solutionDiagram || {
        nodes: [],
        connections: [],
      },
      impactGraph: initialData.impactGraph?.length
        ? initialData.impactGraph
        : [{ label: "", value: 0 }],
      published: initialData.published ?? true,
      publishedAt: initialData.publishedAt || null,
    };
  });

  // ======================== FIELD HELPERS ========================

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCoverImageChange = useCallback((url: string) => {
    handleChange("coverImage", url);
    if (isEditing && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        data: { coverImage: url },
      });
    }
  }, [handleChange, initialData?.id, isEditing, updateMutation]);

  const buildTranslationFields = useCallback((overwrite: boolean) => {
    const fields: Record<string, unknown> = {};
    const add = (target: string, source?: string | null, current?: string | null) => {
      if (source?.trim() && (overwrite || isMissingTranslation(source, current))) fields[target] = source;
    };

    add("title", form.title, form.title_en);
    add("description", form.description, form.description_en);

    const addArray = (target: string, source?: string[], current?: string[]) => {
      const values = (source || []).filter((item) => item.trim());
      const currentValues = current || [];
      const hasRealTranslation = currentValues.some((item, index) => item.trim() && !isMissingTranslation(values[index], item));
      if (values.length && (overwrite || !hasRealTranslation)) fields[target] = values;
    };

    addArray("details", form.details, form.details_en);
    addArray("challenges", form.challenges, form.challenges_en);

    const achievementTitles = (form.achievements || []).map((item) =>
      item.title?.trim() && (overwrite || isMissingTranslation(item.title, item.title_en)) ? item.title : "",
    );
    if (achievementTitles.some(Boolean)) fields.achievementTitles = achievementTitles;

    const achievementDescriptions = (form.achievements || []).map((item) =>
      item.description?.trim() && (overwrite || isMissingTranslation(item.description, item.description_en)) ? item.description : "",
    );
    if (achievementDescriptions.some(Boolean)) fields.achievementDescriptions = achievementDescriptions;

    const links = (form.links || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (links.some(Boolean)) fields.links = links;

    const impactGraph = (form.impactGraph || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (impactGraph.some(Boolean)) fields.impactGraph = impactGraph;

    const diagramNodes = (form.solutionDiagram?.nodes || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (diagramNodes.some(Boolean)) fields.diagramNodes = diagramNodes;

    const diagramConnections = (form.solutionDiagram?.connections || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (diagramConnections.some(Boolean)) fields.diagramConnections = diagramConnections;

    return fields;
  }, [form]);

  const applyTranslations = useCallback((translations: Record<string, unknown>) => {
    setForm((prev) => {
      const next = { ...prev };
      if (typeof translations.title === "string") next.title_en = translations.title;
      if (typeof translations.description === "string") next.description_en = translations.description;

      const detailsEn = toTextArray(translations.details);
      if (detailsEn.length) next.details_en = detailsEn;

      const challengesEn = toTextArray(translations.challenges);
      if (challengesEn.length) next.challenges_en = challengesEn;

      const achievementTitles = toTextArray(translations.achievementTitles);
      const achievementDescriptions = toTextArray(translations.achievementDescriptions);
      if (achievementTitles.length || achievementDescriptions.length) {
        next.achievements = (prev.achievements || []).map((item, index) => ({
          ...item,
          title_en: achievementTitles[index] || item.title_en || "",
          description_en: achievementDescriptions[index] || item.description_en || "",
        }));
      }

      const links = toTextArray(translations.links);
      if (links.length) {
        next.links = (prev.links || []).map((item, index) => ({
          ...item,
          label_en: links[index] || item.label_en || "",
        }));
      }

      const impactGraph = toTextArray(translations.impactGraph);
      if (impactGraph.length) {
        next.impactGraph = (prev.impactGraph || []).map((item, index) => ({
          ...item,
          label_en: impactGraph[index] || item.label_en || "",
        }));
      }

      const diagramNodes = toTextArray(translations.diagramNodes);
      const diagramConnections = toTextArray(translations.diagramConnections);
      if (diagramNodes.length || diagramConnections.length) {
        next.solutionDiagram = {
          nodes: (prev.solutionDiagram?.nodes || []).map((item, index) => ({
            ...item,
            label_en: diagramNodes[index] || item.label_en || "",
          })),
          connections: (prev.solutionDiagram?.connections || []).map((item, index) => ({
            ...item,
            label_en: diagramConnections[index] || item.label_en || "",
          })),
        };
      }

      return next;
    });
    setLang("en");
  }, []);

  const handleTranslate = useCallback(async (overwrite: boolean) => {
    const fields = buildTranslationFields(overwrite);
    if (!Object.keys(fields).length) {
      toast.info("Aucun champ FR disponible a traduire");
      return;
    }
    try {
      const result = await translateMutation.mutateAsync({
        entity: "experience",
        sourceLocale: "fr",
        targetLocale: "en",
        fields,
        instructions: translationInstructions,
      });
      if (!hasUsefulTranslations(fields, result.translations)) {
        toast.error("La traduction recue ne modifie aucun champ. Verifiez le provider IA.");
        return;
      }
      applyTranslations(result.translations);
      toast.success("Traduction EN generee");
    } catch (error) {
      toast.error((error as Error).message || "Impossible de generer la traduction");
    }
  }, [applyTranslations, buildTranslationFields, translateMutation, translationInstructions]);

  const handleArrayChange = useCallback(
    (
      field: "stack" | "challenges" | "challenges_en" | "details" | "details_en" | "illustrativeImages",
      index: number,
      value: string,
    ) => {
      setForm((prev) => {
        const arr = [...(prev[field] || [])];
        arr[index] = value;
        return { ...prev, [field]: arr };
      });
    },
    [],
  );

  const addArrayItem = useCallback(
    (field: "stack" | "challenges" | "challenges_en" | "details" | "details_en" | "illustrativeImages") => {
      setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
    },
    [],
  );

  const removeArrayItem = useCallback(
    (
      field: "stack" | "challenges" | "challenges_en" | "details" | "details_en" | "illustrativeImages",
      index: number,
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: (prev[field] || []).filter((_, i) => i !== index),
      }));
    },
    [],
  );

  // Achievements
  const handleAchievementChange = useCallback(
    (index: number, field: keyof ExperienceAchievement, value: string) => {
      setForm((prev) => {
        const achievements = [...(prev.achievements || [])];
        achievements[index] = { ...achievements[index], [field]: value };
        return { ...prev, achievements };
      });
    },
    [],
  );

  const addAchievement = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        { title: "", description: "" },
      ],
    }));
  }, []);

  const removeAchievement = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleImpactChange = useCallback(
    (index: number, field: keyof ImpactData, value: string | number) => {
      setForm((prev) => {
        const impactGraph = [...(prev.impactGraph || [])];
        impactGraph[index] = { ...impactGraph[index], [field]: value };
        return { ...prev, impactGraph };
      });
    },
    [],
  );

  const addImpact = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      impactGraph: [...(prev.impactGraph || []), { label: "", value: 0 }],
    }));
  }, []);

  const removeImpact = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      impactGraph: (prev.impactGraph || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleDiagramNodeChange = useCallback(
    (index: number, field: keyof DiagramNode, value: string) => {
      setForm((prev) => {
        const current = prev.solutionDiagram || { nodes: [], connections: [] };
        const nodes = [...(current.nodes || [])];
        nodes[index] = { ...nodes[index], [field]: value } as DiagramNode;
        return { ...prev, solutionDiagram: { ...current, nodes } };
      });
    },
    [],
  );

  const addDiagramNode = useCallback(() => {
    setForm((prev) => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          nodes: [
            ...(current.nodes || []),
            { id: "", label: "", type: "service" },
          ],
        },
      };
    });
  }, []);

  const removeDiagramNode = useCallback((index: number) => {
    setForm((prev) => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          nodes: (current.nodes || []).filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  const handleDiagramConnectionChange = useCallback(
    (index: number, field: keyof DiagramConnection, value: string) => {
      setForm((prev) => {
        const current = prev.solutionDiagram || { nodes: [], connections: [] };
        const connections = [...(current.connections || [])];
        connections[index] = { ...connections[index], [field]: value };
        return { ...prev, solutionDiagram: { ...current, connections } };
      });
    },
    [],
  );

  const addDiagramConnection = useCallback(() => {
    setForm((prev) => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          connections: [
            ...(current.connections || []),
            { from: "", to: "", label: "" },
          ],
        },
      };
    });
  }, []);

  const removeDiagramConnection = useCallback((index: number) => {
    setForm((prev) => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          connections: (current.connections || []).filter(
            (_, i) => i !== index,
          ),
        },
      };
    });
  }, []);

  // Links
  const handleLinkChange = useCallback(
    (index: number, field: keyof ExperienceLink, value: string) => {
      setForm((prev) => {
        const links = [...(prev.links || [])];
        links[index] = { ...links[index], [field]: value };
        return { ...prev, links };
      });
    },
    [],
  );

  const addLink = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      links: [...(prev.links || []), { label: "", url: "" }],
    }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index),
    }));
  }, []);

  // ======================== SAVE ========================

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      toast.error("Le poste est obligatoire");
      return;
    }
    if (!form.company.trim()) {
      toast.error("L'entreprise est obligatoire");
      return;
    }
    if (!form.dates.trim()) {
      toast.error("La periode est obligatoire");
      return;
    }

    const cleaned: Record<string, unknown> = {
      title: form.title.trim(),
      company: form.company.trim(),
      dates: form.dates.trim(),
      description: form.description?.trim() || "",
      published: form.published ?? true,
      publishedAt: form.publishedAt || null,
    };

    cleaned.title_en = form.title_en?.trim() || "";
    cleaned.description_en = form.description_en?.trim() || "";

    if (form.location?.trim()) cleaned.location = form.location.trim();
    cleaned.coverImage = form.coverImage?.trim() || "";

    const details = form.details?.filter((d) => d.trim()) || [];
    if (details.length) cleaned.details = details;

    const detailsEn = form.details_en?.filter((d) => d.trim()) || [];
    if (detailsEn.length) cleaned.details_en = detailsEn;

    const illustrativeImages =
      form.illustrativeImages?.filter((img) => img.trim()) || [];
    if (illustrativeImages.length)
      cleaned.illustrativeImages = illustrativeImages;

    const stack = form.stack?.filter((s) => s.trim()) || [];
    if (stack.length) cleaned.stack = stack;

    const challenges = form.challenges?.filter((c) => c.trim()) || [];
    if (challenges.length) cleaned.challenges = challenges;

    const challengesEn = form.challenges_en?.filter((c) => c.trim()) || [];
    if (challengesEn.length) cleaned.challenges_en = challengesEn;

    const achievements = (form.achievements || []).filter((a) =>
      a.title.trim(),
    );
    if (achievements.length) cleaned.achievements = achievements;

    const links = (form.links || []).filter(
      (l) => l.label.trim() && l.url.trim(),
    );
    if (links.length) cleaned.links = links;

    const impactGraph = (form.impactGraph || []).filter((item) =>
      item.label.trim(),
    );
    if (impactGraph.length) cleaned.impactGraph = impactGraph;

    const diagramNodes = (form.solutionDiagram?.nodes || []).filter(
      (node) => node.id.trim() && node.label.trim(),
    );
    const diagramConnections = (form.solutionDiagram?.connections || []).filter(
      (connection) => connection.from.trim() && connection.to.trim(),
    );
    if (diagramNodes.length || diagramConnections.length) {
      cleaned.solutionDiagram = {
        nodes: diagramNodes,
        connections: diagramConnections,
      };
    }

    const options = {
      onSuccess: () => {
        setSaved(true);
        toast.success(
          isEditing ? "Experience mise a jour" : "Experience creee",
        );
        setTimeout(() => setSaved(false), 2000);
        if (!isEditing) setTimeout(onBack, 500);
      },
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: cleaned as Partial<ExperienceFormData> },
        options,
      );
    } else {
      createMutation.mutate(cleaned as ExperienceFormData, options);
    }
  }, [form, isEditing, initialData, createMutation, updateMutation, onBack]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ======================== RENDER ========================

  return (
    <div className="space-y-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing ? "Modifier l'experience" : "Nouvelle experience"}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {form.company
                ? `${form.title || "Poste"} - ${form.company}`
                : "Remplissez les informations"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <LangToggle
            lang={lang}
            onChange={setLang}
            hasEnContent={!!form.title_en?.trim()}
          />
          <PublicationControl
            published={form.published}
            publishedAt={form.publishedAt}
            onPublishedChange={(value) => handleChange("published", value)}
            onPublishedAtChange={(value) => handleChange("publishedAt", value)}
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className={cn(
              "h-8 px-4 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60",
              saved
                ? "bg-emerald-600 text-white"
                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100",
            )}>
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {saved ? "Enregistre" : isEditing ? "Mettre a jour" : "Creer"}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* ======================== LEFT COLUMN ======================== */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title + Company */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                <Briefcase className="w-3 h-3 inline mr-1" />
                {lang === "fr"
                  ? "Poste / Titre du role (FR) *"
                  : "Job Title / Role (EN)"}
              </label>
              {lang === "fr" ? (
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Developpeur Fullstack Senior"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
                />
              ) : (
                <input
                  value={form.title_en || ""}
                  onChange={(e) => handleChange("title_en", e.target.value)}
                  placeholder="E.g.: Senior Fullstack Developer"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Entreprise *
                </label>
                <input
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="Google, Meta..."
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Periode *
                </label>
                <input
                  value={form.dates}
                  onChange={(e) => handleChange("dates", e.target.value)}
                  placeholder="Jan 2023 - Present"
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Lieu
                </label>
                <input
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Paris, Remote..."
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <AssetUploadField
            value={form.coverImage}
            label="URL de l'image de couverture :"
            emptyLabel="Ajouter une image de couverture"
            scope="experiences"
            onChange={handleCoverImageChange}
          />

          <DynamicListSection
            label="Images illustratives"
            icon={<Image className="w-3 h-3" />}
            items={form.illustrativeImages || [""]}
            placeholder="URL d'une image supplementaire..."
            onAdd={() => addArrayItem("illustrativeImages")}
            onChange={(i, v) => handleArrayChange("illustrativeImages", i, v)}
            onRemove={(i) => removeArrayItem("illustrativeImages", i)}
          />

          {/* Description (Markdown Editor) */}
          {lang === "fr" ? (
            <MarkdownEditor
              label="Description / Contexte (FR)"
              value={form.description || ""}
              onChange={(v) => handleChange("description", v)}
              placeholder="Decrivez le contexte de la mission, le role, les responsabilites...

# Contexte du projet

Du texte avec du **gras** et de l'*italique*.

```javascript
const api = express();
api.listen(3000);
```"
              minHeight="250px"
            />
          ) : (
            <MarkdownEditor
              label="Description / Context (EN)"
              value={form.description_en || ""}
              onChange={(v) => handleChange("description_en", v)}
              placeholder="Describe the mission context, role, and responsibilities...

# Project Context

Text with **bold** and *italic*.

```javascript
const api = express();
api.listen(3000);
```"
              minHeight="250px"
            />
          )}

          {/* Details (bullet points) */}
          <DynamicListSection
            label={lang === "en" ? "Details / Responsibilities (EN)" : "Details / Responsabilites"}
            icon={<ChevronRight className="w-3 h-3" />}
            items={(lang === "en" ? form.details_en : form.details) || [""]}
            placeholder={lang === "en" ? "Responsibility or key detail..." : "Responsabilite ou detail cle..."}
            onAdd={() => addArrayItem(lang === "en" ? "details_en" : "details")}
            onChange={(i, v) => handleArrayChange(lang === "en" ? "details_en" : "details", i, v)}
            onRemove={(i) => removeArrayItem(lang === "en" ? "details_en" : "details", i)}
          />

          {/* Challenges */}
          <DynamicListSection
            label={lang === "en" ? "Challenges & Constraints (EN)" : "Defis & Problematiques"}
            icon={<AlertCircle className="w-3 h-3" />}
            items={(lang === "en" ? form.challenges_en : form.challenges) || [""]}
            placeholder={lang === "en" ? "A challenge or constraint..." : "Un defi rencontre..."}
            onAdd={() => addArrayItem(lang === "en" ? "challenges_en" : "challenges")}
            onChange={(i, v) => handleArrayChange(lang === "en" ? "challenges_en" : "challenges", i, v)}
            onRemove={(i) => removeArrayItem(lang === "en" ? "challenges_en" : "challenges", i)}
          />

          {/* Achievements */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Realisations
              </label>
              <button
                onClick={addAchievement}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {(form.achievements || []).map((ach, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={lang === "en" ? ach.title_en || "" : ach.title}
                      onChange={(e) =>
                        handleAchievementChange(i, lang === "en" ? "title_en" : "title", e.target.value)
                      }
                      placeholder={lang === "en" ? "Achievement title" : "Titre de la realisation"}
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] font-semibold outline-none focus:border-zinc-400"
                    />
                    <input
                      value={lang === "en" ? ach.description_en || "" : ach.description}
                      onChange={(e) =>
                        handleAchievementChange(
                          i,
                          lang === "en" ? "description_en" : "description",
                          e.target.value,
                        )
                      }
                      placeholder={lang === "en" ? "Description..." : "Description..."}
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={ach.icon || ""}
                      onChange={(e) =>
                        handleAchievementChange(i, "icon", e.target.value)
                      }
                      placeholder="Icone optionnelle"
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 sm:col-span-2"
                    />
                  </div>
                  <button
                    onClick={() => removeAchievement(i)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Graph d'impact
              </label>
              <button
                onClick={addImpact}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.impactGraph || []).map((item, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={item.label}
                    onChange={(e) =>
                      handleImpactChange(i, "label", e.target.value)
                    }
                    placeholder="Label"
                    className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) =>
                      handleImpactChange(i, "value", Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-20 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <button
                    onClick={() => removeImpact(i)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Diagramme de solution
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Noeuds
                </span>
                <button
                  onClick={addDiagramNode}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {(form.solutionDiagram?.nodes || []).map((node, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      value={node.id}
                      onChange={(e) =>
                        handleDiagramNodeChange(i, "id", e.target.value)
                      }
                      placeholder="id"
                      className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                    />
                    <input
                      value={node.label}
                      onChange={(e) =>
                        handleDiagramNodeChange(i, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={node.type}
                      onChange={(e) =>
                        handleDiagramNodeChange(i, "type", e.target.value)
                      }
                      placeholder="service"
                      className="w-28 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <button
                      onClick={() => removeDiagramNode(i)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Connexions
                </span>
                <button
                  onClick={addDiagramConnection}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {(form.solutionDiagram?.connections || []).map(
                  (connection, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <input
                        value={connection.from}
                        onChange={(e) =>
                          handleDiagramConnectionChange(
                            i,
                            "from",
                            e.target.value,
                          )
                        }
                        placeholder="from"
                        className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                      />
                      <input
                        value={connection.to}
                        onChange={(e) =>
                          handleDiagramConnectionChange(i, "to", e.target.value)
                        }
                        placeholder="to"
                        className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                      />
                      <input
                        value={connection.label || ""}
                        onChange={(e) =>
                          handleDiagramConnectionChange(
                            i,
                            "label",
                            e.target.value,
                          )
                        }
                        placeholder="Label optionnel"
                        className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                      />
                      <button
                        onClick={() => removeDiagramConnection(i)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================== RIGHT SIDEBAR ======================== */}
        <div className="xl:w-[280px] shrink-0 space-y-4">
          <TranslationPanel
            instructions={translationInstructions}
            isPending={translateMutation.isPending}
            onInstructionsChange={setTranslationInstructions}
            onTranslateMissing={() => handleTranslate(false)}
            onTranslateAll={() => handleTranslate(true)}
          />

          {/* Stack */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Stack Technique
              </label>
              <button
                onClick={() => addArrayItem("stack")}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(form.stack || [""]).map((tech, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={tech}
                    onChange={(e) =>
                      handleArrayChange("stack", i, e.target.value)
                    }
                    placeholder="React, Node..."
                    className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button
                    onClick={() => removeArrayItem("stack", i)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Liens
              </label>
              <button
                onClick={addLink}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.links || []).map((link, i) => (
                <div key={i} className="flex gap-1.5">
                  <div className="flex-1 space-y-1">
                    <input
                      value={lang === "en" ? link.label_en || "" : link.label}
                      onChange={(e) =>
                        handleLinkChange(i, lang === "en" ? "label_en" : "label", e.target.value)
                      }
                      placeholder={lang === "en" ? "Label (EN)" : "Label"}
                      className="w-full h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(i, "url", e.target.value)
                      }
                      placeholder="https://..."
                      className="w-full h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] font-mono outline-none focus:border-zinc-400"
                    />
                  </div>
                  <button
                    onClick={() => removeLink(i)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0 self-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">
              Apercu carte
            </label>
            <div className="bg-secondary/45 rounded-lg p-3 space-y-2">
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt=""
                  className="w-full h-20 object-cover rounded-md"
                />
              )}
              <p className="text-[13px] font-bold text-foreground leading-tight">
                {form.title || "Poste"}
              </p>
              <p className="text-[11px] text-zinc-500">
                {form.company || "Entreprise"} - {form.dates || "Periode"}
              </p>
              {form.stack?.filter(Boolean).length ? (
                <div className="flex flex-wrap gap-1">
                  {form.stack
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((t, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-bold">
                        {t}
                      </span>
                    ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Help */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">
              Champs affiches
            </label>
            <div className="space-y-1 text-[10px] text-zinc-500">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                Titre, Entreprise, Dates
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Image
                de couverture
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{" "}
                Description, Details
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
                Stack technique
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Defis &
                Realisations
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Liens
                utiles
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{" "}
                Images, graph & diagramme
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== REUSABLE SUB-COMPONENT ========================

interface DynamicListSectionProps {
  label: string;
  icon: React.ReactNode;
  optional?: React.ReactNode;
  items: string[];
  placeholder: string;
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function DynamicListSection({
  label,
  icon,
  items,
  placeholder,
  onAdd,
  onChange,
  onRemove,
}: DynamicListSectionProps) {
  return (
    <div className="bg-card/60 rounded-xl border border-border/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          {icon}
          {label}
        </label>
        <button
          onClick={onAdd}
          className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 transition-colors"
            />
            <button
              onClick={() => onRemove(i)}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

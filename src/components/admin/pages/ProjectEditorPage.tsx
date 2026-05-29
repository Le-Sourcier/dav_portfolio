import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  BarChart3,
  Trophy,
  Cpu,
  FolderKanban,
} from "lucide-react";
import { useCreateProject, useTranslateFields, useUpdateProject } from "@/hooks/queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "../shared/MarkdownEditor";
import { LangToggle } from "../shared/LangToggle";
import { PublicationControl } from "../shared/PublicationControl";
import { AssetUploadField } from "../shared/AssetUploadField";
import { TranslationPanel } from "../shared/TranslationPanel";
import type {
  ChartDataPoint,
  DiagramConnection,
  DiagramNode,
  ImpactData,
  Project,
  ProjectFormData,
  ProjectLink,
  ProjectMetric,
} from "@/types/admin.types";

// ======================== CONSTANTS ========================

const PROJECT_CATEGORIES = [
  "Fullstack",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Design",
  "UI/UX",
  "Web",
  "Software",
] as const;

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

// ======================== PROPS ========================

interface ProjectEditorPageProps {
  initialData?: Project | null;
  onBack: () => void;
}

// ======================== DEFAULTS ========================

const defaultForm: ProjectFormData = {
  slug: "",
  title: "",
  title_en: "",
  name: "",
  category: "Fullstack",
  category_en: "",
  image: "",
  description: "",
  description_en: "",
  headline: "",
  headline_en: "",
  problem: "",
  problem_en: "",
  solution: "",
  solution_en: "",
  result: "",
  result_en: "",
  metric: "",
  metric_en: "",
  role: "",
  role_en: "",
  results: [""],
  results_en: [""],
  metrics: [{ name: "", value: 0, previousValue: 0, unit: "%" }],
  chartData: [],
  tech: [""],
  links: [],
  featured: false,
  published: true,
  publishedAt: null,
  url: "",
};

// ======================== COMPONENT ========================

export function ProjectEditorPage({
  initialData,
  onBack,
}: ProjectEditorPageProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const translateMutation = useTranslateFields();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [translationInstructions, setTranslationInstructions] = useState("");

  const [form, setForm] = useState<ProjectFormData>(() => {
    if (!initialData) return defaultForm;
    return {
      slug: initialData.slug || "",
      title: initialData.title,
      title_en: initialData.title_en || "",
      name: initialData.name || initialData.title,
      category: initialData.category,
      category_en: initialData.category_en || "",
      image: initialData.image || "",
      description: initialData.description || "",
      description_en: initialData.description_en || "",
      headline: initialData.headline || "",
      headline_en: initialData.headline_en || "",
      problem: initialData.problem || "",
      problem_en: initialData.problem_en || "",
      solution: initialData.solution || "",
      solution_en: initialData.solution_en || "",
      result: initialData.result || "",
      result_en: initialData.result_en || "",
      metric: initialData.metric || "",
      metric_en: initialData.metric_en || "",
      role: initialData.role || "",
      role_en: initialData.role_en || "",
      results: initialData.results?.length ? initialData.results : [""],
      results_en: initialData.results_en?.length ? initialData.results_en : [""],
      metrics: initialData.metrics?.length
        ? initialData.metrics
        : [{ name: "", value: 0, previousValue: 0, unit: "%" }],
      chartData: initialData.chartData || [],
      tech: initialData.tech?.length ? initialData.tech : [""],
      links: initialData.links || [],
      featured: Boolean(initialData.featured),
      published: initialData.published ?? true,
      publishedAt: initialData.publishedAt || null,
      url: initialData.url || "",
      solutionDiagram: initialData.solutionDiagram,
      impactGraph: initialData.impactGraph || [],
    };
  });

  // ======================== FIELD HELPERS ========================

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageChange = useCallback((url: string) => {
    handleChange("image", url);
    if (isEditing && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        data: { image: url },
      });
    }
  }, [handleChange, initialData?.id, isEditing, updateMutation]);

  const buildTranslationFields = useCallback((overwrite: boolean) => {
    const fields: Record<string, unknown> = {};
    const add = (target: string, source?: string | null, current?: string | null) => {
      if (source?.trim() && (overwrite || isMissingTranslation(source, current))) fields[target] = source;
    };
    const addArray = (target: string, source?: string[], current?: string[]) => {
      const values = (source || []).filter((item) => item.trim());
      const currentValues = current || [];
      const hasRealTranslation = currentValues.some((item, index) => item.trim() && !isMissingTranslation(values[index], item));
      if (values.length && (overwrite || !hasRealTranslation)) fields[target] = values;
    };

    add("title", form.title, form.title_en);
    add("category", form.category, form.category_en);
    add("description", form.description, form.description_en);
    add("headline", form.headline, form.headline_en);
    add("problem", form.problem, form.problem_en);
    add("solution", form.solution, form.solution_en);
    add("result", form.result, form.result_en);
    add("metric", form.metric, form.metric_en);
    add("role", form.role, form.role_en);
    addArray("results", form.results, form.results_en);

    const metrics = (form.metrics || []).map((item) =>
      item.name?.trim() && (overwrite || isMissingTranslation(item.name, item.name_en)) ? item.name : "",
    );
    if (metrics.some(Boolean)) fields.metrics = metrics;

    const chartData = (form.chartData || []).map((item) =>
      item.name?.trim() && (overwrite || isMissingTranslation(item.name, item.name_en)) ? item.name : "",
    );
    if (chartData.some(Boolean)) fields.chartData = chartData;

    const impactGraph = (form.impactGraph || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (impactGraph.some(Boolean)) fields.impactGraph = impactGraph;

    const links = (form.links || []).map((item) =>
      item.label?.trim() && (overwrite || isMissingTranslation(item.label, item.label_en)) ? item.label : "",
    );
    if (links.some(Boolean)) fields.links = links;

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
      const assignString = (sourceKey: string, targetKey: keyof ProjectFormData) => {
        if (typeof translations[sourceKey] === "string") {
          (next as any)[targetKey] = translations[sourceKey];
        }
      };

      assignString("title", "title_en");
      assignString("category", "category_en");
      assignString("description", "description_en");
      assignString("headline", "headline_en");
      assignString("problem", "problem_en");
      assignString("solution", "solution_en");
      assignString("result", "result_en");
      assignString("metric", "metric_en");
      assignString("role", "role_en");

      const resultsEn = toTextArray(translations.results);
      if (resultsEn.length) next.results_en = resultsEn;

      const metrics = toTextArray(translations.metrics);
      if (metrics.length) {
        next.metrics = (prev.metrics || []).map((item, index) => ({
          ...item,
          name_en: metrics[index] || item.name_en || "",
        }));
      }

      const chartData = toTextArray(translations.chartData);
      if (chartData.length) {
        next.chartData = (prev.chartData || []).map((item, index) => ({
          ...item,
          name_en: chartData[index] || item.name_en || "",
        }));
      }

      const impactGraph = toTextArray(translations.impactGraph);
      if (impactGraph.length) {
        next.impactGraph = (prev.impactGraph || []).map((item, index) => ({
          ...item,
          label_en: impactGraph[index] || item.label_en || "",
        }));
      }

      const links = toTextArray(translations.links);
      if (links.length) {
        next.links = (prev.links || []).map((item, index) => ({
          ...item,
          label_en: links[index] || item.label_en || "",
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
        entity: "project",
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
    (field: "results" | "results_en" | "tech", index: number, value: string) => {
      setForm((prev) => {
        const arr = [...((prev as any)[field] || [])];
        arr[index] = value;
        return { ...prev, [field]: arr };
      });
    },
    [],
  );

  const addArrayItem = useCallback((field: "results" | "results_en" | "tech") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...((prev as any)[field] || []), ""],
    }));
  }, []);

  const removeArrayItem = useCallback(
    (field: "results" | "results_en" | "tech", index: number) => {
      setForm((prev) => ({
        ...prev,
        [field]: ((prev as any)[field] || []).filter(
          (_: string, i: number) => i !== index,
        ),
      }));
    },
    [],
  );

  // Metrics
  const handleMetricChange = useCallback(
    (index: number, key: keyof ProjectMetric, value: string | number) => {
      setForm((prev) => {
        const metrics = [...(prev.metrics || [])];
        metrics[index] = { ...metrics[index], [key]: value };
        return { ...prev, metrics };
      });
    },
    [],
  );

  const addMetric = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      metrics: [
        ...(prev.metrics || []),
        { name: "", value: 0, previousValue: 0, unit: "%" },
      ],
    }));
  }, []);

  const removeMetric = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      metrics: (prev.metrics || []).filter((_, i) => i !== index),
    }));
  }, []);

  const updateListItem = useCallback(
    <T extends object,>(
      field: "links" | "chartData" | "impactGraph",
      index: number,
      key: keyof T,
      value: string | number,
    ) => {
      setForm((prev) => {
        const items = [...(((prev as any)[field] || []) as T[])];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, [field]: items };
      });
    },
    [],
  );

  const addListItem = useCallback(
    (field: "links" | "chartData" | "impactGraph") => {
      const defaults = {
        links: { label: "", label_en: "", href: "" } satisfies ProjectLink,
        chartData: { name: "", name_en: "", value: 0 } satisfies ChartDataPoint,
        impactGraph: { label: "", label_en: "", value: 0 } satisfies ImpactData,
      };
      setForm((prev) => ({
        ...prev,
        [field]: [...(((prev as any)[field] || []) as unknown[]), defaults[field]],
      }));
    },
    [],
  );

  const removeListItem = useCallback(
    (field: "links" | "chartData" | "impactGraph", index: number) => {
      setForm((prev) => ({
        ...prev,
        [field]: (((prev as any)[field] || []) as unknown[]).filter(
          (_, i) => i !== index,
        ),
      }));
    },
    [],
  );

  const updateDiagramNode = useCallback(
    (index: number, key: keyof DiagramNode, value: string) => {
      setForm((prev) => {
        const nodes = [...(prev.solutionDiagram?.nodes || [])];
        nodes[index] = { ...nodes[index], [key]: value } as DiagramNode;
        return {
          ...prev,
          solutionDiagram: {
            nodes,
            connections: prev.solutionDiagram?.connections || [],
          },
        };
      });
    },
    [],
  );

  const addDiagramNode = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      solutionDiagram: {
        nodes: [
          ...(prev.solutionDiagram?.nodes || []),
          { id: `node-${Date.now()}`, label: "", label_en: "", type: "service" },
        ],
        connections: prev.solutionDiagram?.connections || [],
      },
    }));
  }, []);

  const removeDiagramNode = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      solutionDiagram: {
        nodes: (prev.solutionDiagram?.nodes || []).filter((_, i) => i !== index),
        connections: prev.solutionDiagram?.connections || [],
      },
    }));
  }, []);

  const updateDiagramConnection = useCallback(
    (index: number, key: keyof DiagramConnection, value: string) => {
      setForm((prev) => {
        const connections = [...(prev.solutionDiagram?.connections || [])];
        connections[index] = { ...connections[index], [key]: value };
        return {
          ...prev,
          solutionDiagram: {
            nodes: prev.solutionDiagram?.nodes || [],
            connections,
          },
        };
      });
    },
    [],
  );

  const addDiagramConnection = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      solutionDiagram: {
        nodes: prev.solutionDiagram?.nodes || [],
        connections: [
          ...(prev.solutionDiagram?.connections || []),
          { from: "", to: "", label: "", label_en: "" },
        ],
      },
    }));
  }, []);

  const removeDiagramConnection = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      solutionDiagram: {
        nodes: prev.solutionDiagram?.nodes || [],
        connections: (prev.solutionDiagram?.connections || []).filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }, []);

  // ======================== SAVE ========================

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    const cleaned: Record<string, unknown> = {
      slug: form.slug?.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: form.title.trim(),
      title_en: form.title_en?.trim() || "",
      name: form.name?.trim() || form.title.trim(),
      category: form.category,
      category_en: form.category_en?.trim() || "",
      description: form.description?.trim() || "",
      description_en: form.description_en?.trim() || "",
      headline: form.headline?.trim() || "",
      headline_en: form.headline_en?.trim() || "",
      problem: form.problem?.trim() || "",
      problem_en: form.problem_en?.trim() || "",
      solution: form.solution?.trim() || "",
      solution_en: form.solution_en?.trim() || "",
      result: form.result?.trim() || "",
      result_en: form.result_en?.trim() || "",
      metric: form.metric?.trim() || "",
      metric_en: form.metric_en?.trim() || "",
      role: form.role?.trim() || "",
      role_en: form.role_en?.trim() || "",
      featured: Boolean(form.featured),
      published: form.published ?? true,
      publishedAt: form.publishedAt || null,
    };

    cleaned.image = form.image?.trim() || "";
    if (form.url?.trim()) cleaned.url = form.url.trim();

    const results = form.results?.filter((r) => r.trim()) || [];
    if (results.length) cleaned.results = results;
    const resultsEn = form.results_en?.filter((r) => r.trim()) || [];
    if (resultsEn.length) cleaned.results_en = resultsEn;

    const technologies = form.tech?.filter((t) => t.trim()) || [];
    if (technologies.length) cleaned.tech = technologies;

    const metrics = (form.metrics || []).filter((m) => m.name.trim());
    if (metrics.length) cleaned.metrics = metrics;

    const chartData = (form.chartData || []).filter((item) => item.name.trim());
    if (chartData.length) cleaned.chartData = chartData;

    const links = (form.links || []).filter((link) => link.label.trim() && link.href.trim());
    if (links.length) cleaned.links = links;

    const impactGraph = (form.impactGraph || []).filter((item) => item.label.trim());
    if (impactGraph.length) cleaned.impactGraph = impactGraph;

    const diagramNodes = form.solutionDiagram?.nodes?.filter((node) => node.id.trim() && node.label.trim()) || [];
    const diagramConnections = form.solutionDiagram?.connections?.filter((connection) => connection.from.trim() && connection.to.trim()) || [];
    if (diagramNodes.length || diagramConnections.length) {
      cleaned.solutionDiagram = {
        nodes: diagramNodes,
        connections: diagramConnections,
      };
    }

    const options = {
      onSuccess: () => {
        setSaved(true);
        toast.success(isEditing ? "Projet mis a jour" : "Projet cree");
        setTimeout(() => setSaved(false), 2000);
        if (!isEditing) setTimeout(onBack, 500);
      },
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: cleaned as Partial<ProjectFormData> },
        options,
      );
    } else {
      createMutation.mutate(cleaned as ProjectFormData, options);
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
              {isEditing ? "Modifier le projet" : "Nouveau projet"}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {form.title || "Remplissez les informations du projet"}
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
          {/* Title + Category */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                <FolderKanban className="w-3 h-3 inline mr-1" />
                {lang === "fr"
                  ? "Titre du projet (FR) *"
                  : "Project Title (EN)"}
              </label>
              {lang === "fr" ? (
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Dashboard Analytics SaaS"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
                />
              ) : (
                <input
                  value={form.title_en || ""}
                  onChange={(e) => handleChange("title_en", e.target.value)}
                  placeholder="E.g.: Analytics SaaS Dashboard"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Slug
                </label>
                <input
                  value={form.slug || ""}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="nexus-platform"
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  {lang === "fr" ? "Nom court" : "Short name"}
                </label>
                <input
                  value={form.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nexus Platform"
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  {lang === "fr" ? "Categorie" : "Category"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleChange("category", cat)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                        form.category === cat
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {lang === "en" ? (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                    Category label (EN)
                  </label>
                  <input
                    value={form.category_en || ""}
                    onChange={(e) => handleChange("category_en", e.target.value)}
                    placeholder="B2B SaaS, Mobile, Backend..."
                    className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>
              ) : null}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  {lang === "fr" ? "URL du projet" : "Project URL"}
                </label>
                <input
                  value={form.url}
                  onChange={(e) => handleChange("url", e.target.value)}
                  placeholder="https://monprojet.com"
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 text-[12px] text-zinc-500">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                  className="rounded border-border"
                />
                {lang === "fr" ? "Projet mis en avant" : "Featured project"}
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <AssetUploadField
            value={form.image}
            label={lang === "fr" ? "URL de l'image :" : "Image URL:"}
            emptyLabel={lang === "fr" ? "Ajouter une image" : "Add cover image"}
            scope="projects"
            onChange={handleImageChange}
          />

          <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-3">
            <label className="block text-[11px] font-medium text-zinc-400">
              {lang === "fr" ? "Signaux publics" : "Public signals"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={lang === "fr" ? form.headline || "" : form.headline_en || ""}
                onChange={(e) => handleChange(lang === "fr" ? "headline" : "headline_en", e.target.value)}
                placeholder={lang === "fr" ? "Headline court du projet" : "Short project headline"}
                className="h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
              />
              <input
                value={lang === "fr" ? form.metric || "" : form.metric_en || ""}
                onChange={(e) => handleChange(lang === "fr" ? "metric" : "metric_en", e.target.value)}
                placeholder={lang === "fr" ? "Signal principal" : "Main signal"}
                className="h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
              />
              <input
                value={lang === "fr" ? form.role || "" : form.role_en || ""}
                onChange={(e) => handleChange(lang === "fr" ? "role" : "role_en", e.target.value)}
                placeholder={lang === "fr" ? "Role sur le projet" : "Project role"}
                className="h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
              />
              <input
                value={lang === "fr" ? form.result || "" : form.result_en || ""}
                onChange={(e) => handleChange(lang === "fr" ? "result" : "result_en", e.target.value)}
                placeholder={lang === "fr" ? "Resultat court" : "Short result"}
                className="h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          {lang === "fr" ? (
            <MarkdownEditor
              label="Description du projet (FR)"
              value={form.description || ""}
              onChange={(v) => handleChange("description", v)}
              placeholder="Decrivez le projet, son contexte et ses objectifs..."
              minHeight="200px"
            />
          ) : (
            <MarkdownEditor
              label="Project Description (EN)"
              value={form.description_en || ""}
              onChange={(v) => handleChange("description_en", v)}
              placeholder="Describe the project, its context and objectives..."
              minHeight="200px"
            />
          )}

          {/* Problem */}
          {lang === "fr" ? (
            <MarkdownEditor
              label="Problematique (FR)"
              value={form.problem || ""}
              onChange={(v) => handleChange("problem", v)}
              placeholder="Quel probleme ce projet resout-il ?"
              minHeight="150px"
            />
          ) : (
            <MarkdownEditor
              label="Problem Statement (EN)"
              value={form.problem_en || ""}
              onChange={(v) => handleChange("problem_en", v)}
              placeholder="What problem does this project solve?"
              minHeight="150px"
            />
          )}

          {/* Solution */}
          {lang === "fr" ? (
            <MarkdownEditor
              label="Solution apportee (FR)"
              value={form.solution || ""}
              onChange={(v) => handleChange("solution", v)}
              placeholder="Comment avez-vous resolu le probleme ? Quelle approche technique ?"
              minHeight="150px"
            />
          ) : (
            <MarkdownEditor
              label="Solution (EN)"
              value={form.solution_en || ""}
              onChange={(v) => handleChange("solution_en", v)}
              placeholder="How did you solve the problem? What was the technical approach?"
              minHeight="150px"
            />
          )}

          {/* Results */}
          <DynamicListSection
            label={lang === "fr" ? "Resultats cles" : "Key Results"}
            icon={<Trophy className="w-3 h-3" />}
            items={(lang === "fr" ? form.results : form.results_en) || [""]}
            placeholder={
              lang === "fr"
                ? "Ex: +45% de performance, 10k utilisateurs..."
                : "E.g.: +45% performance, 10k users..."
            }
            onAdd={() => addArrayItem(lang === "fr" ? "results" : "results_en")}
            onChange={(i, v) => handleArrayChange(lang === "fr" ? "results" : "results_en", i, v)}
            onRemove={(i) => removeArrayItem(lang === "fr" ? "results" : "results_en", i)}
          />

          {/* Metrics */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {lang === "fr" ? "Metriques" : "Metrics"}
              </label>
              <button
                onClick={addMetric}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.metrics || []).map((metric, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={lang === "fr" ? metric.name : metric.name_en || ""}
                    onChange={(e) =>
                      handleMetricChange(i, lang === "fr" ? "name" : "name_en", e.target.value)
                    }
                    placeholder={lang === "fr" ? "Nom" : "Name (EN)"}
                    className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    type="number"
                    value={metric.value}
                    onChange={(e) =>
                      handleMetricChange(i, "value", Number(e.target.value))
                    }
                    placeholder={lang === "fr" ? "Val" : "Val"}
                    className="w-16 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <input
                    value={metric.unit}
                    onChange={(e) =>
                      handleMetricChange(i, "unit", e.target.value)
                    }
                    placeholder="%"
                    className="w-12 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <button
                    onClick={() => removeMetric(i)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400">
                {lang === "fr" ? "Courbe d'evolution" : "Evolution chart"}
              </label>
              <button onClick={() => addListItem("chartData")} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.chartData || []).map((point, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={lang === "fr" ? point.name : point.name_en || ""}
                    onChange={(e) => updateListItem<ChartDataPoint>("chartData", i, lang === "fr" ? "name" : "name_en", e.target.value)}
                    placeholder={lang === "fr" ? "Label" : "Label (EN)"}
                    className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => updateListItem<ChartDataPoint>("chartData", i, "value", Number(e.target.value))}
                    placeholder="0"
                    className="w-20 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <button onClick={() => removeListItem("chartData", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400">
                {lang === "fr" ? "Ressources externes" : "External resources"}
              </label>
              <button onClick={() => addListItem("links")} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.links || []).map((link, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-1.5 items-center">
                  <input
                    value={lang === "fr" ? link.label : link.label_en || ""}
                    onChange={(e) => updateListItem<ProjectLink>("links", i, lang === "fr" ? "label" : "label_en", e.target.value)}
                    placeholder={lang === "fr" ? "Libelle" : "Label (EN)"}
                    className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    value={link.href}
                    onChange={(e) => updateListItem<ProjectLink>("links", i, "href", e.target.value)}
                    placeholder="https://..."
                    className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button onClick={() => removeListItem("links", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400">
                {lang === "fr" ? "Impact / maturite" : "Impact / maturity"}
              </label>
              <button onClick={() => addListItem("impactGraph")} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.impactGraph || []).map((item, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={lang === "fr" ? item.label : item.label_en || ""}
                    onChange={(e) => updateListItem<ImpactData>("impactGraph", i, lang === "fr" ? "label" : "label_en", e.target.value)}
                    placeholder={lang === "fr" ? "Label" : "Label (EN)"}
                    className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateListItem<ImpactData>("impactGraph", i, "value", Number(e.target.value))}
                    placeholder="90"
                    className="w-20 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <button onClick={() => removeListItem("impactGraph", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
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

          {/* Technologies */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {lang === "fr" ? "Technologies" : "Tech Stack"}
              </label>
              <button
                onClick={() => addArrayItem("tech")}
                className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(form.tech || [""]).map((tech, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={tech}
                    onChange={(e) =>
                      handleArrayChange("tech", i, e.target.value)
                    }
                    placeholder="React, Node..."
                    className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button
                    onClick={() => removeArrayItem("tech", i)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400">
                {lang === "fr" ? "Diagramme" : "Diagram"}
              </label>
              <button onClick={addDiagramNode} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.solutionDiagram?.nodes || []).map((node, i) => (
                <div key={node.id || i} className="space-y-1.5 rounded-lg border border-border/60 p-2">
                  <input
                    value={node.id}
                    onChange={(e) => updateDiagramNode(i, "id", e.target.value)}
                    placeholder="node-id"
                    className="w-full h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                  />
                  <div className="flex gap-1.5">
                    <input
                      value={lang === "fr" ? node.label : node.label_en || ""}
                      onChange={(e) => updateDiagramNode(i, lang === "fr" ? "label" : "label_en", e.target.value)}
                      placeholder={lang === "fr" ? "Label" : "Label (EN)"}
                      className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={node.type}
                      onChange={(e) => updateDiagramNode(i, "type", e.target.value)}
                      placeholder="service"
                      className="w-20 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                    />
                    <button onClick={() => removeDiagramNode(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 mb-2">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                {lang === "fr" ? "Connexions" : "Connections"}
              </span>
              <button onClick={addDiagramConnection} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.solutionDiagram?.connections || []).map((connection, i) => (
                <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      value={connection.from}
                      onChange={(e) => updateDiagramConnection(i, "from", e.target.value)}
                      placeholder="from"
                      className="h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={connection.to}
                      onChange={(e) => updateDiagramConnection(i, "to", e.target.value)}
                      placeholder="to"
                      className="h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={lang === "fr" ? connection.label || "" : connection.label_en || ""}
                      onChange={(e) => updateDiagramConnection(i, lang === "fr" ? "label" : "label_en", e.target.value)}
                      placeholder={lang === "fr" ? "Label optionnel" : "Optional label (EN)"}
                      className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] outline-none focus:border-zinc-400"
                    />
                    <button onClick={() => removeDiagramConnection(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">
              {lang === "fr" ? "Apercu carte" : "Card preview"}
            </label>
            <div className="bg-secondary/45 rounded-lg p-3 space-y-2">
              {form.image && (
                <img
                  src={form.image}
                  alt=""
                  className="w-full h-20 object-cover rounded-md"
                />
              )}
              <p className="text-[13px] font-bold text-foreground leading-tight">
                {form.title || "Titre du projet"}
              </p>
              <span className="inline-block px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-bold">
                {form.category}
              </span>
              {form.tech?.filter(Boolean).length ? (
                <div className="flex flex-wrap gap-1">
                  {form.tech
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
              {lang === "fr" ? "Sections du projet" : "Project sections"}
            </label>
            <div className="space-y-1 text-[10px] text-zinc-500">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                {lang === "fr"
                  ? "Titre, Categorie, Image"
                  : "Title, Category, Image"}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{" "}
                Description (Markdown)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{" "}
                {lang === "fr"
                  ? "Problematique (Markdown)"
                  : "Problem (Markdown)"}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
                {lang === "fr" ? "Solution (Markdown)" : "Solution (Markdown)"}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{" "}
                {lang === "fr" ? "Resultats & Metriques" : "Results & Metrics"}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />{" "}
                {lang === "fr" ? "Technologies" : "Tech Stack"}
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

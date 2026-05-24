import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject, useUpdateProject } from "@/hooks/queries";
import type { Project, ProjectFormData } from "@/types/admin.types";
import { LangToggle } from "@/components/admin/shared/LangToggle";

interface ProjectFormProps {
  initialData?: Project | null;
  onClose: () => void;
}

const categories = [
  "Fullstack",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Design",
];

const defaultFormData: ProjectFormData = {
  title: "",
  category: "Fullstack",
  image: "",
  description: "",
  problem: "",
  solution: "",
  results: [""],
  metrics: [{ name: "", value: 0, previousValue: 0, unit: "%" }],
  chartData: [],
  tech: [""],
  url: "",
};

export function ProjectForm({ initialData, onClose }: ProjectFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const [lang, setLang] = useState<"fr" | "en">("fr");

  const [formData, setFormData] = useState<ProjectFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        title_en: initialData.title_en || "",
        category: initialData.category,
        image: initialData.image || "",
        description: initialData.description || "",
        description_en: initialData.description_en || "",
        problem: initialData.problem || "",
        problem_en: initialData.problem_en || "",
        solution: initialData.solution || "",
        solution_en: initialData.solution_en || "",
        results: initialData.results?.length ? initialData.results : [""],
        metrics: initialData.metrics?.length
          ? initialData.metrics
          : [{ name: "", value: 0, previousValue: 0, unit: "%" }],
        chartData: initialData.chartData || [],
        tech: initialData.tech?.length ? initialData.tech : [""],
        url: initialData.url || "",
      };
    }
    return {
      ...defaultFormData,
      title_en: "",
      description_en: "",
      problem_en: "",
      solution_en: "",
    };
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (
    index: number,
    value: string,
    field: "results" | "tech",
  ) => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field: "results" | "tech") => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ""] });
  };

  const removeArrayItem = (index: number, field: "results" | "tech") => {
    setFormData({
      ...formData,
      [field]: (formData[field] || []).filter((_, i) => i !== index),
    });
  };

  const handleMetricChange = (
    index: number,
    key: string,
    value: string | number,
  ) => {
    const metrics = [...(formData.metrics || [])];
    metrics[index] = { ...metrics[index], [key]: value };
    setFormData({ ...formData, metrics });
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [
        ...(formData.metrics || []),
        { name: "", value: 0, previousValue: 0, unit: "%" },
      ],
    });
  };

  const removeMetric = (index: number) => {
    setFormData({
      ...formData,
      metrics: (formData.metrics || []).filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    const cleaned = {
      ...formData,
      results: formData.results?.filter((r) => r.trim()) || [],
      tech: formData.tech?.filter((t) => t.trim()) || [],
      metrics: formData.metrics?.filter((m) => m.name.trim()) || [],
    };
    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: cleaned },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(cleaned, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasEnContent = !!formData.title_en?.trim();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {isEditing ? "Modifier le Projet" : "Nouveau Projet"}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <LangToggle lang={lang} onChange={setLang} hasEnContent={hasEnContent} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lang === "fr" ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Titre (FR)
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Title (EN)
            </label>
            <Input
              name="title_en"
              value={formData.title_en || ""}
              onChange={handleChange}
              className="rounded-xl"
              placeholder="English title..."
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Categorie
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Image URL
          </label>
          <Input
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            URL du projet
          </label>
          <Input
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="rounded-xl"
            placeholder="https://..."
          />
        </div>

        {lang === "fr" ? (
          <>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Description (FR)
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Probleme (FR)
              </label>
              <Textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Solution (FR)
              </label>
              <Textarea
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Description (EN)
              </label>
              <Textarea
                name="description_en"
                value={formData.description_en || ""}
                onChange={handleChange}
                className="rounded-xl min-h-[80px]"
                placeholder="English description..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Problem (EN)
              </label>
              <Textarea
                name="problem_en"
                value={formData.problem_en || ""}
                onChange={handleChange}
                className="rounded-xl"
                placeholder="Problem statement in English..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Solution (EN)
              </label>
              <Textarea
                name="solution_en"
                value={formData.solution_en || ""}
                onChange={handleChange}
                className="rounded-xl"
                placeholder="Solution description in English..."
              />
            </div>
          </>
        )}
      </div>

      {/* Technologies */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Technologies
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem("tech")}
            className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(formData.tech || [""]).map((tech, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={tech}
                onChange={(e) => handleArrayChange(i, e.target.value, "tech")}
                className="rounded-xl"
                placeholder="React, Node.js..."
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeArrayItem(i, "tech")}
                className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Resultats
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem("results")}
            className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        {(formData.results || [""]).map((res, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={res}
              onChange={(e) => handleArrayChange(i, e.target.value, "results")}
              className="rounded-xl"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeArrayItem(i, "results")}
              className="text-destructive shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Metriques
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={addMetric}
            className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        {(formData.metrics || []).map((metric, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            <Input
              value={metric.name}
              onChange={(e) => handleMetricChange(i, "name", e.target.value)}
              placeholder="Nom"
              className="rounded-xl col-span-2"
            />
            <Input
              type="number"
              value={metric.value}
              onChange={(e) =>
                handleMetricChange(i, "value", Number(e.target.value))
              }
              placeholder="Valeur"
              className="rounded-xl"
            />
            <Input
              value={metric.unit}
              onChange={(e) => handleMetricChange(i, "unit", e.target.value)}
              placeholder="Unite"
              className="rounded-xl"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMetric(i)}
              className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="rounded-xl font-bold">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !formData.title.trim()}
          className="rounded-xl font-black px-8">
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEditing ? (
            "Mettre a jour"
          ) : (
            "Creer"
          )}
        </Button>
      </div>
    </div>
  );
}

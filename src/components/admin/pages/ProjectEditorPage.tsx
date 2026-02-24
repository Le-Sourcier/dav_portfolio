import { useState, useCallback } from 'react';
import {
  ArrowLeft, Loader2, CheckCircle2, Send,
  Plus, Trash2, Image, ExternalLink,
  BarChart3, Trophy, Cpu, FolderKanban,
} from 'lucide-react';
import { useCreateProject, useUpdateProject } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LangToggle } from '../shared/LangToggle';
import type { Project, ProjectFormData, ProjectMetric } from '@/types/admin.types';

// ======================== CONSTANTS ========================

const PROJECT_CATEGORIES = ['Fullstack', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Design', 'UI/UX', 'Web', 'Software'] as const;

// ======================== PROPS ========================

interface ProjectEditorPageProps {
  initialData?: Project | null;
  onBack: () => void;
}

// ======================== DEFAULTS ========================

const defaultForm: ProjectFormData = {
  title: '',
  category: 'Fullstack',
  image: '',
  description: '',
  problem: '',
  solution: '',
  results: [''],
  metrics: [{ name: '', value: 0, previousValue: 0, unit: '%' }],
  chartData: [],
  technologies: [''],
  url: '',
};

// ======================== COMPONENT ========================

export function ProjectEditorPage({ initialData, onBack }: ProjectEditorPageProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [form, setForm] = useState<ProjectFormData>(() => {
    if (!initialData) return { ...defaultForm, title_en: '', description_en: '', problem_en: '', solution_en: '' };
    return {
      title: initialData.title,
      title_en: initialData.title_en || '',
      category: initialData.category,
      image: initialData.image || '',
      description: initialData.description || '',
      description_en: initialData.description_en || '',
      problem: initialData.problem || '',
      problem_en: initialData.problem_en || '',
      solution: initialData.solution || '',
      solution_en: initialData.solution_en || '',
      results: initialData.results?.length ? initialData.results : [''],
      metrics: initialData.metrics?.length ? initialData.metrics : [{ name: '', value: 0, previousValue: 0, unit: '%' }],
      chartData: initialData.chartData || [],
      technologies: initialData.technologies?.length ? initialData.technologies : [''],
      url: initialData.url || '',
    };
  });

  // ======================== FIELD HELPERS ========================

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayChange = useCallback((field: 'results' | 'technologies', index: number, value: string) => {
    setForm(prev => {
      const arr = [...((prev as any)[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addArrayItem = useCallback((field: 'results' | 'technologies') => {
    setForm(prev => ({ ...prev, [field]: [...((prev as any)[field] || []), ''] }));
  }, []);

  const removeArrayItem = useCallback((field: 'results' | 'technologies', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: ((prev as any)[field] || []).filter((_: string, i: number) => i !== index),
    }));
  }, []);

  // Metrics
  const handleMetricChange = useCallback((index: number, key: keyof ProjectMetric, value: string | number) => {
    setForm(prev => {
      const metrics = [...(prev.metrics || [])];
      metrics[index] = { ...metrics[index], [key]: value };
      return { ...prev, metrics };
    });
  }, []);

  const addMetric = useCallback(() => {
    setForm(prev => ({
      ...prev,
      metrics: [...(prev.metrics || []), { name: '', value: 0, previousValue: 0, unit: '%' }],
    }));
  }, []);

  const removeMetric = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      metrics: (prev.metrics || []).filter((_, i) => i !== index),
    }));
  }, []);

  // ======================== SAVE ========================

  const handleSave = useCallback(() => {
    if (!form.title.trim()) { toast.error('Le titre est obligatoire'); return; }

    const cleaned: Record<string, unknown> = {
      title: form.title.trim(),
      title_en: form.title_en?.trim() || '',
      category: form.category,
      description: form.description?.trim() || '',
      description_en: form.description_en?.trim() || '',
      problem: form.problem?.trim() || '',
      problem_en: form.problem_en?.trim() || '',
      solution: form.solution?.trim() || '',
      solution_en: form.solution_en?.trim() || '',
    };

    if (form.image?.trim()) cleaned.image = form.image.trim();
    if (form.url?.trim()) cleaned.url = form.url.trim();

    const results = form.results?.filter(r => r.trim()) || [];
    if (results.length) cleaned.results = results;

    const technologies = form.technologies?.filter(t => t.trim()) || [];
    if (technologies.length) cleaned.technologies = technologies;

    const metrics = (form.metrics || []).filter(m => m.name.trim());
    if (metrics.length) cleaned.metrics = metrics;

    const options = {
      onSuccess: () => {
        setSaved(true);
        toast.success(isEditing ? 'Projet mis a jour' : 'Projet cree');
        setTimeout(() => setSaved(false), 2000);
        if (!isEditing) setTimeout(onBack, 500);
      },
    };

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: cleaned as Partial<ProjectFormData> }, options);
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
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {form.title || 'Remplissez les informations du projet'}
            </p>
          </div>
        </div>

        <LangToggle lang={lang} onChange={setLang} hasEnContent={!!(form.title_en?.trim())} />

        <button
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            'h-8 px-4 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60',
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
          )}
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
          {saved ? 'Enregistre' : isEditing ? 'Mettre a jour' : 'Creer'}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* ======================== LEFT COLUMN ======================== */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Title + Category */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                <FolderKanban className="w-3 h-3 inline mr-1" />
                {lang === 'fr' ? 'Titre du projet (FR) *' : 'Project Title (EN)'}
              </label>
              {lang === 'fr' ? (
                <input
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Ex: Dashboard Analytics SaaS"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                />
              ) : (
                <input
                  value={form.title_en || ''}
                  onChange={e => handleChange('title_en', e.target.value)}
                  placeholder="E.g.: Analytics SaaS Dashboard"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">{lang === 'fr' ? 'Categorie' : 'Category'}</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleChange('category', cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                        form.category === cat
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      )}
                    >{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  {lang === 'fr' ? 'URL du projet' : 'Project URL'}
                </label>
                <input
                  value={form.url}
                  onChange={e => handleChange('url', e.target.value)}
                  placeholder="https://monprojet.com"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
            {form.image ? (
              <div className="relative group">
                <img src={form.image} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => { const u = prompt('URL de l\'image :', form.image); if (u !== null) handleChange('image', u); }} className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-zinc-900">Changer</button>
                  <button onClick={() => handleChange('image', '')} className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white">Supprimer</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { const u = prompt('URL de l\'image :'); if (u) handleChange('image', u); }} className="w-full h-32 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Image className="w-6 h-6" />
                <span className="text-[12px] font-medium">{lang === 'fr' ? 'Ajouter une image' : 'Add cover image'}</span>
              </button>
            )}
          </div>

          {/* Description */}
          {lang === 'fr' ? (
            <MarkdownEditor
              label="Description du projet (FR)"
              value={form.description || ''}
              onChange={v => handleChange('description', v)}
              placeholder="Decrivez le projet, son contexte et ses objectifs..."
              minHeight="200px"
            />
          ) : (
            <MarkdownEditor
              label="Project Description (EN)"
              value={form.description_en || ''}
              onChange={v => handleChange('description_en', v)}
              placeholder="Describe the project, its context and objectives..."
              minHeight="200px"
            />
          )}

          {/* Problem */}
          {lang === 'fr' ? (
            <MarkdownEditor
              label="Problematique (FR)"
              value={form.problem || ''}
              onChange={v => handleChange('problem', v)}
              placeholder="Quel probleme ce projet resout-il ?"
              minHeight="150px"
            />
          ) : (
            <MarkdownEditor
              label="Problem Statement (EN)"
              value={form.problem_en || ''}
              onChange={v => handleChange('problem_en', v)}
              placeholder="What problem does this project solve?"
              minHeight="150px"
            />
          )}

          {/* Solution */}
          {lang === 'fr' ? (
            <MarkdownEditor
              label="Solution apportee (FR)"
              value={form.solution || ''}
              onChange={v => handleChange('solution', v)}
              placeholder="Comment avez-vous resolu le probleme ? Quelle approche technique ?"
              minHeight="150px"
            />
          ) : (
            <MarkdownEditor
              label="Solution (EN)"
              value={form.solution_en || ''}
              onChange={v => handleChange('solution_en', v)}
              placeholder="How did you solve the problem? What was the technical approach?"
              minHeight="150px"
            />
          )}

          {/* Results */}
          <DynamicListSection
            label={lang === 'fr' ? 'Resultats cles' : 'Key Results'}
            icon={<Trophy className="w-3 h-3" />}
            items={form.results || ['']}
            placeholder={lang === 'fr' ? 'Ex: +45% de performance, 10k utilisateurs...' : 'E.g.: +45% performance, 10k users...'}
            onAdd={() => addArrayItem('results')}
            onChange={(i, v) => handleArrayChange('results', i, v)}
            onRemove={i => removeArrayItem('results', i)}
          />

          {/* Metrics */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {lang === 'fr' ? 'Metriques' : 'Metrics'}
              </label>
              <button onClick={addMetric} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.metrics || []).map((metric, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input value={metric.name} onChange={e => handleMetricChange(i, 'name', e.target.value)} placeholder={lang === 'fr' ? 'Nom' : 'Name'} className="flex-1 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[12px] outline-none focus:border-zinc-400" />
                  <input type="number" value={metric.value} onChange={e => handleMetricChange(i, 'value', Number(e.target.value))} placeholder={lang === 'fr' ? 'Val' : 'Val'} className="w-16 h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center" />
                  <input value={metric.unit} onChange={e => handleMetricChange(i, 'unit', e.target.value)} placeholder="%" className="w-12 h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center" />
                  <button onClick={() => removeMetric(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================== RIGHT SIDEBAR ======================== */}
        <div className="xl:w-[280px] shrink-0 space-y-4">

          {/* Technologies */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {lang === 'fr' ? 'Technologies' : 'Tech Stack'}
              </label>
              <button onClick={() => addArrayItem('technologies')} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(form.technologies || ['']).map((tech, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={tech}
                    onChange={e => handleArrayChange('technologies', i, e.target.value)}
                    placeholder="React, Node..."
                    className="flex-1 h-7 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button onClick={() => removeArrayItem('technologies', i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">{lang === 'fr' ? 'Apercu carte' : 'Card preview'}</label>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 space-y-2">
              {form.image && <img src={form.image} alt="" className="w-full h-20 object-cover rounded-md" />}
              <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{form.title || 'Titre du projet'}</p>
              <span className="inline-block px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-bold">{form.category}</span>
              {form.technologies?.filter(Boolean).length ? (
                <div className="flex flex-wrap gap-1">
                  {form.technologies.filter(Boolean).slice(0, 4).map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-bold">{t}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Help */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">{lang === 'fr' ? 'Sections du projet' : 'Project sections'}</label>
            <div className="space-y-1 text-[10px] text-zinc-500">
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {lang === 'fr' ? 'Titre, Categorie, Image' : 'Title, Category, Image'}</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Description (Markdown)</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {lang === 'fr' ? 'Problematique (Markdown)' : 'Problem (Markdown)'}</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> {lang === 'fr' ? 'Solution (Markdown)' : 'Solution (Markdown)'}</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {lang === 'fr' ? 'Resultats & Metriques' : 'Results & Metrics'}</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {lang === 'fr' ? 'Technologies' : 'Tech Stack'}</p>
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

function DynamicListSection({ label, icon, items, placeholder, onAdd, onChange, onRemove }: DynamicListSectionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          {icon}
          {label}
        </label>
        <button onClick={onAdd} className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={item}
              onChange={e => onChange(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[12px] outline-none focus:border-zinc-400 transition-colors"
            />
            <button onClick={() => onRemove(i)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

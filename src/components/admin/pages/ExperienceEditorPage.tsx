import { useState, useCallback } from 'react';
import {
  ArrowLeft, Loader2, CheckCircle2, Send,
  Plus, Trash2, Image, Trophy, ExternalLink,
  Building2, MapPin, Calendar, Briefcase, Cpu,
  AlertCircle, ChevronRight, Layers, BarChart3,
} from 'lucide-react';
import { useCreateExperience, useUpdateExperience } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LangToggle } from '@/components/admin/shared/LangToggle';
import type {
  DiagramConnection,
  DiagramNode,
  Experience,
  ExperienceAchievement,
  ExperienceFormData,
  ExperienceLink,
  ImpactData,
} from '@/types/admin.types';

// ======================== PROPS ========================

interface ExperienceEditorPageProps {
  initialData?: Experience | null;
  onBack: () => void;
}

// ======================== DEFAULTS ========================

const defaultForm: ExperienceFormData = {
  title: '',
  company: '',
  location: '',
  dates: '',
  description: '',
  details: [''],
  coverImage: '',
  illustrativeImages: [''],
  stack: [''],
  challenges: [''],
  achievements: [{ title: '', description: '' }],
  links: [{ label: '', url: '' }],
  solutionDiagram: { nodes: [], connections: [] },
  impactGraph: [{ label: '', value: 0 }],
};

// ======================== COMPONENT ========================

export function ExperienceEditorPage({ initialData, onBack }: ExperienceEditorPageProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [form, setForm] = useState<ExperienceFormData>(() => {
    if (!initialData) return { ...defaultForm, title_en: '', description_en: '' };
    return {
      title: initialData.title,
      title_en: initialData.title_en || '',
      company: initialData.company,
      location: initialData.location || '',
      dates: initialData.dates,
      description: initialData.description || '',
      description_en: initialData.description_en || '',
      details: initialData.details?.length ? initialData.details : [''],
      coverImage: initialData.coverImage || '',
      illustrativeImages: initialData.illustrativeImages?.length ? initialData.illustrativeImages : [''],
      stack: initialData.stack?.length ? initialData.stack : [''],
      challenges: initialData.challenges?.length ? initialData.challenges : [''],
      achievements: initialData.achievements?.length ? initialData.achievements : [{ title: '', description: '' }],
      links: initialData.links?.length ? initialData.links : [{ label: '', url: '' }],
      solutionDiagram: initialData.solutionDiagram || { nodes: [], connections: [] },
      impactGraph: initialData.impactGraph?.length ? initialData.impactGraph : [{ label: '', value: 0 }],
    };
  });

  // ======================== FIELD HELPERS ========================

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayChange = useCallback((field: 'stack' | 'challenges' | 'details' | 'illustrativeImages', index: number, value: string) => {
    setForm(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addArrayItem = useCallback((field: 'stack' | 'challenges' | 'details' | 'illustrativeImages') => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  }, []);

  const removeArrayItem = useCallback((field: 'stack' | 'challenges' | 'details' | 'illustrativeImages', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  }, []);

  // Achievements
  const handleAchievementChange = useCallback((index: number, field: keyof ExperienceAchievement, value: string) => {
    setForm(prev => {
      const achievements = [...(prev.achievements || [])];
      achievements[index] = { ...achievements[index], [field]: value };
      return { ...prev, achievements };
    });
  }, []);

  const addAchievement = useCallback(() => {
    setForm(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), { title: '', description: '' }],
    }));
  }, []);

  const removeAchievement = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleImpactChange = useCallback((index: number, field: keyof ImpactData, value: string | number) => {
    setForm(prev => {
      const impactGraph = [...(prev.impactGraph || [])];
      impactGraph[index] = { ...impactGraph[index], [field]: value };
      return { ...prev, impactGraph };
    });
  }, []);

  const addImpact = useCallback(() => {
    setForm(prev => ({
      ...prev,
      impactGraph: [...(prev.impactGraph || []), { label: '', value: 0 }],
    }));
  }, []);

  const removeImpact = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      impactGraph: (prev.impactGraph || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleDiagramNodeChange = useCallback((index: number, field: keyof DiagramNode, value: string) => {
    setForm(prev => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      const nodes = [...(current.nodes || [])];
      nodes[index] = { ...nodes[index], [field]: value } as DiagramNode;
      return { ...prev, solutionDiagram: { ...current, nodes } };
    });
  }, []);

  const addDiagramNode = useCallback(() => {
    setForm(prev => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          nodes: [...(current.nodes || []), { id: '', label: '', type: 'service' }],
        },
      };
    });
  }, []);

  const removeDiagramNode = useCallback((index: number) => {
    setForm(prev => {
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

  const handleDiagramConnectionChange = useCallback((index: number, field: keyof DiagramConnection, value: string) => {
    setForm(prev => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      const connections = [...(current.connections || [])];
      connections[index] = { ...connections[index], [field]: value };
      return { ...prev, solutionDiagram: { ...current, connections } };
    });
  }, []);

  const addDiagramConnection = useCallback(() => {
    setForm(prev => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          connections: [...(current.connections || []), { from: '', to: '', label: '' }],
        },
      };
    });
  }, []);

  const removeDiagramConnection = useCallback((index: number) => {
    setForm(prev => {
      const current = prev.solutionDiagram || { nodes: [], connections: [] };
      return {
        ...prev,
        solutionDiagram: {
          ...current,
          connections: (current.connections || []).filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  // Links
  const handleLinkChange = useCallback((index: number, field: keyof ExperienceLink, value: string) => {
    setForm(prev => {
      const links = [...(prev.links || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, links };
    });
  }, []);

  const addLink = useCallback(() => {
    setForm(prev => ({
      ...prev,
      links: [...(prev.links || []), { label: '', url: '' }],
    }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index),
    }));
  }, []);

  // ======================== SAVE ========================

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      toast.error('Le poste est obligatoire');
      return;
    }
    if (!form.company.trim()) {
      toast.error('L\'entreprise est obligatoire');
      return;
    }
    if (!form.dates.trim()) {
      toast.error('La periode est obligatoire');
      return;
    }

    const cleaned: Record<string, unknown> = {
      title: form.title.trim(),
      company: form.company.trim(),
      dates: form.dates.trim(),
      description: form.description?.trim() || '',
    };

    cleaned.title_en = form.title_en?.trim() || '';
    cleaned.description_en = form.description_en?.trim() || '';

    if (form.location?.trim()) cleaned.location = form.location.trim();
    if (form.coverImage?.trim()) cleaned.coverImage = form.coverImage.trim();

    const details = form.details?.filter(d => d.trim()) || [];
    if (details.length) cleaned.details = details;

    const illustrativeImages = form.illustrativeImages?.filter(img => img.trim()) || [];
    if (illustrativeImages.length) cleaned.illustrativeImages = illustrativeImages;

    const stack = form.stack?.filter(s => s.trim()) || [];
    if (stack.length) cleaned.stack = stack;

    const challenges = form.challenges?.filter(c => c.trim()) || [];
    if (challenges.length) cleaned.challenges = challenges;

    const achievements = (form.achievements || []).filter(a => a.title.trim());
    if (achievements.length) cleaned.achievements = achievements;

    const links = (form.links || []).filter(l => l.label.trim() && l.url.trim());
    if (links.length) cleaned.links = links;

    const impactGraph = (form.impactGraph || []).filter(item => item.label.trim());
    if (impactGraph.length) cleaned.impactGraph = impactGraph;

    const diagramNodes = (form.solutionDiagram?.nodes || []).filter(node => node.id.trim() && node.label.trim());
    const diagramConnections = (form.solutionDiagram?.connections || []).filter(connection => connection.from.trim() && connection.to.trim());
    if (diagramNodes.length || diagramConnections.length) {
      cleaned.solutionDiagram = {
        nodes: diagramNodes,
        connections: diagramConnections,
      };
    }

    const options = {
      onSuccess: () => {
        setSaved(true);
        toast.success(isEditing ? 'Experience mise a jour' : 'Experience creee');
        setTimeout(() => setSaved(false), 2000);
        if (!isEditing) setTimeout(onBack, 500);
      },
    };

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: cleaned as Partial<ExperienceFormData> }, options);
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
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Modifier l\'experience' : 'Nouvelle experience'}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {form.company ? `${form.title || 'Poste'} - ${form.company}` : 'Remplissez les informations'}
            </p>
          </div>
        </div>

        <LangToggle lang={lang} onChange={setLang} hasEnContent={!!(form.title_en?.trim())} />

        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* ======================== LEFT COLUMN ======================== */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Title + Company */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                <Briefcase className="w-3 h-3 inline mr-1" />
                {lang === 'fr' ? 'Poste / Titre du role (FR) *' : 'Job Title / Role (EN)'}
              </label>
              {lang === 'fr' ? (
                <input
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Ex: Developpeur Fullstack Senior"
                  className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
                />
              ) : (
                <input
                  value={form.title_en || ''}
                  onChange={e => handleChange('title_en', e.target.value)}
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
                  onChange={e => handleChange('company', e.target.value)}
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
                  onChange={e => handleChange('dates', e.target.value)}
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
                  onChange={e => handleChange('location', e.target.value)}
                  placeholder="Paris, Remote..."
                  className="w-full h-9 px-3 rounded-lg border border-border/70 bg-transparent text-sm outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-card/60 rounded-xl border border-border/70 overflow-hidden">
            {form.coverImage ? (
              <div className="relative group">
                <img src={form.coverImage} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const url = prompt('URL de l\'image de couverture :', form.coverImage);
                      if (url !== null) handleChange('coverImage', url);
                    }}
                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-zinc-900"
                  >Changer</button>
                  <button
                    onClick={() => handleChange('coverImage', '')}
                    className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white"
                  >Supprimer</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  const url = prompt('URL de l\'image de couverture :');
                  if (url) handleChange('coverImage', url);
                }}
                className="w-full h-32 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-500 hover:bg-accent/60 transition-colors"
              >
                <Image className="w-6 h-6" />
                <span className="text-[12px] font-medium">Ajouter une image de couverture</span>
              </button>
            )}
          </div>

          <DynamicListSection
            label="Images illustratives"
            icon={<Image className="w-3 h-3" />}
            items={form.illustrativeImages || ['']}
            placeholder="URL d'une image supplementaire..."
            onAdd={() => addArrayItem('illustrativeImages')}
            onChange={(i, v) => handleArrayChange('illustrativeImages', i, v)}
            onRemove={i => removeArrayItem('illustrativeImages', i)}
          />

          {/* Description (Markdown Editor) */}
          {lang === 'fr' ? (
            <MarkdownEditor
              label="Description / Contexte (FR)"
              value={form.description || ''}
              onChange={v => handleChange('description', v)}
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
              value={form.description_en || ''}
              onChange={v => handleChange('description_en', v)}
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
            label="Details / Responsabilites"
            icon={<ChevronRight className="w-3 h-3" />}
            items={form.details || ['']}
            placeholder="Responsabilite ou detail cle..."
            onAdd={() => addArrayItem('details')}
            onChange={(i, v) => handleArrayChange('details', i, v)}
            onRemove={i => removeArrayItem('details', i)}
          />

          {/* Challenges */}
          <DynamicListSection
            label="Defis & Problematiques"
            icon={<AlertCircle className="w-3 h-3" />}
            items={form.challenges || ['']}
            placeholder="Un defi rencontre..."
            onAdd={() => addArrayItem('challenges')}
            onChange={(i, v) => handleArrayChange('challenges', i, v)}
            onRemove={i => removeArrayItem('challenges', i)}
          />

          {/* Achievements */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Realisations
              </label>
              <button onClick={addAchievement} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {(form.achievements || []).map((ach, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={ach.title}
                      onChange={e => handleAchievementChange(i, 'title', e.target.value)}
                      placeholder="Titre de la realisation"
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] font-semibold outline-none focus:border-zinc-400"
                    />
                    <input
                      value={ach.description}
                      onChange={e => handleAchievementChange(i, 'description', e.target.value)}
                      placeholder="Description..."
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={ach.icon || ''}
                      onChange={e => handleAchievementChange(i, 'icon', e.target.value)}
                      placeholder="Icone optionnelle"
                      className="h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 sm:col-span-2"
                    />
                  </div>
                  <button onClick={() => removeAchievement(i)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
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
              <button onClick={addImpact} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.impactGraph || []).map((item, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={item.label}
                    onChange={e => handleImpactChange(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={e => handleImpactChange(i, 'value', Number(e.target.value))}
                    placeholder="0"
                    className="w-20 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 text-center"
                  />
                  <button onClick={() => removeImpact(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Noeuds</span>
                <button onClick={addDiagramNode} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {(form.solutionDiagram?.nodes || []).map((node, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      value={node.id}
                      onChange={e => handleDiagramNodeChange(i, 'id', e.target.value)}
                      placeholder="id"
                      className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                    />
                    <input
                      value={node.label}
                      onChange={e => handleDiagramNodeChange(i, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={node.type}
                      onChange={e => handleDiagramNodeChange(i, 'type', e.target.value)}
                      placeholder="service"
                      className="w-28 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <button onClick={() => removeDiagramNode(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Connexions</span>
                <button onClick={addDiagramConnection} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {(form.solutionDiagram?.connections || []).map((connection, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input
                      value={connection.from}
                      onChange={e => handleDiagramConnectionChange(i, 'from', e.target.value)}
                      placeholder="from"
                      className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                    />
                    <input
                      value={connection.to}
                      onChange={e => handleDiagramConnectionChange(i, 'to', e.target.value)}
                      placeholder="to"
                      className="w-24 h-8 px-2 rounded-lg border border-border/70 bg-transparent text-[12px] font-mono outline-none focus:border-zinc-400"
                    />
                    <input
                      value={connection.label || ''}
                      onChange={e => handleDiagramConnectionChange(i, 'label', e.target.value)}
                      placeholder="Label optionnel"
                      className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <button onClick={() => removeDiagramConnection(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================== RIGHT SIDEBAR ======================== */}
        <div className="xl:w-[280px] shrink-0 space-y-4">

          {/* Stack */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Stack Technique
              </label>
              <button onClick={() => addArrayItem('stack')} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(form.stack || ['']).map((tech, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={tech}
                    onChange={e => handleArrayChange('stack', i, e.target.value)}
                    placeholder="React, Node..."
                    className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button onClick={() => removeArrayItem('stack', i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
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
              <button onClick={addLink} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(form.links || []).map((link, i) => (
                <div key={i} className="flex gap-1.5">
                  <div className="flex-1 space-y-1">
                    <input
                      value={link.label}
                      onChange={e => handleLinkChange(i, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-full h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                    />
                    <input
                      value={link.url}
                      onChange={e => handleLinkChange(i, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full h-7 px-2 rounded-md border border-border/70 bg-transparent text-[11px] font-mono outline-none focus:border-zinc-400"
                    />
                  </div>
                  <button onClick={() => removeLink(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0 self-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">Apercu carte</label>
            <div className="bg-secondary/45 rounded-lg p-3 space-y-2">
              {form.coverImage && (
                <img src={form.coverImage} alt="" className="w-full h-20 object-cover rounded-md" />
              )}
              <p className="text-[13px] font-bold text-foreground leading-tight">
                {form.title || 'Poste'}
              </p>
              <p className="text-[11px] text-zinc-500">{form.company || 'Entreprise'} - {form.dates || 'Periode'}</p>
              {form.stack?.filter(Boolean).length ? (
                <div className="flex flex-wrap gap-1">
                  {form.stack.filter(Boolean).slice(0, 4).map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-bold">{t}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Help */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">Champs affiches</label>
            <div className="space-y-1 text-[10px] text-zinc-500">
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Titre, Entreprise, Dates</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Image de couverture</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Description, Details</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Stack technique</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Defis & Realisations</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Liens utiles</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Images, graph & diagramme</p>
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
    <div className="bg-card/60 rounded-xl border border-border/70 p-4">
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
              className="flex-1 h-8 px-3 rounded-lg border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400 transition-colors"
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

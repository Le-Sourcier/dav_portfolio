import { useState, useCallback } from 'react';
import {
  ArrowLeft, Save, Loader2, CheckCircle2, Send,
  Plus, Trash2, Image, Trophy, ExternalLink,
  Building2, MapPin, Calendar, Briefcase, Cpu,
  AlertCircle, ChevronRight, Layers,
} from 'lucide-react';
import { useCreateExperience, useUpdateExperience } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LangToggle } from '@/components/admin/shared/LangToggle';
import type { Experience, ExperienceFormData, ExperienceAchievement, ExperienceLink } from '@/types/admin.types';

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
  stack: [''],
  challenges: [''],
  achievements: [{ title: '', description: '' }],
  links: [{ label: '', url: '' }],
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
      illustrativeImages: initialData.illustrativeImages || [],
      stack: initialData.stack?.length ? initialData.stack : [''],
      challenges: initialData.challenges?.length ? initialData.challenges : [''],
      achievements: initialData.achievements?.length ? initialData.achievements : [{ title: '', description: '' }],
      links: initialData.links?.length ? initialData.links : [{ label: '', url: '' }],
    };
  });

  // ======================== FIELD HELPERS ========================

  const handleChange = useCallback((field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleArrayChange = useCallback((field: 'stack' | 'challenges' | 'details', index: number, value: string) => {
    setForm(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addArrayItem = useCallback((field: 'stack' | 'challenges' | 'details') => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  }, []);

  const removeArrayItem = useCallback((field: 'stack' | 'challenges' | 'details', index: number) => {
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

    const stack = form.stack?.filter(s => s.trim()) || [];
    if (stack.length) cleaned.stack = stack;

    const challenges = form.challenges?.filter(c => c.trim()) || [];
    if (challenges.length) cleaned.challenges = challenges;

    const achievements = (form.achievements || []).filter(a => a.title.trim());
    if (achievements.length) cleaned.achievements = achievements;

    const links = (form.links || []).filter(l => l.label.trim() && l.url.trim());
    if (links.length) cleaned.links = links;

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
          <div className="bg-card/85 rounded-xl border border-border/70 p-4 space-y-3">
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
          <div className="bg-card/85 rounded-xl border border-border/70 overflow-hidden">
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
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
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
                  </div>
                  <button onClick={() => removeAchievement(i)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================== RIGHT SIDEBAR ======================== */}
        <div className="xl:w-[280px] shrink-0 space-y-4">

          {/* Stack */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
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
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
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
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">Apercu carte</label>
            <div className="bg-secondary/60 rounded-lg p-3 space-y-2">
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
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">Champs affiches</label>
            <div className="space-y-1 text-[10px] text-zinc-500">
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Titre, Entreprise, Dates</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Image de couverture</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Description, Details</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Stack technique</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Defis & Realisations</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Liens utiles</p>
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
    <div className="bg-card/85 rounded-xl border border-border/70 p-4">
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

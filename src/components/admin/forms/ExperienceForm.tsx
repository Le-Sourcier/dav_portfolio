import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateExperience, useUpdateExperience } from '@/hooks/queries';
import type { Experience, ExperienceFormData } from '@/types/admin.types';
import { LangToggle } from '@/components/admin/shared/LangToggle';

interface ExperienceFormProps {
  initialData?: Experience | null;
  onClose: () => void;
}

const defaultFormData: ExperienceFormData = {
  title: '',
  company: '',
  location: '',
  dates: '',
  description: '',
  stack: [''],
  challenges: [''],
  achievements: [],
};

export function ExperienceForm({ initialData, onClose }: ExperienceFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState<ExperienceFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        title_en: initialData.title_en || '',
        company: initialData.company,
        location: initialData.location || '',
        dates: initialData.dates,
        description: initialData.description || '',
        description_en: initialData.description_en || '',
        stack: initialData.stack?.length ? initialData.stack : [''],
        challenges: initialData.challenges?.length ? initialData.challenges : [''],
        achievements: initialData.achievements || [],
      };
    }
    return { ...defaultFormData, title_en: '', description_en: '' };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index: number, value: string, field: 'stack' | 'challenges') => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field: 'stack' | 'challenges') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const removeArrayItem = (index: number, field: 'stack' | 'challenges') => {
    setFormData({ ...formData, [field]: (formData[field] || []).filter((_, i) => i !== index) });
  };

  const handleSubmit = () => {
    const cleaned = {
      ...formData,
      stack: formData.stack?.filter((s) => s.trim()) || [],
      challenges: formData.challenges?.filter((c) => c.trim()) || [],
    };
    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: cleaned }, { onSuccess: onClose });
    } else {
      createMutation.mutate(cleaned, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasEnContent = !!(formData.title_en?.trim());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {isEditing ? "Modifier l'Experience" : 'Nouvelle Experience'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <LangToggle lang={lang} onChange={setLang} hasEnContent={hasEnContent} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lang === 'fr' ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Poste (FR)</label>
            <Input name="title" value={formData.title} onChange={handleChange} className="rounded-xl" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Job Title (EN)</label>
            <Input name="title_en" value={formData.title_en || ''} onChange={handleChange} className="rounded-xl" placeholder="English job title..." />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entreprise</label>
          <Input name="company" value={formData.company} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Periode</label>
          <Input name="dates" value={formData.dates} onChange={handleChange} className="rounded-xl" placeholder="Jan 2023 - Present" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Lieu</label>
          <Input name="location" value={formData.location} onChange={handleChange} className="rounded-xl" />
        </div>

        {lang === 'fr' ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description (FR)</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} className="rounded-xl min-h-[80px]" />
          </div>
        ) : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description (EN)</label>
            <Textarea name="description_en" value={formData.description_en || ''} onChange={handleChange} className="rounded-xl min-h-[80px]" placeholder="Role description in English..." />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stack */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stack Technique</label>
            <Button variant="outline" size="sm" onClick={() => addArrayItem('stack')} className="rounded-lg h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
            </Button>
          </div>
          {(formData.stack || ['']).map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => handleArrayChange(i, e.target.value, 'stack')} className="rounded-xl" />
              <Button variant="ghost" size="icon" onClick={() => removeArrayItem(i, 'stack')} className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Defis</label>
            <Button variant="outline" size="sm" onClick={() => addArrayItem('challenges')} className="rounded-lg h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
            </Button>
          </div>
          {(formData.challenges || ['']).map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => handleArrayChange(i, e.target.value, 'challenges')} className="rounded-xl" />
              <Button variant="ghost" size="icon" onClick={() => removeArrayItem(i, 'challenges')} className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Annuler</Button>
        <Button onClick={handleSubmit} disabled={isPending || !formData.title.trim() || !formData.company.trim()} className="rounded-xl font-black px-8">
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            isEditing ? 'Mettre a jour' : 'Creer'
          )}
        </Button>
      </div>
    </div>
  );
}

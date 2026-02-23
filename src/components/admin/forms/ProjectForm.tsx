import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject, useUpdateProject } from '@/hooks/queries';
import type { Project, ProjectFormData } from '@/types/admin.types';

interface ProjectFormProps {
  initialData?: Project | null;
  onClose: () => void;
}

const categories = ['Fullstack', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Design'];

const defaultFormData: ProjectFormData = {
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

export function ProjectForm({ initialData, onClose }: ProjectFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [formData, setFormData] = useState<ProjectFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        category: initialData.category,
        image: initialData.image || '',
        description: initialData.description || '',
        problem: initialData.problem || '',
        solution: initialData.solution || '',
        results: initialData.results?.length ? initialData.results : [''],
        metrics: initialData.metrics?.length
          ? initialData.metrics
          : [{ name: '', value: 0, previousValue: 0, unit: '%' }],
        chartData: initialData.chartData || [],
        technologies: initialData.technologies?.length ? initialData.technologies : [''],
        url: initialData.url || '',
      };
    }
    return { ...defaultFormData };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index: number, value: string, field: 'results' | 'technologies') => {
    const arr = [...(formData[field] || [])];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field: 'results' | 'technologies') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const removeArrayItem = (index: number, field: 'results' | 'technologies') => {
    setFormData({
      ...formData,
      [field]: (formData[field] || []).filter((_, i) => i !== index),
    });
  };

  const handleMetricChange = (index: number, key: string, value: string | number) => {
    const metrics = [...(formData.metrics || [])];
    metrics[index] = { ...metrics[index], [key]: value };
    setFormData({ ...formData, metrics });
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...(formData.metrics || []), { name: '', value: 0, previousValue: 0, unit: '%' }],
    });
  };

  const removeMetric = (index: number) => {
    setFormData({
      ...formData,
      metrics: (formData.metrics || []).filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    // Clean empty items
    const cleaned = {
      ...formData,
      results: formData.results?.filter((r) => r.trim()) || [],
      technologies: formData.technologies?.filter((t) => t.trim()) || [],
      metrics: formData.metrics?.filter((m) => m.name.trim()) || [],
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: cleaned },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(cleaned, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {isEditing ? 'Modifier le Projet' : 'Nouveau Projet'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Titre</label>
          <Input name="title" value={formData.title} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Categorie</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Image URL</label>
          <Input name="image" value={formData.image} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">URL du projet</label>
          <Input name="url" value={formData.url} onChange={handleChange} className="rounded-xl" placeholder="https://..." />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</label>
          <Textarea name="description" value={formData.description} onChange={handleChange} className="rounded-xl min-h-[80px]" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Probleme</label>
          <Textarea name="problem" value={formData.problem} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Solution</label>
          <Textarea name="solution" value={formData.solution} onChange={handleChange} className="rounded-xl" />
        </div>
      </div>

      {/* Technologies */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Technologies</label>
          <Button variant="outline" size="sm" onClick={() => addArrayItem('technologies')} className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(formData.technologies || ['']).map((tech, i) => (
            <div key={i} className="flex gap-2">
              <Input value={tech} onChange={(e) => handleArrayChange(i, e.target.value, 'technologies')} className="rounded-xl" placeholder="React, Node.js..." />
              <Button variant="ghost" size="icon" onClick={() => removeArrayItem(i, 'technologies')} className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resultats</label>
          <Button variant="outline" size="sm" onClick={() => addArrayItem('results')} className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        {(formData.results || ['']).map((res, i) => (
          <div key={i} className="flex gap-2">
            <Input value={res} onChange={(e) => handleArrayChange(i, e.target.value, 'results')} className="rounded-xl" />
            <Button variant="ghost" size="icon" onClick={() => removeArrayItem(i, 'results')} className="text-destructive shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Metriques</label>
          <Button variant="outline" size="sm" onClick={addMetric} className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        {(formData.metrics || []).map((metric, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            <Input value={metric.name} onChange={(e) => handleMetricChange(i, 'name', e.target.value)} placeholder="Nom" className="rounded-xl col-span-2" />
            <Input type="number" value={metric.value} onChange={(e) => handleMetricChange(i, 'value', Number(e.target.value))} placeholder="Valeur" className="rounded-xl" />
            <Input value={metric.unit} onChange={(e) => handleMetricChange(i, 'unit', e.target.value)} placeholder="Unite" className="rounded-xl" />
            <Button variant="ghost" size="icon" onClick={() => removeMetric(i)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !formData.title.trim()} className="rounded-xl font-black px-8">
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

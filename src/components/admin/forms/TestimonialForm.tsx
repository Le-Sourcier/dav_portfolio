import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTestimonial, useUpdateTestimonial } from '@/hooks/queries';
import type { Testimonial, TestimonialFormData } from '@/types/admin.types';
import { LangToggle } from '@/components/admin/shared/LangToggle';

interface TestimonialFormProps {
  initialData?: Testimonial | null;
  onClose: () => void;
}

const defaultFormData: TestimonialFormData = {
  name: '',
  role: '',
  company: '',
  content: '',
  avatar: '',
  rating: 5,
};

export function TestimonialForm({ initialData, onClose }: TestimonialFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState<TestimonialFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        role: initialData.role,
        role_en: initialData.role_en || '',
        company: initialData.company || '',
        content: initialData.content,
        content_en: initialData.content_en || '',
        avatar: initialData.avatar || '',
        rating: initialData.rating || 5,
      };
    }
    return { ...defaultFormData, role_en: '', content_en: '' };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'number' ? Number(value) : value });
  };

  const handleSubmit = () => {
    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: formData }, { onSuccess: onClose });
    } else {
      createMutation.mutate(formData, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasEnContent = !!(formData.content_en?.trim());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black uppercase tracking-tight">
          {isEditing ? 'Modifier le Temoignage' : 'Nouveau Temoignage'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <LangToggle lang={lang} onChange={setLang} hasEnContent={hasEnContent} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Nom</label>
          <Input name="name" value={formData.name} onChange={handleChange} className="rounded-xl" />
        </div>

        {lang === 'fr' ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Poste / Role (FR)</label>
            <Input name="role" value={formData.role} onChange={handleChange} className="rounded-xl" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Role (EN)</label>
            <Input name="role_en" value={formData.role_en || ''} onChange={handleChange} className="rounded-xl" placeholder="English role..." />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entreprise</label>
          <Input name="company" value={formData.company} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Avatar URL</label>
          <Input name="avatar" value={formData.avatar} onChange={handleChange} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Note (1-5)</label>
          <Input name="rating" type="number" min={1} max={5} value={formData.rating} onChange={handleChange} className="rounded-xl" />
        </div>

        {lang === 'fr' ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Temoignage (FR)</label>
            <Textarea name="content" value={formData.content} onChange={handleChange} className="rounded-xl min-h-[120px]" placeholder="Ce que le client a dit..." />
          </div>
        ) : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Testimonial (EN)</label>
            <Textarea name="content_en" value={formData.content_en || ''} onChange={handleChange} className="rounded-xl min-h-[120px]" placeholder="What the client said in English..." />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Annuler</Button>
        <Button onClick={handleSubmit} disabled={isPending || !formData.name.trim() || !formData.content.trim()} className="rounded-xl font-black px-8">
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

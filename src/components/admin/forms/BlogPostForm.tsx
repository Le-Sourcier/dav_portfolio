import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/queries";
import type { BlogPost, BlogPostFormData } from "@/types/admin.types";
import { LangToggle } from "@/components/admin/shared/LangToggle";

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onClose: () => void;
}

const blogCategories = [
  "Tech",
  "Design",
  "Business",
  "Tutoriel",
  "Actualite",
  "Retour d'experience",
];

const defaultFormData: BlogPostFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "Tech",
  imageUrl: "",
  author: "",
  tags: [""],
  published: false,
};

export function BlogPostForm({ initialData, onClose }: BlogPostFormProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState<BlogPostFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        title_en: initialData.title_en || "",
        excerpt: initialData.excerpt,
        excerpt_en: initialData.excerpt_en || "",
        content: initialData.content,
        content_en: initialData.content_en || "",
        category: initialData.category,
        imageUrl: initialData.imageUrl || "",
        author: initialData.author || "",
        tags: initialData.tags?.length ? initialData.tags : [""],
        published: initialData.published,
      };
    }
    return { ...defaultFormData, title_en: "", excerpt_en: "", content_en: "" };
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagChange = (index: number, value: string) => {
    const tags = [...(formData.tags || [])];
    tags[index] = value;
    setFormData({ ...formData, tags });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...(formData.tags || []), ""] });
  };

  const removeTag = (index: number) => {
    setFormData({ ...formData, tags: (formData.tags || []).filter((_, i) => i !== index) });
  };

  const handleSubmit = () => {
    const cleaned = {
      ...formData,
      tags: formData.tags?.filter((t) => t.trim()) || [],
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
          {isEditing ? "Modifier l'Article" : "Nouvel Article"}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <LangToggle lang={lang} onChange={setLang} hasEnContent={hasEnContent} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lang === 'fr' ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Titre (FR)</label>
            <Input name="title" value={formData.title} onChange={handleChange} className="rounded-xl text-lg font-bold" />
          </div>
        ) : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Title (EN)</label>
            <Input name="title_en" value={formData.title_en || ""} onChange={handleChange} className="rounded-xl text-lg font-bold" placeholder="English title..." />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Categorie</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
            {blogCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Image URL</label>
          <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="rounded-xl" />
        </div>

        {lang === 'fr' ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Extrait (FR)</label>
            <Textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="rounded-xl" placeholder="Resume court de l'article..." />
          </div>
        ) : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Excerpt (EN)</label>
            <Textarea name="excerpt_en" value={formData.excerpt_en || ""} onChange={handleChange} className="rounded-xl" placeholder="Short article summary in English..." />
          </div>
        )}

        {lang === 'fr' ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contenu Markdown (FR)</label>
            <Textarea name="content" value={formData.content} onChange={handleChange} className="rounded-xl min-h-[250px] font-mono text-sm" />
          </div>
        ) : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Content Markdown (EN)</label>
            <Textarea name="content_en" value={formData.content_en || ""} onChange={handleChange} className="rounded-xl min-h-[250px] font-mono text-sm" placeholder="Article content in English (Markdown)..." />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tags</label>
          <Button variant="outline" size="sm" onClick={addTag} className="rounded-lg h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(formData.tags || [""]).map((tag, i) => (
            <div key={i} className="flex gap-2">
              <Input value={tag} onChange={(e) => handleTagChange(i, e.target.value)} className="rounded-xl" placeholder="Tag..." />
              <Button variant="ghost" size="icon" onClick={() => removeTag(i)} className="text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="w-5 h-5 rounded border-input accent-primary" />
        <span className="text-sm font-bold">Publier immediatement</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Annuler</Button>
        <Button onClick={handleSubmit} disabled={isPending || !formData.title.trim()} className="rounded-xl font-black px-8">
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEditing ? "Mettre a jour" : formData.published ? "Publier" : "Sauvegarder brouillon"}
        </Button>
      </div>
    </div>
  );
}

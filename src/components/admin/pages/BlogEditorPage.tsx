import { useState } from 'react';
import {
  ArrowLeft, Save, Loader2, CheckCircle2,
  Image, Plus, Trash2, Send, Mail,
} from 'lucide-react';
import { useCreateBlogPost, useUpdateBlogPost, useSendArticleToSubscribers } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LangToggle } from '@/components/admin/shared/LangToggle';
import type { BlogPost, BlogPostFormData } from '@/types/admin.types';

// ======================== BLOG CATEGORIES ========================
const blogCategories = ['Tech', 'Design', 'Business', 'Tutoriel', 'Actualite', 'Retour d\'experience'];

// ======================== MAIN COMPONENT ========================

interface BlogEditorPageProps {
  initialData?: BlogPost | null;
  onBack: () => void;
}

export function BlogEditorPage({ initialData, onBack }: BlogEditorPageProps) {
  const isEditing = !!initialData;
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const sendNewsletterMutation = useSendArticleToSubscribers();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const [formData, setFormData] = useState<BlogPostFormData>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        title_en: initialData.title_en || '',
        excerpt: initialData.excerpt,
        excerpt_en: initialData.excerpt_en || '',
        content: initialData.content,
        content_en: initialData.content_en || '',
        category: initialData.category,
        imageUrl: initialData.imageUrl || '',
        author: initialData.author || '',
        tags: initialData.tags?.length ? initialData.tags : [''],
        published: initialData.published,
      };
    }
    return {
      title: '',
      title_en: '',
      excerpt: '',
      excerpt_en: '',
      content: '',
      content_en: '',
      category: 'Tech',
      imageUrl: '',
      author: '',
      tags: [''],
      published: false,
    };
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (index: number, value: string) => {
    const tags = [...(formData.tags || [])];
    tags[index] = value;
    setFormData((prev) => ({ ...prev, tags }));
  };

  const addTag = () => setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), ''] }));
  const removeTag = (i: number) => setFormData((prev) => ({ ...prev, tags: (prev.tags || []).filter((_, idx) => idx !== i) }));

  const handleSave = (publish: boolean) => {
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (publish && !formData.content.trim()) {
      toast.error('Ajoutez du contenu avant de publier');
      return;
    }

    const cleaned: BlogPostFormData = {
      title: formData.title.trim(),
      title_en: formData.title_en?.trim() || '',
      excerpt: formData.excerpt?.trim() || '',
      excerpt_en: formData.excerpt_en?.trim() || '',
      content: formData.content,
      content_en: formData.content_en || '',
      category: formData.category,
      imageUrl: formData.imageUrl?.trim() || '',
      author: formData.author || '',
      published: publish ? true : formData.published,
      tags: formData.tags?.filter((t) => t.trim()) || [],
    };

    const options = {
      onSuccess: () => {
        setSaved(true);
        toast.success(publish ? 'Article publie !' : 'Article enregistre');
        setTimeout(() => setSaved(false), 2000);
        if (!isEditing) setTimeout(onBack, 500);
      },
    };

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data: cleaned }, options);
    } else {
      createMutation.mutate(cleaned, options);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {wordCount} mots - ~{readTime} min de lecture
            </p>
          </div>
        </div>

        <LangToggle lang={lang} onChange={setLang} hasEnContent={!!(formData.title_en?.trim())} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isPending}
            className={cn(
              'h-8 px-4 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60',
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Enregistre' : 'Brouillon'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="h-8 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            Publier
          </button>

          {/* Notify subscribers - only for published articles being edited */}
          {isEditing && initialData?.published && initialData?.slug && (
            <button
              onClick={() => {
                sendNewsletterMutation.mutate({
                  title: formData.title,
                  excerpt: formData.excerpt || formData.content.slice(0, 150),
                  slug: initialData.slug,
                  imageUrl: formData.imageUrl || undefined,
                  category: formData.category,
                  readTime: `${readTime} min`,
                });
              }}
              disabled={sendNewsletterMutation.isPending}
              className="h-8 px-3 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-60"
            >
              {sendNewsletterMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              Notifier
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left: Editor */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">
              {lang === 'fr' ? "Titre de l'article (FR)" : 'Article Title (EN)'}
            </label>
            {lang === 'fr' ? (
              <input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Comment deployer une app React en production"
                className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
              />
            ) : (
              <input
                value={formData.title_en || ''}
                onChange={(e) => handleChange('title_en', e.target.value)}
                placeholder="E.g.: How to deploy a React app in production"
                className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-foreground"
              />
            )}
          </div>

          {/* Cover image */}
          <div className="bg-card/85 rounded-xl border border-border/70 overflow-hidden">
            {formData.imageUrl ? (
              <div className="relative group">
                <img src={formData.imageUrl} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const url = prompt('URL de l\'image de couverture :', formData.imageUrl);
                      if (url !== null) handleChange('imageUrl', url);
                    }}
                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-zinc-900"
                  >
                    Changer
                  </button>
                  <button
                    onClick={() => handleChange('imageUrl', '')}
                    className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  const url = prompt('URL de l\'image de couverture :');
                  if (url) handleChange('imageUrl', url);
                }}
                className="w-full h-32 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-500 hover:bg-accent/60 transition-colors"
              >
                <Image className="w-6 h-6" />
                <span className="text-[12px] font-medium">Ajouter une image de couverture</span>
              </button>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">
              {lang === 'fr' ? 'Extrait / Resume (FR)' : 'Excerpt / Summary (EN)'}
            </label>
            {lang === 'fr' ? (
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Un court resume qui apparaitra dans la liste des articles..."
                rows={2}
                className="w-full bg-transparent text-sm text-zinc-700 dark:text-zinc-300 resize-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
            ) : (
              <textarea
                value={formData.excerpt_en || ''}
                onChange={(e) => handleChange('excerpt_en', e.target.value)}
                placeholder="A short summary that will appear in the article list..."
                rows={2}
                className="w-full bg-transparent text-sm text-zinc-700 dark:text-zinc-300 resize-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
            )}
          </div>

          {/* Content editor */}
          {lang === 'fr' ? (
            <MarkdownEditor
              label="Contenu de l'article (FR)"
              value={formData.content}
              onChange={(v) => handleChange('content', v)}
              placeholder="Ecrivez votre article en Markdown..."
              minHeight="400px"
            />
          ) : (
            <MarkdownEditor
              label="Article Content (EN)"
              value={formData.content_en || ''}
              onChange={(v) => handleChange('content_en', v)}
              placeholder="Write your article in English (Markdown)..."
              minHeight="400px"
            />
          )}
        </div>

        {/* Right: Metadata sidebar */}
        <div className="xl:w-[280px] shrink-0 space-y-4">
          {/* Category */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">Categorie</label>
            <div className="flex flex-wrap gap-1.5">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleChange('category', cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                    formData.category === cat
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-zinc-400">Tags</label>
              <button onClick={addTag} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {(formData.tags || ['']).map((tag, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={tag}
                    onChange={(e) => handleTagChange(i, e.target.value)}
                    placeholder="tag..."
                    className="flex-1 h-7 px-2 rounded-md border border-border/70 bg-transparent text-[12px] outline-none focus:border-zinc-400"
                  />
                  <button onClick={() => removeTag(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-3">Statut</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  onClick={() => handleChange('published', false)}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    !formData.published ? 'border-zinc-900 dark:border-white' : 'border-zinc-300 dark:border-zinc-700'
                  )}
                >
                  {!formData.published && <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />}
                </button>
                <div>
                  <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Brouillon</p>
                  <p className="text-[10px] text-zinc-400">Non visible publiquement</p>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  onClick={() => handleChange('published', true)}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    formData.published ? 'border-emerald-600' : 'border-zinc-300 dark:border-zinc-700'
                  )}
                >
                  {formData.published && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                </button>
                <div>
                  <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Publie</p>
                  <p className="text-[10px] text-zinc-400">Visible sur le blog</p>
                </div>
              </label>
            </div>
          </div>

          {/* Markdown help */}
          <div className="bg-card/85 rounded-xl border border-border/70 p-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-2">Aide Markdown</label>
            <div className="space-y-1 text-[11px] text-zinc-500 font-mono">
              <p><strong className="text-zinc-700 dark:text-zinc-300">**gras**</strong></p>
              <p><em className="text-zinc-700 dark:text-zinc-300">*italique*</em></p>
              <p><span className="text-zinc-700 dark:text-zinc-300"># Titre</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">`code`</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">```bloc```</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">![alt](url)</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">[lien](url)</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">&gt; citation</span></p>
              <p><span className="text-zinc-700 dark:text-zinc-300">- liste</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

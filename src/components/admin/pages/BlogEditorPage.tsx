import { useState } from 'react';
import {
  ArrowLeft, Loader2, CheckCircle2,
  Plus, Send, Mail,
} from 'lucide-react';
import { useBlogTags, useCreateBlogPost, useTranslateFields, useUpdateBlogPost, useSendArticleToSubscribers } from '@/hooks/queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { LangToggle } from '@/components/admin/shared/LangToggle';
import { PublicationControl } from '@/components/admin/shared/PublicationControl';
import { AssetUploadField } from '@/components/admin/shared/AssetUploadField';
import { TranslationPanel } from '@/components/admin/shared/TranslationPanel';
import type { BlogPost, BlogPostFormData } from '@/types/admin.types';

// ======================== BLOG CATEGORIES ========================
const blogCategories = ['Tech', 'Design', 'Business', 'Tutoriel', 'Actualite', 'Retour d\'experience'];
const isBlank = (value?: string | null) => !value || value.trim().length === 0;
const normalizeText = (value?: string | null) =>
  value ? value.trim().toLowerCase().replace(/\s+/g, ' ') : '';
const isMissingTranslation = (source?: string | null, target?: string | null) =>
  isBlank(target) || (!!normalizeText(source) && normalizeText(source) === normalizeText(target));
const hasUsefulTranslations = (
  fields: Record<string, unknown>,
  translations: Record<string, unknown>,
) =>
  Object.entries(fields).some(([key, source]) => {
    const translated = translations[key];
    if (typeof source !== 'string' || typeof translated !== 'string') return false;
    return normalizeText(translated).length > 0 && normalizeText(source) !== normalizeText(translated);
  });

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
  const translateMutation = useTranslateFields();
  const { data: availableTags = [] } = useBlogTags();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [translationInstructions, setTranslationInstructions] = useState('');

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
        tags: initialData.tags?.length ? initialData.tags : [],
        tagIds: initialData.blogTags?.map((tag) => tag.id) || initialData.tagIds || [],
        published: initialData.published,
        publishedAt: initialData.publishedAt || null,
        newsletterSentAt: initialData.newsletterSentAt || null,
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
      tags: [],
      tagIds: [],
      published: false,
      publishedAt: null,
    };
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    handleChange('imageUrl', url);
    if (isEditing && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        data: { imageUrl: url },
      });
    }
  };

  const buildTranslationFields = (overwrite: boolean) => {
    const fields: Record<string, unknown> = {};
    if (formData.title.trim() && (overwrite || isMissingTranslation(formData.title, formData.title_en))) fields.title = formData.title;
    if (formData.excerpt.trim() && (overwrite || isMissingTranslation(formData.excerpt, formData.excerpt_en))) fields.excerpt = formData.excerpt;
    if (formData.content.trim() && (overwrite || isMissingTranslation(formData.content, formData.content_en))) fields.content = formData.content;
    return fields;
  };

  const handleTranslate = async (overwrite: boolean) => {
    const fields = buildTranslationFields(overwrite);
    if (!Object.keys(fields).length) {
      toast.info('Aucun champ FR disponible a traduire');
      return;
    }
    try {
      const result = await translateMutation.mutateAsync({
        entity: 'blog',
        sourceLocale: 'fr',
        targetLocale: 'en',
        fields,
        instructions: translationInstructions,
      });
      if (!hasUsefulTranslations(fields, result.translations)) {
        toast.error('La traduction recue ne modifie aucun champ. Verifiez le provider IA.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        ...(typeof result.translations.title === 'string' ? { title_en: result.translations.title } : {}),
        ...(typeof result.translations.excerpt === 'string' ? { excerpt_en: result.translations.excerpt } : {}),
        ...(typeof result.translations.content === 'string' ? { content_en: result.translations.content } : {}),
      }));
      setLang('en');
      toast.success('Traduction EN generee');
    } catch (error) {
      toast.error((error as Error).message || 'Impossible de generer la traduction');
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => {
      const current = prev.tagIds || [];
      return {
        ...prev,
        tagIds: current.includes(tagId)
          ? current.filter((id) => id !== tagId)
          : [...current, tagId],
      };
    });
  };

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
      published: publish ? true : false,
      publishedAt: publish ? formData.publishedAt || null : null,
      tags: availableTags.filter((tag) => formData.tagIds?.includes(tag.id)).map((tag) => tag.name),
      tagIds: formData.tagIds || [],
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
  const canNotifySubscribers = Boolean(isEditing && initialData?.published && initialData?.slug && !formData.newsletterSentAt);
  const primaryActionLabel = saved
    ? 'Enregistre'
    : isEditing
      ? 'Mettre a jour'
      : formData.published
        ? 'Publier'
        : 'Creer';

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

        <div className="flex flex-wrap items-center justify-end gap-2">
          <LangToggle lang={lang} onChange={setLang} hasEnContent={!!(formData.title_en?.trim())} />
          <PublicationControl
            published={formData.published}
            publishedAt={formData.publishedAt}
            newsletterSentAt={formData.newsletterSentAt}
            onPublishedChange={(value) => handleChange('published', value)}
            onPublishedAtChange={(value) => handleChange('publishedAt', value || '')}
          />
          <button
            onClick={() => handleSave(Boolean(formData.published))}
            disabled={isPending}
            className={cn(
              'h-8 px-4 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60',
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
            )}
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {primaryActionLabel}
          </button>

          {canNotifySubscribers && (
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
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
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
          <AssetUploadField
            value={formData.imageUrl}
            label="URL de l'image de couverture :"
            emptyLabel="Ajouter une image de couverture"
            scope="blog"
            onChange={handleImageUrlChange}
          />

          {/* Excerpt */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
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
          <TranslationPanel
            instructions={translationInstructions}
            isPending={translateMutation.isPending}
            onInstructionsChange={setTranslationInstructions}
            onTranslateMissing={() => handleTranslate(false)}
            onTranslateAll={() => handleTranslate(true)}
          />

          {/* Category */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
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
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-zinc-400">Tags</label>
              <button type="button" className="text-zinc-400 cursor-default">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.length ? availableTags.map((tag) => {
                const selected = formData.tagIds?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors',
                      selected
                        ? 'border-primary/50 bg-primary text-primary-foreground'
                        : 'border-border/70 bg-card/55 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tag.name}
                  </button>
                );
              }) : (
                <p className="text-[11px] text-zinc-400">Creez vos tags depuis la page Tags.</p>
              )}
            </div>
          </div>

          {/* Markdown help */}
          <div className="bg-card/60 rounded-xl border border-border/70 p-4">
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

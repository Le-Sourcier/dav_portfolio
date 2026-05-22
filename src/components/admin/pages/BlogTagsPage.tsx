import { useEffect, useState } from 'react';
import type React from 'react';
import { Hash, Eye, EyeOff, BarChart3 } from 'lucide-react';
import {
  useBlogTagStats,
  useCreateBlogTag,
  useDeleteBlogTag,
  useUpdateBlogTag,
} from '@/hooks/queries';
import { cn } from '@/lib/utils';
import type { BlogTag, BlogTagFormData } from '@/types/admin.types';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';

const emptyForm: BlogTagFormData = {
  name: '',
  slug: '',
  description: '',
  color: '#d7b464',
  isVisible: true,
};

export function BlogTagsPage() {
  const { data: tags = [], isLoading } = useBlogTagStats();
  const createMutation = useCreateBlogTag();
  const updateMutation = useUpdateBlogTag();
  const deleteMutation = useDeleteBlogTag();
  const [form, setForm] = useState<BlogTagFormData>(emptyForm);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!editingTag) return;
    setForm({
      name: editingTag.name,
      slug: editingTag.slug,
      description: editingTag.description || '',
      color: editingTag.color || '#d7b464',
      isVisible: editingTag.isVisible,
    });
  }, [editingTag]);

  const totalViews = tags.reduce((sum, tag) => sum + (tag.viewsCount || 0), 0);
  const totalPosts = tags.reduce((sum, tag) => sum + (tag.postsCount || 0), 0);
  const unusedTags = tags.filter((tag) => !tag.postsCount).length;

  const columns: Column<BlogTag>[] = [
    {
      key: 'name',
      label: 'Tag',
      render: (tag) => (
        <div className="flex items-center gap-3">
          <span
            className="h-9 w-9 rounded-xl border border-border/70 flex items-center justify-center"
            style={{ backgroundColor: `${tag.color || '#d7b464'}22`, color: tag.color || '#d7b464' }}
          >
            <Hash className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{tag.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">/blog/tag/{tag.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'isVisible',
      label: 'Visibilite',
      render: (tag) => <StatusBadge label={tag.isVisible ? 'Visible' : 'Masque'} variant={tag.isVisible ? 'success' : 'neutral'} />,
    },
    {
      key: 'postsCount',
      label: 'Articles',
      render: (tag) => <span className="text-sm font-semibold text-foreground">{tag.postsCount || 0}</span>,
    },
    {
      key: 'viewsCount',
      label: 'Vues',
      render: (tag) => <span className="text-sm font-semibold text-foreground">{(tag.viewsCount || 0).toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'commentsCount',
      label: 'Commentaires',
      render: (tag) => <span className="text-sm font-semibold text-foreground">{tag.commentsCount || 0}</span>,
    },
  ];

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTag(null);
  };

  const submit = () => {
    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || '',
    };
    if (!payload.name) return;

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: payload }, { onSuccess: resetForm });
    } else {
      createMutation.mutate(payload, { onSuccess: resetForm });
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Tags actifs" value={String(tags.filter((tag) => tag.isVisible).length)} icon={Hash} />
        <MetricCard label="Articles relies" value={String(totalPosts)} icon={BarChart3} />
        <MetricCard label="Tags inutilises" value={String(unusedTags)} icon={EyeOff} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="admin-glass-card rounded-2xl border p-5 shadow-[0_18px_55px_var(--admin-shadow)]">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            {editingTag ? 'Edition tag' : 'Nouveau tag'}
          </p>
          <div className="space-y-3">
            <Field label="Nom">
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none focus:border-primary/60"
                placeholder="SaaS, IA, Product..."
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none focus:border-primary/60"
                placeholder="genere automatiquement si vide"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
                placeholder="Courte intention editoriale du tag..."
              />
            </Field>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label="Accent">
                <input
                  value={form.color || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none focus:border-primary/60"
                  placeholder="#d7b464"
                />
              </Field>
              <button
                onClick={() => setForm((prev) => ({ ...prev, isVisible: !prev.isVisible }))}
                className={cn(
                  'mt-5 h-10 rounded-xl border px-3 text-xs font-semibold transition-colors',
                  form.isVisible
                    ? 'border-primary/50 bg-primary text-primary-foreground'
                    : 'border-border/70 bg-card/60 text-muted-foreground'
                )}
              >
                {form.isVisible ? <Eye className="mr-1 inline h-3.5 w-3.5" /> : <EyeOff className="mr-1 inline h-3.5 w-3.5" />}
                {form.isVisible ? 'Visible' : 'Masque'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={resetForm}
              className="h-9 rounded-lg border border-border/70 bg-card/45 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {editingTag ? 'Mettre a jour' : 'Creer le tag'}
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tags}
          isLoading={isLoading}
          onEdit={(tag) => setEditingTag(tag)}
          onDelete={(tag) => setDeleteId(tag.id)}
          getItemId={(tag) => tag.id}
          emptyMessage="Aucun tag. Creez votre premiere taxonomie blog."
          pageSize={8}
        />
      </section>

      <section className="admin-glass-card rounded-2xl border p-5 shadow-[0_18px_55px_var(--admin-shadow)]">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Monitoring</p>
        <div className="grid gap-3 md:grid-cols-3">
          {tags.slice(0, 6).map((tag) => {
            const ratio = totalViews ? Math.round(((tag.viewsCount || 0) / totalViews) * 100) : 0;
            return (
              <div key={tag.id} className="rounded-xl border border-border/70 bg-card/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground truncate">{tag.name}</p>
                  <span className="text-[11px] font-bold text-primary">{ratio}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {(tag.viewsCount || 0).toLocaleString('fr-FR')} vues - {tag.postsCount || 0} article{(tag.postsCount || 0) > 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Supprimer le tag"
        message="Le tag sera retire des articles associes, sans supprimer les articles."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="admin-glass-card rounded-2xl border p-4 shadow-[0_18px_55px_var(--admin-shadow)]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

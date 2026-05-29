import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects, useDeleteProject } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ProjectEditorPage } from './ProjectEditorPage';
import { BarChart3, Clock3, FolderKanban, Search, SlidersHorizontal, Star, type LucideIcon } from 'lucide-react';
import { isScheduled, matchesPublishFilter, normalizeSearch, type PublishFilter } from '@/lib/adminList';
import type { Project } from '@/types/admin.types';

export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteMutation = useDeleteProject();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublishFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'title' | 'featured'>('recent');

  // Intercept openModal('project') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'project') {
      openEditor((modal.data as Project) || null);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    const isNew = searchParams.get('new') === 'project';

    if (isNew && !editorOpen) {
      setEditingItem(null);
      setEditorOpen(true);
      return;
    }

    if (!editId || !projects.length) return;
    const project = projects.find((item) => item.id === editId);
    if (project && (!editorOpen || editingItem?.id !== editId)) {
      setEditingItem(project);
      setEditorOpen(true);
    }
  }, [editingItem?.id, editorOpen, projects, searchParams]);

  const metrics = useMemo(() => {
    const published = projects.filter((item) => item.published && !isScheduled(item)).length;
    const scheduled = projects.filter(isScheduled).length;
    const featured = projects.filter((item) => item.featured).length;
    const measured = projects.filter((item) =>
      (item.metrics?.length || 0) + (item.chartData?.length || 0) + (item.impactGraph?.length || 0) > 0
    ).length;

    return [
      { label: 'Projets', value: projects.length, icon: FolderKanban },
      { label: 'Publies', value: published, icon: BarChart3 },
      { label: 'Programmes', value: scheduled, icon: Clock3 },
      { label: 'Mesures', value: measured, icon: Star },
      { label: 'En avant', value: featured, icon: Star },
    ];
  }, [projects]);

  const categories = useMemo(() => (
    Array.from(new Set(projects.map((item) => item.category).filter(Boolean))).sort()
  ), [projects]);

  const filteredProjects = useMemo(() => {
    const query = normalizeSearch(search);
    return projects
      .filter((item) => matchesPublishFilter(item, statusFilter))
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => {
        if (!query) return true;
        return normalizeSearch([
          item.title,
          item.title_en,
          item.description,
          item.description_en,
          item.category,
          item.category_en,
          item.tech?.join(' '),
          item.slug,
        ].join(' ')).includes(query);
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'featured') return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return sort === 'oldest' ? aDate - bDate : bDate - aDate;
      });
  }, [categoryFilter, projects, search, sort, statusFilter]);

  const columns: Column<Project>[] = [
    {
      key: 'title',
      label: 'Projet',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[13px] text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{item.description?.slice(0, 60)}...</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categorie',
      render: (item) => <StatusBadge label={item.category} variant="info" />,
    },
    {
      key: 'published',
      label: 'Statut',
      render: (item) => (
        <StatusBadge
          label={isScheduled(item) ? 'Programme' : item.published ? 'Publie' : 'Brouillon'}
          variant={isScheduled(item) ? 'warning' : item.published ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'tech',
      label: 'Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(item.tech || []).slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold">{tech}</span>
          ))}
          {(item.tech || []).length > 3 && (
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400">
              +{item.tech!.length - 3}
            </span>
          )}
        </div>
      ),
    },
  ];

  const openEditor = (item: Project | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (item) {
      nextParams.set('edit', item.id);
      nextParams.delete('new');
    } else {
      nextParams.set('new', 'project');
      nextParams.delete('edit');
    }
    setSearchParams(nextParams);
    setEditingItem(item);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('edit');
    nextParams.delete('new');
    setSearchParams(nextParams);
    setEditorOpen(false);
    setEditingItem(null);
  };

  const handleCreate = () => {
    openEditor(null);
  };

  const handleEdit = (item: Project) => {
    openEditor(item);
  };

  const handleDelete = (item: Project) => {
    setDeleteId(item.id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  // Show editor page
  if (editorOpen) {
    return (
      <ProjectEditorPage
        initialData={editingItem}
        onBack={closeEditor}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="admin-glass-card rounded-2xl border p-4 mb-5 shadow-[0_18px_55px_var(--admin-shadow)]">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
          <label className="relative block">
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Recherche</span>
            <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60"
              placeholder="Projet, stack, categorie..."
            />
          </label>
          <Select label="Statut" value={statusFilter} onChange={(value) => setStatusFilter(value as PublishFilter)}>
            <option value="all">Tous</option>
            <option value="published">Publies</option>
            <option value="draft">Brouillons</option>
            <option value="scheduled">Programmes</option>
          </Select>
          <Select label="Categorie" value={categoryFilter} onChange={setCategoryFilter}>
            <option value="all">Toutes</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          <Select label="Tri" value={sort} onChange={(value) => setSort(value as typeof sort)}>
            <option value="recent">Plus recents</option>
            <option value="oldest">Plus anciens</option>
            <option value="title">Titre</option>
            <option value="featured">Mis en avant</option>
          </Select>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 text-[11px] font-semibold text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {filteredProjects.length} resultat{filteredProjects.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="h-9 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
        >
          + Nouveau projet
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredProjects}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun projet. Cliquez sur 'Nouveau projet' pour commencer."
        pageSize={8}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le projet"
        message="Cette action est irreversible."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="admin-glass-card rounded-2xl border p-4 shadow-[0_18px_55px_var(--admin-shadow)]">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-black text-foreground">{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none transition-colors focus:border-primary/60"
      >
        {children}
      </select>
    </label>
  );
}

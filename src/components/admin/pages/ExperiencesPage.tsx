import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExperiences, useDeleteExperience } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ExperienceEditorPage } from './ExperienceEditorPage';
import { BriefcaseBusiness, Clock3, Image, Layers3, Search, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { isScheduled, matchesPublishFilter, normalizeSearch, type PublishFilter } from '@/lib/adminList';
import type { Experience } from '@/types/admin.types';

export function ExperiencesPage() {
  const { data: experiences = [], isLoading } = useExperiences();
  const deleteMutation = useDeleteExperience();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublishFilter>('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'company' | 'title'>('recent');

  // Intercept openModal('experience') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'experience') {
      openEditor((modal.data as Experience) || null);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    const isNew = searchParams.get('new') === 'experience';

    if (isNew && !editorOpen) {
      setEditingItem(null);
      setEditorOpen(true);
      return;
    }

    if (!editId || !experiences.length) return;
    const experience = experiences.find((item) => item.id === editId);
    if (experience && (!editorOpen || editingItem?.id !== editId)) {
      setEditingItem(experience);
      setEditorOpen(true);
    }
  }, [editingItem?.id, editorOpen, experiences, searchParams]);

  const metrics = useMemo(() => {
    const published = experiences.filter((item) => item.published && !isScheduled(item)).length;
    const scheduled = experiences.filter(isScheduled).length;
    const covered = experiences.filter((item) => Boolean(item.coverImage)).length;
    const documented = experiences.filter((item) =>
      (item.achievements?.length || 0) + (item.illustrativeImages?.length || 0) + (item.links?.length || 0) > 0
    ).length;

    return [
      { label: 'Experiences', value: experiences.length, icon: BriefcaseBusiness },
      { label: 'Publiees', value: published, icon: Layers3 },
      { label: 'Programmees', value: scheduled, icon: Clock3 },
      { label: 'Avec cover', value: covered, icon: Image },
      { label: 'Documentees', value: documented, icon: Layers3 },
    ];
  }, [experiences]);

  const companies = useMemo(() => (
    Array.from(new Set(experiences.map((item) => item.company).filter(Boolean))).sort()
  ), [experiences]);

  const filteredExperiences = useMemo(() => {
    const query = normalizeSearch(search);
    return experiences
      .filter((item) => matchesPublishFilter(item, statusFilter))
      .filter((item) => companyFilter === 'all' || item.company === companyFilter)
      .filter((item) => {
        if (!query) return true;
        return normalizeSearch([
          item.title,
          item.title_en,
          item.company,
          item.location,
          item.description,
          item.description_en,
          item.stack?.join(' '),
          item.dates,
        ].join(' ')).includes(query);
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'company') return a.company.localeCompare(b.company);
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return sort === 'oldest' ? aDate - bDate : bDate - aDate;
      });
  }, [companyFilter, experiences, search, sort, statusFilter]);

  const columns: Column<Experience>[] = [
    {
      key: 'title',
      label: 'Poste / Entreprise',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.coverImage && (
            <img src={item.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[13px] text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{item.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Lieu',
      render: (item) => (
        <span className="text-[12px] text-zinc-500">{item.location || '-'}</span>
      ),
    },
    {
      key: 'dates',
      label: 'Periode',
      render: (item) => <StatusBadge label={item.dates} variant="neutral" />,
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
      key: 'stack',
      label: 'Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {(item.stack || []).slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold">{tech}</span>
          ))}
          {(item.stack || []).length > 3 && (
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400">
              +{item.stack!.length - 3}
            </span>
          )}
        </div>
      ),
    },
  ];

  const openEditor = (item: Experience | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (item) {
      nextParams.set('edit', item.id);
      nextParams.delete('new');
    } else {
      nextParams.set('new', 'experience');
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

  const handleEdit = (item: Experience) => {
    openEditor(item);
  };

  const handleDelete = (item: Experience) => {
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
      <ExperienceEditorPage
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
        <div className="grid gap-3 xl:grid-cols-[1.5fr_0.8fr_0.9fr_0.8fr_auto] xl:items-end">
          <label className="relative block">
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Recherche</span>
            <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60"
              placeholder="Poste, entreprise, stack..."
            />
          </label>
          <Select label="Statut" value={statusFilter} onChange={(value) => setStatusFilter(value as PublishFilter)}>
            <option value="all">Toutes</option>
            <option value="published">Publiees</option>
            <option value="draft">Brouillons</option>
            <option value="scheduled">Programmees</option>
          </Select>
          <Select label="Entreprise" value={companyFilter} onChange={setCompanyFilter}>
            <option value="all">Toutes</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </Select>
          <Select label="Tri" value={sort} onChange={(value) => setSort(value as typeof sort)}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="company">Entreprise</option>
            <option value="title">Poste</option>
          </Select>
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 text-[11px] font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filteredExperiences.length} resultat{filteredExperiences.length > 1 ? 's' : ''}
          </span>
        </div>
      </section>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="h-9 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
        >
          + Nouvelle experience
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredExperiences}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucune experience. Cliquez sur 'Nouvelle experience' pour commencer."
        pageSize={8}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'experience"
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

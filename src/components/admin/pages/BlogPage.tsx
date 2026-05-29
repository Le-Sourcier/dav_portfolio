import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts, useDeleteBlogPost, useBlogStats } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { BlogEditorPage } from './BlogEditorPage';
import { CalendarClock, Clock, Eye, FileText, MailCheck, MessageSquare, Search, Share2, SlidersHorizontal } from 'lucide-react';
import { isScheduled, matchesPublishFilter, normalizeSearch, type PublishFilter } from '@/lib/adminList';
import type { BlogPost } from '@/types/admin.types';

export function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const { data: stats } = useBlogStats();
  const deleteMutation = useDeleteBlogPost();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublishFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'title' | 'views' | 'comments'>('recent');

  // Intercept openModal('blog') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'blog') {
      openEditor((modal.data as BlogPost) || null);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    const isNew = searchParams.get('new') === 'blog';

    if (isNew && !editorOpen) {
      setEditingPost(null);
      setEditorOpen(true);
      return;
    }

    if (!editId || !posts.length) return;
    const post = posts.find((item) => item.id === editId);
    if (post && (!editorOpen || editingPost?.id !== editId)) {
      setEditingPost(post);
      setEditorOpen(true);
    }
  }, [editingPost?.id, editorOpen, posts, searchParams]);

  const categories = useMemo(() => (
    Array.from(new Set(posts.map((item) => item.category).filter(Boolean))).sort()
  ), [posts]);

  const filteredPosts = useMemo(() => {
    const query = normalizeSearch(search);
    return posts
      .filter((item) => matchesPublishFilter(item, statusFilter))
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => {
        if (!query) return true;
        return normalizeSearch([
          item.title,
          item.title_en,
          item.excerpt,
          item.excerpt_en,
          item.category,
          item.tags?.join(' '),
          item.blogTags?.map((tag) => tag.name).join(' '),
          item.slug,
        ].join(' ')).includes(query);
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
        if (sort === 'comments') return (b.comments?.length || 0) - (a.comments?.length || 0);
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return sort === 'oldest' ? aDate - bDate : bDate - aDate;
      });
  }, [categoryFilter, posts, search, sort, statusFilter]);

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      label: 'Article',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="w-12 h-8 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[13px] text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{item.excerpt?.slice(0, 60)}...</p>
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
      key: 'viewCount',
      label: 'Vues',
      render: (item) => (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Eye className="w-3 h-3" /> {item.viewCount || 0}
        </span>
      ),
    },
    {
      key: 'shareCount',
      label: 'Partages',
      render: (item) => (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Share2 className="w-3 h-3" /> {item.shareCount || 0}
        </span>
      ),
    },
    {
      key: 'comments',
      label: 'Commentaires',
      render: (item) => (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> {item.comments?.length || 0}
        </span>
      ),
    },
    {
      key: 'readTime',
      label: 'Lecture',
      render: (item) => (
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {item.readTime || '-'}
        </span>
      ),
    },
  ];

  const handleCreate = () => {
    openEditor(null);
  };

  const handleEdit = (item: BlogPost) => {
    openEditor(item);
  };

  const handleDelete = (item: BlogPost) => {
    setDeleteId(item.id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleViewComments = (item: BlogPost) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'comments');
    nextParams.set('postId', item.id);
    nextParams.delete('edit');
    nextParams.delete('new');
    setSearchParams(nextParams);
    setActiveTab('comments');
  };

  const openEditor = (item: BlogPost | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (item) {
      nextParams.set('edit', item.id);
      nextParams.delete('new');
    } else {
      nextParams.set('new', 'blog');
      nextParams.delete('edit');
    }
    nextParams.delete('postId');
    nextParams.delete('commentId');
    setSearchParams(nextParams);
    setEditingPost(item);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('edit');
    nextParams.delete('new');
    setSearchParams(nextParams);
    setEditorOpen(false);
    setEditingPost(null);
  };

  // Show editor page
  if (editorOpen) {
    return (
      <BlogEditorPage
        initialData={editingPost}
        onBack={closeEditor}
      />
    );
  }

  const scheduledCount = posts.filter(isScheduled).length;
  const draftCount = posts.filter((post) => !post.published).length;
  const newsletterPending = posts.filter((post) => post.published && !post.newsletterSentAt).length;
  const statCards = [
    { label: 'Total vues', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Partages', value: stats?.totalShares ?? 0, icon: Share2, color: 'text-green-500' },
    { label: 'Commentaires', value: stats?.totalComments ?? 0, icon: MessageSquare, color: 'text-amber-500' },
    { label: 'Articles publies', value: stats?.publishedPosts ?? 0, icon: FileText, color: 'text-violet-500' },
    { label: 'Brouillons', value: draftCount, icon: FileText, color: 'text-zinc-500' },
    { label: 'Programmes', value: scheduledCount, icon: CalendarClock, color: 'text-orange-500' },
    { label: 'Newsletters a envoyer', value: newsletterPending, icon: MailCheck, color: 'text-cyan-500' },
  ];

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-card/60 border border-border/70">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[11px] text-zinc-400 font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{s.value.toLocaleString('fr-FR')}</p>
          </div>
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
              placeholder="Article, slug, tag, categorie..."
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
            <option value="views">Vues</option>
            <option value="comments">Commentaires</option>
          </Select>
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 text-[11px] font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filteredPosts.length} resultat{filteredPosts.length > 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* Create button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="h-9 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
        >
          + Nouvel article
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredPosts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleViewComments}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun article. Cliquez sur 'Nouvel article' pour commencer."
        pageSize={8}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'article"
        message="L'article sera definitivement supprime."
        isLoading={deleteMutation.isPending}
      />
    </>
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

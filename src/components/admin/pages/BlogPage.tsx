import { useState, useEffect } from 'react';
import { useBlogPosts, useDeleteBlogPost, useBlogStats, useDeleteBlogComment } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { BlogEditorPage } from './BlogEditorPage';
import { Clock, Eye, Share2, MessageSquare, FileText, Trash2, Reply } from 'lucide-react';
import type { BlogComment, BlogPost } from '@/types/admin.types';

export function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const { data: stats } = useBlogStats();
  const deleteMutation = useDeleteBlogPost();
  const deleteCommentMutation = useDeleteBlogComment();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedCommentsPostId, setSelectedCommentsPostId] = useState<string | null>(null);

  // Intercept openModal('blog') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'blog') {
      setEditingPost((modal.data as BlogPost) || null);
      setEditorOpen(true);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

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
          label={item.published ? 'Publie' : 'Brouillon'}
          variant={item.published ? 'success' : 'warning'}
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
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleEdit = (item: BlogPost) => {
    setEditingPost(item);
    setEditorOpen(true);
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

  const confirmDeleteComment = () => {
    if (deleteCommentId) {
      deleteCommentMutation.mutate(deleteCommentId, {
        onSuccess: () => setDeleteCommentId(null),
      });
    }
  };

  const selectedCommentsPost = posts.find((post) => post.id === selectedCommentsPostId) || null;
  const commentCount = (comment: BlogComment): number => 1 + (comment.replies || []).reduce((total, reply) => total + commentCount(reply), 0);
  const selectedCommentsTotal = (selectedCommentsPost?.comments || []).reduce((total, comment) => total + commentCount(comment), 0);

  // Show editor page
  if (editorOpen) {
    return (
      <BlogEditorPage
        initialData={editingPost}
        onBack={() => setEditorOpen(false)}
      />
    );
  }

  const statCards = [
    { label: 'Total vues', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Partages', value: stats?.totalShares ?? 0, icon: Share2, color: 'text-green-500' },
    { label: 'Commentaires', value: stats?.totalComments ?? 0, icon: MessageSquare, color: 'text-amber-500' },
    { label: 'Articles publies', value: stats?.publishedPosts ?? 0, icon: FileText, color: 'text-violet-500' },
  ];

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
        data={posts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={(item) => setSelectedCommentsPostId(item.id)}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun article. Cliquez sur 'Nouvel article' pour commencer."
      />

      {selectedCommentsPost && (
        <div className="admin-glass-card rounded-2xl border mt-6 p-5 shadow-[0_18px_55px_var(--admin-shadow)]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.16em] mb-1">Commentaires</p>
              <h3 className="text-sm font-semibold text-foreground truncate">{selectedCommentsPost.title}</h3>
              <p className="text-[11px] text-zinc-400">{selectedCommentsTotal} commentaire{selectedCommentsTotal > 1 ? 's' : ''} sur cet article</p>
            </div>
            <button
              onClick={() => setSelectedCommentsPostId(null)}
              className="h-8 px-3 rounded-lg text-[11px] font-semibold border border-border/70 hover:bg-secondary transition-colors"
            >
              Fermer
            </button>
          </div>

          {(selectedCommentsPost.comments || []).length ? (
            <div className="space-y-3">
              {(selectedCommentsPost.comments || []).map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={setDeleteCommentId}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-border/70 rounded-xl">
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
              <p className="text-sm text-zinc-400">Aucun commentaire pour cet article.</p>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'article"
        message="L'article sera definitivement supprime."
        isLoading={deleteMutation.isPending}
      />
      <ConfirmDialog
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={confirmDeleteComment}
        title="Supprimer le commentaire"
        message="Le commentaire et ses reponses associees seront supprimes."
        isLoading={deleteCommentMutation.isPending}
      />
    </>
  );
}

interface CommentItemProps {
  comment: BlogComment;
  depth?: number;
  onDelete: (id: string) => void;
}

function CommentItem({ comment, depth = 0, onDelete }: CommentItemProps) {
  return (
    <div className={depth ? 'ml-5 pl-4 border-l border-border/70' : ''}>
      <div className="rounded-xl border border-border/70 bg-card/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {depth > 0 && <Reply className="w-3 h-3 text-zinc-500" />}
              <p className="text-[12px] font-semibold text-foreground truncate">{comment.author}</p>
              <span className="text-[11px] text-zinc-500 truncate">{comment.email}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
              {comment.mentions?.length ? ` - mentions: ${comment.mentions.join(', ')}` : ''}
            </p>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          </div>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {comment.replies?.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

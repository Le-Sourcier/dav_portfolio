import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Reply,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  useBlogComments,
  useBlogCommentThread,
  useBlogPosts,
  useDeleteBlogComment,
  useReplyToBlogComment,
} from '@/hooks/queries';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import type { BlogComment, BlogCommentFilters } from '@/types/admin.types';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { MarkdownEditor } from '../shared/MarkdownEditor';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

const PAGE_SIZE = 12;

export function CommentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPostId = searchParams.get('postId') || '';
  const initialCommentId = searchParams.get('commentId') || '';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [postId, setPostId] = useState(initialPostId);
  const [mentioned, setMentioned] = useState('');
  const [parentOnly, setParentOnly] = useState(false);
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const [selectedId, setSelectedId] = useState(initialCommentId);
  const [replyTargetId, setReplyTargetId] = useState(initialCommentId);
  const [replyContent, setReplyContent] = useState('');
  const [manualMentions, setManualMentions] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { profile } = useSettingsStore();
  const { data: posts = [] } = useBlogPosts();
  const filters = useMemo<BlogCommentFilters>(() => ({
    page,
    limit: PAGE_SIZE,
    postId: postId || undefined,
    search: search.trim() || undefined,
    mentioned: mentioned.trim() || undefined,
    parentOnly: parentOnly || undefined,
    sort,
  }), [mentioned, page, parentOnly, postId, search, sort]);

  const { data, isLoading } = useBlogComments(filters);
  const comments = data?.comments || [];
  const pagination = data?.pagination;
  const selectedCommentFromList = comments.find((comment) => comment.id === selectedId) || null;
  const { data: selectedThread, isLoading: threadLoading } = useBlogCommentThread(selectedId);
  const replyMutation = useReplyToBlogComment();
  const deleteMutation = useDeleteBlogComment();

  useEffect(() => {
    setPage(1);
  }, [postId, search, mentioned, parentOnly, sort]);

  useEffect(() => {
    if (!selectedId && comments.length) {
      setSelectedId(comments[0].id);
      setReplyTargetId(comments[0].id);
    }
  }, [comments, selectedId]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (postId) nextParams.set('postId', postId);
    else nextParams.delete('postId');
    if (selectedId) nextParams.set('commentId', selectedId);
    else nextParams.delete('commentId');
    setSearchParams(nextParams, { replace: true });
  }, [postId, selectedId]);

  const currentThread = selectedThread || selectedCommentFromList;
  const replyTarget = findCommentById(currentThread, replyTargetId) || currentThread || null;
  const totalPages = pagination?.totalPages || 1;

  const participants = useMemo(() => {
    const map = new Map<string, { label: string; email: string }>();
    collectParticipants(currentThread, map);
    return Array.from(map.values());
  }, [currentThread]);

  const selectedPostTitle = useMemo(() => {
    if (!postId) return 'Tous les articles';
    const post = posts.find((item) => item.id === postId);
    return post?.title || currentThread?.BlogPost?.title || 'Article filtre';
  }, [currentThread?.BlogPost?.title, postId, posts]);

  const handleSelectComment = (comment: BlogComment) => {
    setSelectedId(comment.id);
    setReplyTargetId(comment.id);
    setReplyContent('');
    setSelectedMentions([]);
  };

  const toggleMention = (label: string) => {
    setSelectedMentions((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  };

  const handleReply = () => {
    if (!replyTarget || !replyContent.trim()) return;
    const mentions = Array.from(new Set([
      ...selectedMentions,
      ...manualMentions.split(',').map((item) => item.trim()).filter(Boolean),
    ]));

    replyMutation.mutate({
      commentId: replyTarget.id,
      data: {
        author: profile.name || user?.name || 'Yao David Logan',
        email: profile.email || user?.email || 'admin@lesourcier.space',
        content: replyContent.trim(),
        mentions,
      },
    }, {
      onSuccess: () => {
        setReplyContent('');
        setManualMentions('');
        setSelectedMentions([]);
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        if (deleteId === selectedId) {
          setSelectedId('');
          setReplyTargetId('');
        }
        setDeleteId(null);
      },
    });
  };

  return (
    <>
      <section className="grid gap-4 mb-6 lg:grid-cols-[1fr_340px]">
        <div className="admin-glass-card rounded-2xl border p-5 shadow-[0_18px_55px_var(--admin-shadow)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                Moderation blog
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Commentaires et reponses
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                Filtrez les discussions, ouvrez un thread, repondez en Markdown et taguez les lecteurs sans quitter l'espace admin.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Contexte</p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate max-w-[280px]">{selectedPostTitle}</p>
              <p className="text-[11px] text-muted-foreground">{pagination?.total || 0} commentaire{(pagination?.total || 0) > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="admin-glass-card rounded-2xl border p-5 shadow-[0_18px_55px_var(--admin-shadow)]">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Lecture rapide</p>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Page" value={`${page}/${totalPages}`} />
            <Metric label="Affiches" value={String(comments.length)} />
          </div>
        </div>
      </section>

      <section className="admin-glass-card rounded-2xl border p-4 mb-6 shadow-[0_18px_55px_var(--admin-shadow)]">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]">
          <label className="relative block">
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Recherche</span>
            <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60"
              placeholder="Auteur, email, contenu..."
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Article</span>
            <select
              value={postId}
              onChange={(event) => setPostId(event.target.value)}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none transition-colors focus:border-primary/60"
            >
              <option value="">Tous les articles</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>{post.title}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Mention</span>
            <input
              value={mentioned}
              onChange={(event) => setMentioned(event.target.value)}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none transition-colors focus:border-primary/60"
              placeholder="@nom"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Tri</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'recent' | 'oldest')}
              className="h-10 w-full rounded-xl border border-border/70 bg-card/60 px-3 text-sm outline-none transition-colors focus:border-primary/60"
            >
              <option value="recent">Plus recents</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setParentOnly((value) => !value)}
            className={cn(
              'h-8 rounded-full border px-3 text-[11px] font-semibold transition-colors',
              parentOnly
                ? 'border-primary/50 bg-primary text-primary-foreground'
                : 'border-border/70 bg-card/45 text-muted-foreground hover:text-foreground'
            )}
          >
            Threads racines uniquement
          </button>
          {(search || postId || mentioned || parentOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setPostId('');
                setMentioned('');
                setParentOnly(false);
              }}
              className="h-8 rounded-full border border-border/70 bg-card/45 px-3 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Reinitialiser
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <div className="admin-glass-card rounded-2xl border shadow-[0_18px_55px_var(--admin-shadow)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Threads</p>
              <p className="text-[11px] text-muted-foreground">{pagination?.total || 0} resultats</p>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="max-h-[680px] overflow-y-auto p-2">
            {comments.length ? comments.map((comment) => (
              <button
                key={comment.id}
                onClick={() => handleSelectComment(comment)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all duration-150',
                  selectedId === comment.id
                    ? 'border-primary/45 bg-primary/10 shadow-[0_14px_34px_var(--admin-shadow)]'
                    : 'border-transparent hover:border-border/70 hover:bg-card/55'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{comment.author}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{comment.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border/70 bg-card/50 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    {(comment.replies || []).length} rep.
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                  {comment.content}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                  <span className="truncate">{comment.BlogPost?.title || 'Article'}</span>
                  <span className="shrink-0">{formatDate(comment.createdAt)}</span>
                </div>
              </button>
            )) : (
              <div className="px-5 py-12 text-center">
                <MessageSquareText className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Aucun commentaire</p>
                <p className="mt-1 text-xs text-muted-foreground">Ajustez les filtres pour elargir la recherche.</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="h-8 rounded-lg border border-border/70 bg-card/45 px-3 text-[11px] font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="inline h-3.5 w-3.5" /> Avant
            </button>
            <span className="text-[11px] text-muted-foreground">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="h-8 rounded-lg border border-border/70 bg-card/45 px-3 text-[11px] font-semibold disabled:opacity-40"
            >
              Apres <ChevronRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="admin-glass-card rounded-2xl border shadow-[0_18px_55px_var(--admin-shadow)] overflow-hidden">
          {currentThread ? (
            <>
              <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Conversation</p>
                  <h3 className="truncate text-lg font-semibold text-foreground">{currentThread.BlogPost?.title || selectedPostTitle}</h3>
                </div>
                <button
                  onClick={() => setDeleteId(currentThread.id)}
                  className="h-9 rounded-lg border border-red-500/25 bg-red-500/10 px-3 text-xs font-semibold text-red-500 hover:bg-red-500/15 transition-colors"
                >
                  <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                  {threadLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <CommentBubble
                      comment={currentThread}
                      replyTargetId={replyTargetId}
                      onReplyTarget={setReplyTargetId}
                      onDelete={setDeleteId}
                    />
                  )}
                </div>

                <aside className="rounded-2xl border border-border/70 bg-card/45 p-4">
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Repondre</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cible: <span className="font-semibold text-foreground">{replyTarget?.author || 'Commentaire'}</span>
                    </p>
                  </div>

                  {participants.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Taguer des lecteurs</p>
                      <div className="flex flex-wrap gap-2">
                        {participants.map((participant) => (
                          <button
                            key={participant.email}
                            onClick={() => toggleMention(participant.label)}
                            className={cn(
                              'rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
                              selectedMentions.includes(participant.label)
                                ? 'border-primary/50 bg-primary text-primary-foreground'
                                : 'border-border/70 bg-background/40 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <AtSign className="mr-1 inline h-3 w-3" />
                            {participant.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="mb-4 block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Mentions libres</span>
                    <input
                      value={manualMentions}
                      onChange={(event) => setManualMentions(event.target.value)}
                      className="h-9 w-full rounded-xl border border-border/70 bg-background/40 px-3 text-sm outline-none transition-colors focus:border-primary/60"
                      placeholder="nom, email, role..."
                    />
                  </label>

                  <MarkdownEditor
                    label="Message"
                    value={replyContent}
                    onChange={setReplyContent}
                    minHeight="210px"
                    placeholder="Ecrivez votre reponse en Markdown..."
                  />

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setReplyContent('');
                        setManualMentions('');
                        setSelectedMentions([]);
                      }}
                      className="h-9 rounded-lg border border-border/70 bg-card/45 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="mr-1.5 inline h-3.5 w-3.5" />
                      Effacer
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || replyMutation.isPending}
                      className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      {replyMutation.isPending ? <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" /> : <Reply className="mr-1.5 inline h-3.5 w-3.5" />}
                      Envoyer
                    </button>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
              <div>
                <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Selectionnez une conversation</p>
                <p className="mt-1 text-xs text-muted-foreground">Les messages s'ouvrent ici avec le thread et la zone de reponse.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le commentaire"
        message="Le commentaire et ses reponses associees seront supprimes."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/45 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black text-foreground">{value}</p>
    </div>
  );
}

interface CommentBubbleProps {
  comment: BlogComment;
  replyTargetId: string;
  onReplyTarget: (id: string) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

function CommentBubble({ comment, replyTargetId, onReplyTarget, onDelete, depth = 0 }: CommentBubbleProps) {
  const isTarget = replyTargetId === comment.id;

  return (
    <div className={cn(depth > 0 && 'ml-5 border-l border-border/70 pl-4')}>
      <div className={cn(
        'rounded-2xl border p-4 transition-colors',
        isTarget ? 'border-primary/50 bg-primary/10' : 'border-border/70 bg-card/45'
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{comment.author}</p>
              <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {comment.email}
              </span>
              {comment.mentions?.map((mention) => (
                <span key={mention} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  @{mention}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onReplyTarget(comment.id)}
              className="h-8 rounded-lg border border-border/70 bg-background/35 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="mr-1 inline h-3.5 w-3.5" />
              Repondre
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="h-8 w-8 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="mx-auto h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-border/60 bg-background/35 p-3">
          <MarkdownRenderer content={comment.content} />
        </div>
      </div>
      {comment.replies?.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              replyTargetId={replyTargetId}
              onReplyTarget={onReplyTarget}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function findCommentById(comment: BlogComment | null | undefined, id: string): BlogComment | null {
  if (!comment || !id) return null;
  if (comment.id === id) return comment;
  for (const reply of comment.replies || []) {
    const found = findCommentById(reply, id);
    if (found) return found;
  }
  return null;
}

function collectParticipants(comment: BlogComment | null | undefined, map: Map<string, { label: string; email: string }>) {
  if (!comment) return;
  map.set(comment.email, { label: comment.author, email: comment.email });
  (comment.replies || []).forEach((reply) => collectParticipants(reply, map));
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

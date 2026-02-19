import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, User, Share2, MessageSquare, Send, Mail, Loader2, LogOut, Eye } from 'lucide-react';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { AuthorCard } from './blog/AuthorCard';
import { BlogCtaCard } from './blog/BlogCtaCard';
import { RelatedPosts } from './blog/RelatedPosts';
import { toast } from 'sonner';
import { useBlogPost, useAddComment, useTrackView, useTrackShare } from '@/hooks/queries';
import { useVisitorSession } from '@/hooks/useVisitorSession';
import { OtpVerification } from '@/components/shared/OtpVerification';
import type { BlogComment } from '@/types/admin.types';

// ======================== COMPONENT ========================

export function BlogPostDetail() {
  const { id } = useParams();

  // API
  const { data: apiPost, isLoading: apiLoading, isError } = useBlogPost(id || '');
  const addCommentMutation = useAddComment();
  const trackViewMutation = useTrackView();
  const trackShareMutation = useTrackShare();

  // Visitor session (persisted in sessionStorage)
  const {
    session, isIdentified, isVerified, needsReverification,
    otpStatus, otpError, requestOtp, verifyOtp, clearSession,
  } = useVisitorSession();

  const post = apiPost;
  const loading = apiLoading;
  const comments: BlogComment[] = (apiPost?.comments as BlogComment[]) || [];

  // Form state
  const [identifyForm, setIdentifyForm] = useState({ name: '', email: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Track view — backend handles deduplication (1 unique visitor = 1 view per article)
  const viewTracked = useRef(false);
  useEffect(() => {
    if (id && apiPost && !viewTracked.current) {
      viewTracked.current = true;
      trackViewMutation.mutate(id);
    }
  }, [id, apiPost]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
        <div className="max-w-2xl mx-auto text-center py-24">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Retour au blog
          </Link>
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-8">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">
            {isError ? 'Article temporairement indisponible' : 'Article introuvable'}
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            {isError
              ? 'Le serveur ne repond pas pour le moment. Veuillez reessayer dans quelques instants.'
              : "Cet article n'existe pas ou a ete supprime."}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/blog"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all"
            >
              Voir tous les articles
            </Link>
            {isError && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-border rounded-2xl font-bold text-sm hover:bg-secondary transition-all"
              >
                Reessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ======================== HANDLERS ========================

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email } = identifyForm;
    if (!name.trim()) { toast.error('Veuillez entrer votre nom'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Veuillez entrer un email valide'); return;
    }
    await requestOtp(email.trim(), name.trim());
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!commentContent.trim()) { toast.error('Veuillez ecrire un commentaire'); return; }

    addCommentMutation.mutate(
      {
        postId: id!,
        data: { author: session.name, email: session.email, content: commentContent.trim() },
      },
      { onSuccess: () => setCommentContent('') }
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    if (id) trackShareMutation.mutate(id);
    toast.success('Lien copie dans le presse-papier');
  };

  // ======================== RENDER ========================

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex gap-3 mb-6">
            <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.1]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 py-8 border-y border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auteur</p>
                <p className="text-sm font-bold">{post.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                <p className="text-sm font-bold">
                  {(post as any).date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lecture</p>
                <p className="text-sm font-bold">{post.readTime}</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold">{post.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Share2 className="w-4 h-4" />
                <span className="text-xs font-bold">{post.shareCount || 0}</span>
              </div>
              <button onClick={handleShare} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Cover image */}
        {post.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl border border-border"
          >
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Article content */}
        <article className="mb-16">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Author bio */}
        <div className="mb-12">
          <AuthorCard />
        </div>

        {/* Newsletter CTA */}
        <div className="mb-12 max-w-lg mx-auto">
          <BlogCtaCard variant="newsletter" />
        </div>

        {/* Related posts */}
        <div className="mb-24">
          <RelatedPosts currentPostId={post.id} category={post.category} />
        </div>

        {/* ======================== COMMENTS SECTION ======================== */}
        <section className="pt-16 border-t border-border">
          <div className="flex items-center gap-4 mb-12">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h3 className="text-3xl font-black tracking-tight">
              {comments.length} Commentaire{comments.length !== 1 && 's'}
            </h3>
          </div>

          {/* Comments list */}
          <div className="space-y-6 mb-16">
            {comments.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8">
                Aucun commentaire pour le moment. Soyez le premier a reagir !
              </p>
            ) : (
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-8 rounded-3xl bg-secondary/20 border border-transparent hover:border-border transition-all"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{comment.author}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Comment form */}
          {isVerified ? (
            /* ---- VERIFIED: show simple comment box ---- */
            <form onSubmit={handleSubmitComment} className="p-8 rounded-3xl bg-card border border-border shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                    {session!.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{session!.name}</p>
                    <p className="text-[11px] text-muted-foreground">{session!.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSession}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Changer
                </button>
              </div>

              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Qu'en pensez-vous ?"
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none outline-none mb-4"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-60"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Publier
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : otpStatus === 'sent' || otpStatus === 'verifying' || otpStatus === 'error' || needsReverification ? (
            /* ---- OTP VERIFICATION ---- */
            <div className="p-8 rounded-3xl bg-card border border-border shadow-lg">
              <OtpVerification
                email={session?.email || identifyForm.email}
                otpStatus={otpStatus}
                otpError={otpError}
                onVerify={(code, rem) => verifyOtp(code, rem)}
                onResend={() => requestOtp(session?.email || identifyForm.email, session?.name || identifyForm.name)}
                remember={rememberMe}
                onRememberChange={setRememberMe}
              />
            </div>
          ) : (
            /* ---- NOT IDENTIFIED: show identification form ---- */
            <form onSubmit={handleIdentify} className="p-8 rounded-3xl bg-card border border-border shadow-lg">
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">Rejoindre la discussion</h4>
              <p className="text-[12px] text-muted-foreground mb-6">
                Identifiez-vous pour commenter. Un code de verification sera envoye a votre email.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2">
                    <User className="w-3 h-3 inline mr-1" />
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={identifyForm.name}
                    onChange={(e) => setIdentifyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2">
                    <Mail className="w-3 h-3 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={identifyForm.email}
                    onChange={(e) => setIdentifyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  * Un code sera envoye a votre email
                </p>
                <button
                  type="submit"
                  disabled={otpStatus === 'sending'}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-60"
                >
                  {otpStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Recevoir le code
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

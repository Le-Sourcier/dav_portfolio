import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle, FileText, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/queries';
import { BlogCard } from './blog/BlogCard';
import { BlogCtaCard } from './blog/BlogCtaCard';
import type { BlogPost } from '@/types/admin.types';

type GridItem =
  | { type: 'post'; post: BlogPost; index: number }
  | { type: 'cta'; variant: 'newsletter' | 'services' | 'booking' };

export function BlogPage() {
  const { data: posts = [], isLoading, isError } = useBlogPosts(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  // Filter posts
  const filtered = useMemo(() => {
    let result = posts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    return result;
  }, [posts, search, activeCategory]);

  // Hero = first post (only when no search/filter active)
  const heroPost = !search && !activeCategory && filtered.length > 0 ? filtered[0] : null;
  const gridPosts = heroPost ? filtered.slice(1) : filtered;

  // Build grid with CTAs interspersed
  const gridItems = useMemo<GridItem[]>(() => {
    const items: GridItem[] = [];
    let ctaNewsletterInserted = false;
    let ctaServicesInserted = false;

    gridPosts.forEach((post, i) => {
      items.push({ type: 'post', post, index: i });
      if (i === 2 && !ctaNewsletterInserted) {
        items.push({ type: 'cta', variant: 'newsletter' });
        ctaNewsletterInserted = true;
      }
      if (i === 5 && !ctaServicesInserted) {
        items.push({ type: 'cta', variant: 'services' });
        ctaServicesInserted = true;
      }
    });

    // If few posts, still add CTAs at the end
    if (!ctaNewsletterInserted && gridPosts.length > 0) {
      items.push({ type: 'cta', variant: 'newsletter' });
    }
    if (!ctaServicesInserted && gridPosts.length > 2) {
      items.push({ type: 'cta', variant: 'services' });
    }

    return items;
  }, [gridPosts]);

  const hasContent = !isLoading && !isError && posts.length > 0;

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" />
            Retour a l'accueil
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase"
          >
            NOTRE <span className="text-primary">BLOG</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl font-medium mx-auto md:mx-0"
          >
            Pensees, tutoriels et reflexions sur le design, la technologie et la creativite numerique.
          </motion.p>
        </div>

        {/* Search + Category filters */}
        {hasContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-11 pr-10 py-3 bg-card border border-border rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category chips */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    !activeCategory
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tous
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Results count */}
        {hasContent && (search || activeCategory) && (
          <p className="text-sm text-muted-foreground font-medium mb-6">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} trouve{filtered.length !== 1 ? 's' : ''}
            {activeCategory && <> dans <strong className="text-foreground">{activeCategory}</strong></>}
            {search && <> pour "<strong className="text-foreground">{search}</strong>"</>}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-muted-foreground text-sm font-medium">Chargement des articles...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Impossible de charger les articles</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Le serveur ne repond pas pour le moment. Veuillez reessayer dans quelques instants.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all"
            >
              Reessayer
            </button>
          </motion.div>
        )}

        {/* Empty (no posts at all) */}
        {!isLoading && !isError && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun article pour le moment</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Les premiers articles arrivent bientot. Restez connectes !
            </p>
          </motion.div>
        )}

        {/* No results for search/filter */}
        {hasContent && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">Aucun resultat</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Essayez de modifier vos criteres de recherche ou de supprimer les filtres.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory(null); }}
              className="text-primary font-bold text-sm hover:underline"
            >
              Reinitialiser les filtres
            </button>
          </motion.div>
        )}

        {/* Hero Post */}
        {heroPost && (
          <div className="mb-12">
            <BlogCard post={heroPost} variant="hero" />
          </div>
        )}

        {/* Posts grid with CTAs */}
        {gridItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridItems.map((item, i) =>
              item.type === 'post' ? (
                <BlogCard key={item.post.id} post={item.post} index={item.index} />
              ) : (
                <BlogCtaCard key={`cta-${item.variant}`} variant={item.variant} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

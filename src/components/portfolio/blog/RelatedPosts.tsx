import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useBlogPosts } from '@/hooks/queries';
import { BlogCard } from './BlogCard';

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
}

export function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
  const { data: posts = [] } = useBlogPosts(true);

  const related = useMemo(() => {
    const others = posts.filter((p) => p.id !== currentPostId);
    // Same category first
    const sameCategory = others.filter((p) => p.category === category);
    // Fill with recent posts from other categories
    const differentCategory = others.filter((p) => p.category !== category);
    return [...sameCategory, ...differentCategory].slice(0, 3);
  }, [posts, currentPostId, category]);

  if (related.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Continuez la lecture</p>
          <h3 className="text-2xl font-black tracking-tight">Articles similaires</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
          >
            <BlogCard post={post} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

import { useMemo } from 'react';
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
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Continuez la lecture</p>
        <h3 className="text-2xl font-black tracking-tight">Articles similaires</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {related.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  );
}

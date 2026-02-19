import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/queries';
import { BlogCard } from './blog/BlogCard';

export function LatestBlogPosts() {
  const { data: posts = [], isLoading: loading } = useBlogPosts(true);

  const latestPosts = posts.slice(0, 3);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4 block"
            >
              Dernieres nouvelles
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
            >
              ARTICLES & <br />
              <span className="text-muted-foreground/30 italic">Reflexions.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/blog"
              className="group flex items-center gap-3 px-8 py-4 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-border"
            >
              Lire tout le blog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {latestPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

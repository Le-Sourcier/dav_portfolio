import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@/types/admin.types';
import { useTranslation } from 'react-i18next';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'hero';
  index?: number;
}

export function BlogCard({ post, variant = 'default', index = 0 }: BlogCardProps) {
  const { t } = useTranslation();
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  if (variant === 'hero') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="group grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card/50 backdrop-blur-sm border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500"
      >
        <Link to={`/blog/${post.id}`} className="relative aspect-video lg:aspect-auto overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-6 left-6">
            <span className="px-4 py-1.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-border">
              {post.category}
            </span>
          </div>
        </Link>

        <div className="p-10 lg:p-14 flex flex-col justify-center">
          <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {date}
            </div>
            <div className="flex items-center gap-1.5 text-primary/60">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </div>
            {post.viewCount > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground/60">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount}
              </div>
            )}
          </div>

          <Link to={`/blog/${post.id}`}>
            <h2 className="text-3xl lg:text-4xl font-black leading-tight mb-4 group-hover:text-primary transition-colors tracking-tight">
              {post.title}
            </h2>
          </Link>

          <p className="text-muted-foreground mb-8 line-clamp-3 font-medium leading-relaxed text-lg">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{post.author}</span>
            </div>
            <Link
              to={`/blog/${post.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all"
            >
              {t('blog.readArticle')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col bg-card/50 backdrop-blur-sm border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
    >
      <Link to={`/blog/${post.id}`} className="relative aspect-video overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-border">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {date}
          </div>
          <div className="flex items-center gap-1.5 text-primary/60">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </div>
        </div>

        <Link to={`/blog/${post.id}`}>
          <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-muted-foreground mb-8 line-clamp-2 font-medium leading-relaxed">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{post.author}</span>
          </div>
          <Link
            to={`/blog/${post.id}`}
            className="p-3 rounded-2xl bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/queries';

export function LatestBlogPosts() {
  const { data: posts = [], isLoading: loading } = useBlogPosts(true);

  // Get the 3 latest posts
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
              Dernières nouvelles
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
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col bg-card/50 backdrop-blur-sm border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 shadow-sm"
            >
              <Link to={`/blog/${post.id}`} className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-border shadow-sm">
                    {post.category}
                  </span>
                </div>
              </Link>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-primary/60">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                </div>
                
                <Link to={`/blog/${post.id}`}>
                  <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground mb-8 line-clamp-2 font-medium leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                       <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{post.author}</span>
                  </div>
                  <Link 
                    to={`/blog/${post.id}`}
                    className="p-3 rounded-2xl bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
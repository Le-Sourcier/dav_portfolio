import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../data/mockData';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/queries';
import { useTranslation } from 'react-i18next';
import { useLocalizedField } from '@/hooks/useLocalizedField';

export function ProjectGallery() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const [filter, setFilter] = useState<string>('All');
  const { data: projects = [], isLoading } = useProjects();

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = projects.filter(
    (p: Project) => filter === 'All' || p.category === filter
  );

  // Hide entire section if no projects
  if (!isLoading && projects.length === 0) return null;

  return (
    <section id="work" className="py-32 px-6 md:px-12 lg:px-24 transition-colors duration-500 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-12 h-[1px] bg-primary" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{t('gallery.label')}</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              {t('gallery.title')} <span className="text-muted-foreground/40 italic">{t('gallery.titleAccent')}</span>
            </motion.h2>
          </div>
          
          <div className="flex flex-wrap gap-2 md:pb-2">
            {categories.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-primary text-primary-foreground shadow-xl' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-border'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="break-inside-avoid group relative overflow-hidden rounded-3xl bg-secondary"
              >
                <Link to={`/work/${project.id}`} className="block">
                  <div className={`relative overflow-hidden ${idx % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">{project.category}</p>
                        <h3 className="text-2xl font-bold text-white mb-4">{localize(project.title, project.title_en)}</h3>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                          <span>{t('gallery.viewCase')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
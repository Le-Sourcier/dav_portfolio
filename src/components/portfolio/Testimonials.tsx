import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisibleTestimonials } from '@/hooks/queries';
import { useTranslation } from 'react-i18next';
import { useLocalizedField } from '@/hooks/useLocalizedField';

const ITEMS_PER_PAGE = 4;

export function Testimonials() {
  const { data: testimonials = [], isLoading } = useVisibleTestimonials();
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const visible = useMemo(
    () => testimonials.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE),
    [testimonials, page]
  );

  if (!isLoading && testimonials.length === 0) return null;
  if (isLoading) return null;

  const avgRating = testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length;

  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/5 rounded-full blur-[150px] -z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-1 mb-6 text-accent"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-current' : 'opacity-30'}`} />
            ))}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            {t('testimonials.title')} <span className="text-white/40 italic">{t('testimonials.titleAccent')}</span>
          </motion.h2>
          <p className="text-primary-foreground/60 text-xl max-w-2xl">
            {t('testimonials.subtitle')}
          </p>
          {testimonials.length > 1 && (
            <p className="text-primary-foreground/30 text-sm mt-3 font-medium">
              {t('testimonials.count', { count: testimonials.length })}
            </p>
          )}
        </div>

        {/* Testimonials grid with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
          >
            {visible.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group relative"
              >
                <Quote className="absolute top-8 right-8 md:top-12 md:right-12 w-10 h-10 md:w-16 md:h-16 text-white/5 group-hover:text-white/10 transition-colors" />

                {/* Rating */}
                {t.rating && (
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < t.rating! ? 'fill-current text-yellow-400' : 'text-white/10'}`} />
                    ))}
                  </div>
                )}

                <p className="text-lg md:text-2xl font-medium leading-snug mb-8 md:mb-12 relative z-10 line-clamp-6">
                  "{localize(t.content, t.content_en)}"
                </p>

                <div className="flex items-center gap-4 md:gap-6 relative z-10 pt-6 md:pt-8 border-t border-white/10">
                  {t.avatar ? (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/20 group-hover:border-white/50 transition-colors shrink-0">
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-lg md:text-xl font-black text-white/60">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-base md:text-lg truncate">{t.name}</h4>
                    <p className="text-primary-foreground/50 font-medium text-sm truncate">
                      {localize(t.role, t.role_en)}{t.company ? ` - ${t.company}` : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === page ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-3 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

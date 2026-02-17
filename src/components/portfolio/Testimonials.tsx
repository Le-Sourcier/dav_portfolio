import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useVisibleTestimonials } from '@/hooks/queries';

export function Testimonials() {
  const { data: testimonials = [], isLoading } = useVisibleTestimonials();

  // Hide section if no testimonials
  if (!isLoading && testimonials.length === 0) return null;
  if (isLoading) return null;

  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/5 rounded-full blur-[150px] -z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-1 mb-6 text-accent"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            Voices of <span className="text-white/40 italic">Partners.</span>
          </motion.h2>
          <p className="text-primary-foreground/60 text-xl max-w-2xl">
            Success is best measured by the impact we have on the people we work with.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="p-12 md:p-16 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group relative"
            >
              <Quote className="absolute top-12 right-12 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />

              <p className="text-2xl md:text-3xl font-medium leading-snug mb-12 relative z-10">
                "{t.content}"
              </p>

              <div className="flex items-center gap-6 relative z-10 pt-8 border-t border-white/10">
                {t.avatar && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 group-hover:border-white/50 transition-colors">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-xl">{t.name}</h4>
                  <p className="text-primary-foreground/50 font-medium tracking-wide">
                    {t.role}{t.company ? ` - ${t.company}` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

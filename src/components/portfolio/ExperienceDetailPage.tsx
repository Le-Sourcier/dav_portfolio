import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Building2, ExternalLink,
  Cpu, Trophy, AlertCircle, ChevronRight, Share2,
  ArrowUp, Mail, Layers, Clock,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { useExperience } from '@/hooks/queries';
import { toast } from 'sonner';
import type { Experience } from '@/types/admin.types';
import { useTranslation } from 'react-i18next';

// ======================== COMPONENT ========================

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scrollY } = useScroll();
  const { t } = useTranslation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: apiExperience, isLoading, isError } = useExperience(id || '');
  const experience = (apiExperience as Experience | undefined) || null;

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Show back-to-top button after scroll
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (v) => setShowBackToTop(v > 600));
    return unsubscribe;
  }, [scrollY]);

  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scale = useTransform(scrollY, [0, 200], [1, 1.1]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !experience) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
        <div className="max-w-2xl mx-auto text-center py-24">
          <Link to="/#about" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            {t('experience.backProfile')}
          </Link>
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">
            {isError ? t('experience.unavailable') : t('experience.notFound')}
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            {isError
              ? t('experience.unavailableDesc')
              : t('experience.notFoundDesc')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/#about" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all">
              {t('experience.viewProfile')}
            </Link>
            {isError && (
              <button onClick={() => window.location.reload()} className="px-6 py-3 border border-border rounded-2xl font-bold text-sm hover:bg-secondary transition-all">
                {t('experience.retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Build table of contents from available sections
  const tocItems: { id: string; label: string }[] = [];
  if (experience.description) tocItems.push({ id: 'contexte', label: t('experience.context') });
  if (experience.details?.length) tocItems.push({ id: 'responsabilites', label: t('experience.responsibilities') });
  if (experience.stack?.length) tocItems.push({ id: 'stack', label: t('experience.techStack') });
  if (experience.challenges?.length) tocItems.push({ id: 'defis', label: t('experience.challenges') });

  const defaultCover = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('experience.linkCopied'));
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ======================== HERO ======================== */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0">
          <img src={experience.coverImage || defaultCover} alt={experience.company} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-background/20 to-background" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-12">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Link to="/#about" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                {t('experience.backProfile')}
              </Link>

              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-4 py-1">
                  {experience.company}
                </Badge>
                <Badge variant="outline" className="text-white border-white/20 backdrop-blur-md px-4 py-1">
                  {experience.dates}
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase leading-[0.9]">
                {experience.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">{experience.company}</span>
                </div>
                {experience.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">{experience.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">{experience.dates}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================== CONTENT ======================== */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-24">

              {/* Description */}
              {experience.description && (
                <motion.div id="contexte" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <SectionHeader label={t('experience.context')} />
                  <div className="text-lg md:text-xl font-medium leading-relaxed text-muted-foreground">
                    <MarkdownRenderer content={experience.description} />
                  </div>
                </motion.div>
              )}

              {/* Details */}
              {experience.details && experience.details.length > 0 && (
                <motion.div id="responsabilites" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <SectionHeader label={t('experience.responsibilities')} />
                  <div className="grid gap-6">
                    {experience.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-secondary/30 border border-border/50">
                        <div className="mt-1"><ChevronRight className="w-5 h-5 text-primary" /></div>
                        <p className="font-medium">{detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stack */}
              {experience.stack && experience.stack.length > 0 && (
                <motion.div id="stack" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <SectionHeader label={t('experience.techStack')} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {experience.stack.map((tech, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Cpu className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-tighter">{tech}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Challenges */}
              {experience.challenges && experience.challenges.length > 0 && (
                <motion.div id="defis" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <SectionHeader label={t('experience.challenges')} />
                  <div className="space-y-8">
                    {experience.challenges.map((challenge, idx) => (
                      <div key={idx} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-lg font-medium text-foreground/80 leading-relaxed">{challenge}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Illustrative images */}
              {experience.illustrativeImages && experience.illustrativeImages.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <SectionHeader label={t('experience.gallery')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {experience.illustrativeImages.map((img, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-border shadow-lg">
                        <img src={img} alt={`Illustration ${idx + 1}`} className="w-full h-64 object-cover" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ======================== SIDEBAR ======================== */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="sticky top-32 space-y-8">

                {/* Table of contents */}
                {tocItems.length > 1 && (
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Layers className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-tight">{t('experience.toc')}</h3>
                    </div>
                    <nav className="space-y-1">
                      {tocItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Quick info card */}
                <div className="p-6 rounded-[2rem] bg-secondary/20 border border-border">
                  <h3 className="text-sm font-black uppercase tracking-tight mb-6">{t('experience.quickInfo')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('experience.company')}</p>
                        <p className="text-sm font-bold">{experience.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('experience.period')}</p>
                        <p className="text-sm font-bold">{experience.dates}</p>
                      </div>
                    </div>
                    {experience.location && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('experience.location')}</p>
                          <p className="text-sm font-bold">{experience.location}</p>
                        </div>
                      </div>
                    )}
                    {experience.stack && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('experience.technologies')}</p>
                          <p className="text-sm font-bold">{t('experience.toolsCount', { count: experience.stack.length })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                {experience.achievements && experience.achievements.length > 0 && (
                  <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-tight">{t('experience.achievements')}</h3>
                    </div>
                    <div className="space-y-6">
                      {experience.achievements.map((ach, idx) => (
                        <div key={idx} className="group">
                          <div className="flex items-start gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                            <h4 className="font-black text-xs uppercase tracking-wider">{ach.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground pl-5 font-medium leading-relaxed">{ach.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {experience.links && experience.links.length > 0 && (
                  <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border">
                    <h3 className="text-sm font-black uppercase tracking-tight mb-6">{t('experience.usefulLinks')}</h3>
                    <div className="space-y-3">
                      {experience.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-all group"
                        >
                          <span className="font-bold text-xs uppercase tracking-tight">{link.label}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm font-bold"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('experience.share')}
                  </button>
                  <Link
                    to="/#contact"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-bold"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to top */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center transition-all z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}

// ======================== SECTION HEADER ========================

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-12 h-[2px] bg-primary rounded-full" />
      <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{label}</span>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Project } from '../../data/mockData';
import { ProjectMetrics } from './ProjectMetrics';
import { VisualDiagram } from './VisualDiagram';
import {
  ArrowLeft,
  Target,
  Lightbulb,
  Trophy,
  ArrowRight,
  Share2,
  Layout,
  Cpu,
  CheckCircle2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/hooks/queries';
import { useTranslation } from 'react-i18next';
import { useLocalizedField } from '@/hooks/useLocalizedField';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const { data: project, isLoading, isError } = useProject(id || '');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
        <div className="max-w-2xl mx-auto text-center py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            {t('projectDetail.backHome')}
          </Link>
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">
            {isError ? t('projectDetail.unavailable') : t('projectDetail.notFound')}
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            {isError
              ? t('projectDetail.unavailableDesc')
              : t('projectDetail.notFoundDesc')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all">
              {t('projectDetail.viewAll')}
            </Link>
            {isError && (
              <button onClick={() => window.location.reload()} className="px-6 py-3 border border-border rounded-xl font-bold text-sm hover:bg-secondary transition-all">
                {t('projectDetail.retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: localize(project.title, project.title_en),
      text: localize(project.description, project.description_en),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(t('projectDetail.shareSuccess'));
        return;
      }
    } catch (err) {}

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('projectDetail.linkCopied'));
    } catch (err) {
      toast.error(t('projectDetail.linkCopyError'));
    }
  };

  const handleLaunch = () => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
      toast.info(t('projectDetail.opening', { title: localize(project.title, project.title_en) }));
    } else {
      toast.error(t('projectDetail.urlUnavailable'));
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[100] origin-left" style={{ scaleX }} />

      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:px-24 pb-24">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-start gap-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold hover:bg-white/20 transition-all">
                <ArrowLeft className="w-4 h-4" />
                {t('projectDetail.back')}
              </button>
              
              <div>
                <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block">{project.category}</span>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8">
                  {localize(project.title, project.title_en)}
                </h1>
              </div>

              <div className="flex flex-wrap gap-8 items-center text-white/80 font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Layout className="w-5 h-5" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-white/50">{t('projectDetail.services')}</span>
                    <span className="text-sm">{t('projectDetail.servicesValue')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Cpu className="w-5 h-5" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-white/50">Stack</span>
                    <span className="text-sm">React, Node.js</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-8 space-y-32">
            <section className="space-y-8">
              <div className="flex items-center gap-4 text-primary">
                <div className="h-[1px] w-12 bg-primary" />
                <span className="text-xs font-black uppercase tracking-widest">{t('projectDetail.intro')}</span>
              </div>
              <p className="text-2xl md:text-4xl leading-[1.2] font-semibold text-foreground">{localize(project.description, project.description_en)}</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-8"><Target className="w-7 h-7" /></div>
                <h3 className="text-2xl font-bold">{t('projectDetail.challenge')}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{localize(project.problem, project.problem_en)}</p>
              </div>
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8"><Lightbulb className="w-7 h-7" /></div>
                <h3 className="text-2xl font-bold">{t('projectDetail.approach')}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{localize(project.solution, project.solution_en)}</p>
              </div>
            </section>

            {(project.solutionDiagram || project.impactGraph) && (
              <section className="space-y-16">
                <div className="flex items-center gap-4 text-primary">
                  <div className="h-[1px] w-12 bg-primary" />
                  <span className="text-xs font-black uppercase tracking-widest">{t('projectDetail.architecture')}</span>
                </div>
                <VisualDiagram solutionDiagram={project.solutionDiagram} impactGraph={project.impactGraph} />
              </section>
            )}

            {project.metrics && (
              <section className="space-y-16">
                <ProjectMetrics metrics={project.metrics} chartData={project.chartData} category={project.category} />
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              <div className="p-8 rounded-xl bg-card border border-border">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-10 flex items-center gap-3"><Trophy className="w-5 h-5" />{t('projectDetail.keyWins')}</h4>
                <ul className="space-y-8 mb-12">
                  {project.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
                      <span className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{result}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-4">
                  <button onClick={handleLaunch} className="w-full py-5 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/20 transition-all">{t('projectDetail.launch')}</button>
                  <button onClick={handleShare} className="w-full py-5 bg-secondary text-foreground rounded-xl font-black text-sm uppercase tracking-widest">{t('projectDetail.share')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
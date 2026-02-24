import React from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Award as AwardIcon, CheckCircle2, Zap, Cpu, Layout, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useExperiences } from '@/hooks/queries';
import { useTranslation } from 'react-i18next';
import { useLocalizedField } from '@/hooks/useLocalizedField';

export function About() {
  const navigate = useNavigate();
  const profile = useProfile();
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const { data: experiences = [] } = useExperiences();
  const profileImage = profile.avatar;

  const handleDownloadResume = () => {
    let content = `CV ${profile.name} - ${profile.title}

`;
    content += `${t('about.cvExperience')}
`;
    experiences.forEach(exp => {
      content += `- ${exp.title} @ ${exp.company} (${exp.dates})
  ${exp.description}
`;
    });
    content += `
${t('about.cvSkills')}
`;
    content += `- Frontend: ${profile.skills.frontend.join(', ')}
`;
    content += `- Backend: ${profile.skills.backend.join(', ')}
`;
    content += `- ${t('about.tools')}: ${profile.skills.tools.join(', ')}
`;
    content += `
${t('about.cvEducation')}
`;
    profile.education.forEach(edu => {
      content += `- ${edu.degree} en ${edu.field}
  ${edu.description}
`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CV_${profile.name.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const skillCategories = [
    { label: 'Frontend', items: profile.skills.frontend, icon: <Layout className="w-3.5 h-3.5" /> },
    { label: 'Backend', items: profile.skills.backend, icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: t('about.tools'), items: profile.skills.tools, icon: <Zap className="w-3.5 h-3.5" /> },
  ].filter(cat => cat.items.length > 0);

  const [firstName, ...lastNameParts] = profile.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const handleExperienceClick = (id: string) => {
    navigate(`/experience/${id}`);
  };

  return (
    <section id="about" className="py-32 px-6 md:px-12 lg:px-24 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden group border border-white/5 shadow-2xl">
              <img 
                src={profileImage} 
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            </div>
            
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -right-6 md:-right-12 bg-card/80 backdrop-blur-2xl border border-border p-8 rounded-[2.5rem] shadow-2xl max-w-[260px] hidden sm:block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-4xl tracking-tighter text-primary">5+</h4>
              </div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                {t('about.yearsExp')}
              </p>
            </motion.div>
          </motion.div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-[2px] bg-primary rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('about.label')}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-10 uppercase">
                {firstName} <br /><span className="text-primary italic">{lastName}</span>
              </h2>
              <p className="text-2xl md:text-3xl text-muted-foreground leading-tight font-medium">
                {profile.title.split('&')[0]} & Expert en <span className="text-foreground border-b-4 border-primary/20">{t('about.scalable')}</span>
              </p>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed mb-16 max-w-2xl font-medium"
            >
              {profile.bio}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 mb-20">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">{t('about.expertise')}</h4>
                <div className="space-y-5">
                  {skillCategories.map((cat) => (
                    <div key={cat.label}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-primary">
                          {cat.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-bold tracking-tight hover:bg-primary hover:text-primary-foreground transition-all cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">{t('about.education')}</h4>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="min-w-0">
                      <p className="font-black text-sm leading-snug">{edu.degree}</p>
                      <p className="text-xs text-muted-foreground font-bold italic">{edu.field}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              <button 
                onClick={handleDownloadResume}
                className="group flex items-center gap-4 px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] font-black hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                {t('about.downloadCv')}
              </button>
              <a href="#contact" className="flex items-center gap-4 px-10 py-5 border-2 border-border rounded-[2rem] font-black hover:bg-secondary transition-all hover:border-primary/30">
                {t('about.contactMe')}
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {experiences.length > 0 && (
        <div className="mt-48">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12">
            <div className="max-w-2xl">
              <div className="w-12 h-1 bg-primary mb-8" />
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('about.recentLabel')}</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
                {t('about.recentTitle')} <span className="text-primary">{t('about.recentTitleAccent')}</span>
              </h3>
              <p className="text-xl text-muted-foreground font-medium">
                {t('about.recentDesc')}
                <span className="text-primary font-bold"> {t('about.recentCta')}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleExperienceClick(exp.id)}
                className="p-10 rounded-[3rem] bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-card transition-all duration-500 group relative cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-xs font-black text-primary/40 group-hover:text-primary transition-colors tracking-widest">{exp.dates}</span>
                  <AwardIcon className="w-6 h-6 text-primary/20 group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-black text-xl mb-3 group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{localize(exp.title, exp.title_en)}</h4>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60 mb-8">{exp.company}</p>
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  {t('about.viewDetails')}
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
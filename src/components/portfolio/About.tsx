import React from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Award as AwardIcon, CheckCircle2, Code2, Zap, Cpu, Database, Layout, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cvData } from '../../data/cvData';
import { useProfile } from '@/hooks/useProfile';
import { useExperiences } from '@/hooks/queries';

export function About() {
  const navigate = useNavigate();
  const profile = useProfile();
  const { data: experiences = [] } = useExperiences();
  const profileImage = profile.avatar;

  const handleDownloadResume = () => {
    const { skills, education } = cvData;

    let content = `CV ${profile.name} - ${profile.title}

`;
    content += `EXPÉRIENCE
`;
    experiences.forEach(exp => {
      content += `- ${exp.title} @ ${exp.company} (${exp.dates})
  ${exp.description}
`;
    });
    content += `
COMPÉTENCES
`;
    content += `- Frontend: ${skills.frontend.join(', ')}
`;
    content += `- Backend: ${skills.backend.join(', ')}
`;
    content += `- Outils: ${skills.tools.join(', ')}
`;
    content += `
FORMATION
`;
    education.forEach(edu => {
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

  const getSkillIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('react') || n.includes('next') || n.includes('frontend')) return <Layout className="w-4 h-4" />;
    if (n.includes('node') || n.includes('python') || n.includes('backend')) return <Cpu className="w-4 h-4" />;
    if (n.includes('sql') || n.includes('db') || n.includes('redis')) return <Database className="w-4 h-4" />;
    if (n.includes('docker') || n.includes('git') || n.includes('aws')) return <Zap className="w-4 h-4" />;
    return <Code2 className="w-4 h-4" />;
  };

  const allSkills = [
    ...cvData.skills.frontend.slice(0, 3),
    ...cvData.skills.backend.slice(0, 2),
    ...cvData.skills.tools.slice(0, 1)
  ].map(name => ({ name, icon: getSkillIcon(name) }));

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
                Années d'expertise technique cumulées
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
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Le Profil</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-10 uppercase">
                {firstName} <br /><span className="text-primary italic">{lastName}</span>
              </h2>
              <p className="text-2xl md:text-3xl text-muted-foreground leading-tight font-medium">
                {profile.title.split('&')[0]} & Expert en <span className="text-foreground border-b-4 border-primary/20">Solutions Scalables.</span>
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
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Expertise</h4>
                <div className="grid grid-cols-1 gap-4">
                  {allSkills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {skill.icon}
                      </div>
                      <span className="text-sm font-bold tracking-tight">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Formation</h4>
                <div className="space-y-4">
                  {cvData.education.map((edu, i) => (
                    <div key={i}>
                      <p className="font-black text-sm uppercase tracking-wider">{edu.degree}</p>
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
                Télécharger mon CV
              </button>
              <a href="#contact" className="flex items-center gap-4 px-10 py-5 border-2 border-border rounded-[2rem] font-black hover:bg-secondary transition-all hover:border-primary/30">
                Me contacter
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
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Dernieres Collaborations</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
                Experiences <span className="text-primary">Recentes</span>
              </h3>
              <p className="text-xl text-muted-foreground font-medium">
                Un parcours marque par le developpement de solutions innovantes et l'excellence technique.
                <span className="text-primary font-bold"> Cliquez sur une experience pour voir les details.</span>
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
                <h4 className="font-black text-xl mb-3 group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{exp.title}</h4>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60 mb-8">{exp.company}</p>
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  Voir les détails
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
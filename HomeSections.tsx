
import React from 'react';
import { ChevronRight, Star, FileDown, Terminal, ExternalLink, Github, Mail, Phone, MapPin, Linkedin, Layers } from 'lucide-react';
import { PortfolioData } from './types';

export const Hero: React.FC<{ data: PortfolioData }> = ({ data }) => (
  <section id="top" className="relative pt-32 pb-20 px-6 min-h-[80vh] flex items-center">
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]" />
    </div>
    
    <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6 border border-blue-500/10">
          <Star className="w-3 h-3 fill-current" /> {data.role}
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight dark:text-white text-gray-900 uppercase">
          DESIGNING <br /> THE <span className="text-gradient">FUTURE.</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg">{data.bio}</p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-md flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            Voir mes travaux <ChevronRight className="w-5 h-5" />
          </button>
          <a href={data.cvUrl} className="px-8 py-4 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-md flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            <FileDown className="w-5 h-5" /> Télécharger mon CV
          </a>
        </div>
      </div>
      
      <div className="hidden md:flex justify-center">
        <div className="relative w-72 h-72">
          <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 opacity-5 dark:opacity-10 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl -rotate-3 overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
             <Terminal className="w-20 h-20 text-white/10" />
             <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-3xl font-black">99%</div>
                <div className="text-[9px] uppercase font-bold tracking-widest opacity-60">Success Rate</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const ProjectsSection: React.FC<{ projects: PortfolioData['projects'], setView: any }> = ({ projects, setView }) => (
  <section id="projects" className="py-20 px-6 scroll-mt-24">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black mb-4 tracking-tight uppercase dark:text-white text-gray-900">Selected Works</h2>
          <p className="text-gray-600 dark:text-gray-400">Projets phares alliant innovation technique et expérience utilisateur.</p>
        </div>
        <button onClick={() => setView('blog')} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
          Lire le blog technique <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, i) => (
          <div key={i} className="group bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 hover:border-blue-500/20 transition-all shadow-sm">
             <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex flex-col justify-end p-8">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40 group-hover:opacity-60 transition-all" />
               <div className="relative z-10">
                 <div className="flex flex-wrap gap-2 mb-3">
                   {project.stack.map(s => <span key={s} className="px-2 py-0.5 bg-white/10 backdrop-blur rounded text-[8px] font-black uppercase tracking-widest text-white">{s}</span>)}
                 </div>
                 <h3 className="text-2xl font-black text-white">{project.title}</h3>
               </div>
             </div>
             <div className="p-8">
               <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">{project.description}</p>
               <div className="flex gap-4">
                 {project.demoUrl && <a href={project.demoUrl} className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">LIVE DEMO <ExternalLink className="w-3 h-3" /></a>}
                 {project.githubUrl && <a href={project.githubUrl} className="text-xs font-black text-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center gap-1">VIEW SOURCE <Github className="w-3 h-3" /></a>}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ExperienceSection: React.FC<{ experiences: PortfolioData['experiences'] }> = ({ experiences }) => (
  <section id="experience" className="py-20 px-6 scroll-mt-24 bg-gray-50/50 dark:bg-white/[0.01]">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-12">
        <Layers className="w-6 h-6 text-blue-500" />
        <h2 className="text-3xl font-black tracking-tight uppercase dark:text-white text-gray-900">Parcours</h2>
      </div>
      <div className="space-y-16 relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600/50 to-transparent ml-4 md:ml-0" />
        {experiences.map((exp, i) => (
          <div key={i} className="relative pl-10 group">
            <div className="absolute left-[-3px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-600/10" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block">{exp.period}</span>
            <h3 className="text-xl font-black mb-1 dark:text-white text-gray-900">{exp.role}</h3>
            <p className="text-sm font-bold text-gray-500 mb-4">{exp.company} — {exp.location}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">{exp.description}</p>
            <div className="flex flex-wrap gap-2">
              {exp.tasks.map((task, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-white dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10 text-[11px] text-gray-600 dark:text-gray-400">
                  {task}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ContactSection: React.FC<{ contact: PortfolioData['contact'] }> = ({ contact }) => (
  <section id="contact" className="py-20 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="bg-blue-600 rounded-3xl p-10 md:p-16 overflow-hidden relative shadow-xl shadow-blue-600/20">
         <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><Mail className="w-48 h-48" /></div>
         <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
           <div>
             <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight uppercase">Let's build <br /> together.</h2>
             <p className="text-blue-100 mb-10 max-w-sm">Une idée, un projet ? Discutons-en et créons quelque chose d'exceptionnel.</p>
             <div className="flex flex-wrap gap-4">
                <a href={`mailto:${contact.email}`} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:scale-105 transition-all">Start a project</a>
                <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-xl text-white font-bold text-sm flex items-center gap-2">
                   <Phone className="w-4 h-4" /> {contact.phone}
                </div>
             </div>
           </div>
           <div className="space-y-3">
              {[
                { icon: Linkedin, label: 'LinkedIn', value: contact.linkedin },
                { icon: Github, label: 'GitHub', value: contact.github },
                { icon: MapPin, label: 'Location', value: contact.address },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/5 text-white">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest">{item.label}</p>
                     <p className="text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </div>
    </div>
  </section>
);


import React, { useState } from 'react';
import { 
  ChevronRight, Star, FileDown, Terminal, ExternalLink, 
  Github, Mail, Linkedin, MapPin, Cpu, Package, 
  Code, Layers, Smartphone, Server, Globe, Shield, 
  Database, Cloud, Zap, Laptop, Download, GitBranch,
  Box, Hexagon, Workflow, Phone
} from 'lucide-react';
import { PortfolioData, Project } from '../types/index';

const categoryIcons: Record<string, any> = {
  "Frontend & Mobile": Smartphone,
  "Backend & API": Server,
  "Data & Infrastructure": Database,
  "Spécialités": Workflow,
  "Frontend": Globe,
  "Backend": Server,
  "Mobile": Smartphone,
  "Infrastructure": Cloud,
  "Security": Shield
};

const categoryGradients: Record<string, string> = {
  "Frontend & Mobile": "from-blue-500/20 to-cyan-500/20",
  "Backend & API": "from-indigo-500/20 to-purple-500/20",
  "Data & Infrastructure": "from-emerald-500/20 to-teal-500/20",
  "Spécialités": "from-orange-500/20 to-red-500/20"
};

export const Hero: React.FC<{ data: PortfolioData }> = ({ data }) => (
  <section id="top" className="relative pt-32 pb-20 px-6 min-h-[80vh] flex items-center overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
       <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full blur-[120px]" />
       <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[150px]" />
    </div>
    
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-500/20 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-current" /> {data.role}
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-8 dark:text-white uppercase leading-[0.9] tracking-tighter">
          ARCHITECTING <br />
          <span className="text-gradient">EXCELLENCE.</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-md leading-relaxed font-medium">
          {data.bio}
        </p>
        <div className="flex flex-wrap gap-5">
          <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40 active:scale-95">Explorer mes travaux</button>
          <a href={data.cvUrl} className="px-8 py-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-all backdrop-blur-md">
            <FileDown className="w-4 h-4" /> Curriculum Vitae
          </a>
        </div>
      </div>
      <div className="hidden md:flex justify-end">
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
           <div className="w-80 h-80 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[48px] border border-white/10 p-10 flex flex-col justify-between shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700 group-hover:scale-105">
              <div className="flex justify-between items-start">
                <Terminal className="w-14 h-14 text-blue-500" />
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
              </div>
              <div>
                 <p className="text-5xl font-black text-white tracking-tighter">99%</p>
                 <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] mt-2">Code Quality Score</p>
              </div>
              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[99%] animate-grow-x" />
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

export const SkillsSection: React.FC<{ skills: PortfolioData['skills'] }> = ({ skills }) => (
  <section id="skills" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-24">
    <div className="flex flex-col mb-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-blue-600" />
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Technical Expertise</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter">Maîtrise de la Stack</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {skills.map((cat, i) => {
        const Icon = categoryIcons[cat.title] || Laptop;
        const gradient = categoryGradients[cat.title] || "from-gray-500/10 to-gray-500/5";
        
        return (
          <div 
            key={i} 
            className="group relative p-8 bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl rounded-[40px] border border-black/5 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[40px]`} />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-black/5 dark:border-white/10">
                <Icon className="w-6 h-6 transition-colors" />
              </div>
              
              <h3 className="text-lg font-black dark:text-white mb-6 uppercase tracking-tight">
                {cat.title}
              </h3>
              
              <div className="flex flex-wrap gap-2.5">
                {cat.skills.map(s => (
                  <span 
                    key={s} 
                    className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-[10px] font-black rounded-2xl border border-black/5 dark:border-white/5 text-gray-500 dark:text-gray-400 group-hover:border-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all uppercase tracking-wider"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export const PackagesSection: React.FC<{ packages: PortfolioData['npmPackages'] }> = ({ packages }) => (
  <section className="py-24 px-6 max-w-7xl mx-auto border-t border-black/5 dark:border-white/5">
    <div className="flex flex-col items-center text-center mb-16">
      <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center mb-6 border border-blue-600/20">
        <Package className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
      <h2 className="text-3xl md:text-5xl font-black dark:text-white uppercase tracking-tighter mb-4">Open Source Ecosystem</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm font-medium">Contribution active à la communauté via des outils d'automatisation et des modules NPM utilisés par des milliers de développeurs.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg, i) => (
        <a 
          key={i} 
          href={`https://www.npmjs.com/package/${pkg.name}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative p-10 bg-white dark:bg-[#0f172a] rounded-[48px] border border-black/5 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
            <Hexagon className="w-40 h-40 text-blue-600" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                <Box className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest">
                   v{pkg.version}
                 </span>
                 <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            <h3 className="text-xl font-black dark:text-white mb-2 group-hover:text-blue-600 transition-colors tracking-tight">
              {pkg.name}
            </h3>
            
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-10">Public Module • NPM Registry</p>

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-black/5 dark:border-white/5">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Download className="w-3 h-3" /> Impact
                  </p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">{pkg.downloads || 'Active'}</p>
               </div>
               <div className="flex flex-col items-end">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3" /> Status
                  </p>
                  <p className="text-xs font-black text-green-500 uppercase">Stable</p>
               </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export const ProjectsSection: React.FC<{ projects: PortfolioData['projects'] }> = ({ projects }) => {
  const [filter, setFilter] = useState<'All' | 'Professional' | 'Personal' | 'Open Source'>('All');
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-blue-600" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Selected Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter leading-none">Portfolio Réalisations</h2>
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-[20px] border border-black/5 dark:border-white/5 backdrop-blur-md">
          {(['All', 'Professional', 'Personal', 'Open Source'] as const).map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl' : 'text-gray-500 hover:text-blue-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filtered.map((project, i) => (
          <div key={i} className="group bg-white dark:bg-white/5 rounded-[48px] border border-black/5 dark:border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5">
            <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-900 p-10 flex flex-col justify-end relative overflow-hidden">
               <div className="absolute top-8 right-8 text-white/5 group-hover:text-blue-500/10 group-hover:scale-110 transition-all duration-700">
                  <Code className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                 <div className="flex flex-wrap gap-2.5 mb-5">
                   {project.stack.map(s => <span key={s} className="px-3 py-1.5 bg-black/50 text-[9px] font-black text-white rounded-xl uppercase backdrop-blur-md border border-white/10 tracking-widest">{s}</span>)}
                 </div>
                 <h3 className="text-3xl font-black text-white tracking-tighter leading-tight">{project.title}</h3>
               </div>
            </div>
            <div className="p-10">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed line-clamp-3 font-medium">{project.description}</p>
              <div className="flex gap-8">
                {project.demoUrl && (
                  <a href={project.demoUrl} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2 hover:translate-x-1 transition-transform group/link">
                    Live Demo <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} className="text-[11px] font-black text-gray-400 uppercase flex items-center gap-2 hover:text-white transition-colors">
                    GitHub Repo <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ExperienceSection: React.FC<{ experiences: PortfolioData['experiences'] }> = ({ experiences }) => (
  <section id="experience" className="py-24 px-6 max-w-5xl mx-auto scroll-mt-24">
    <div className="flex flex-col mb-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-blue-600" />
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Career Timeline</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter">Parcours Professionnel</h2>
    </div>
    
    <div className="space-y-16 relative">
      <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-blue-600/50 via-blue-600/20 to-transparent" />
      {experiences.map((exp, i) => (
        <div key={i} className="relative pl-12 group">
          <div className="absolute left-[-6px] top-2 w-3 h-3 rounded-full bg-white dark:bg-[#030712] border-2 border-blue-600 group-hover:scale-150 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
             <h3 className="text-2xl font-black dark:text-white tracking-tight">{exp.role}</h3>
             <span className="px-4 py-1.5 bg-blue-600/5 dark:bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest">{exp.period}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-6">
            <span className="text-blue-600 dark:text-blue-400">{exp.company}</span>
            <span className="opacity-30">•</span>
            <span>{exp.location}</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-3xl font-medium">{exp.description}</p>
          
          <div className="flex flex-wrap gap-2.5">
            {exp.tasks.map((task, idx) => (
               <span key={idx} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">{task}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const ContactSection: React.FC<{ contact: PortfolioData['contact'] }> = ({ contact }) => (
  <section id="contact" className="py-24 px-6 max-w-6xl mx-auto">
    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 rounded-[64px] p-16 md:p-24 text-white relative overflow-hidden shadow-[0_40px_100px_rgba(37,99,235,0.3)]">
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">
            Let's ship <br /> amazing <br /> products.
          </h2>
          <p className="text-blue-100 mb-12 max-w-md text-lg font-medium leading-relaxed opacity-80">
            Prêt pour une collaboration technique de haut niveau ? Transformons vos idées en infrastructures scalables.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            <a href={`mailto:${contact.email}`} className="px-10 py-5 bg-white text-blue-700 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Start conversation</a>
            <div className="flex items-center gap-8">
              <a href={`https://github.com/${contact.github}`} target="_blank" className="text-white/60 hover:text-white hover:scale-110 transition-all"><Github className="w-7 h-7" /></a>
              <a href={`https://linkedin.com/in/${contact.linkedin}`} target="_blank" className="text-white/60 hover:text-white hover:scale-110 transition-all"><Linkedin className="w-7 h-7" /></a>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
           {[
             { icon: MapPin, label: "HQ Location", value: contact.address },
             { icon: Mail, label: "Direct Email", value: contact.email },
             { icon: Phone, label: "Phone", value: contact.phone }
           ].map((item, idx) => (
             <div key={idx} className="p-8 bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/10 group hover:bg-white/15 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                      <item.icon className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-blue-200 tracking-[0.3em] mb-1">{item.label}</p>
                      <p className="text-lg font-bold tracking-tight">{item.value}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  </section>
);

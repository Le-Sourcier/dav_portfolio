
import React, { useState } from 'react';
import { 
  ChevronRight, Star, FileDown, Terminal, ExternalLink, 
  Github, Mail, Linkedin, MapPin, Cpu, Package, 
  Code, Layers, Smartphone, Server, Globe, Shield, 
  Database, Cloud, Zap, Laptop, Download, GitBranch,
  Box, Hexagon, Workflow, Phone, Send, CheckCircle2,
  Sparkles, MousePointer2, Loader2
} from 'lucide-react';
import { PortfolioData, Project, ProjectRequest } from '../types/index';

// Fix: Added Hero component which was missing in this file
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

// Fix: Added SkillsSection component which was missing in this file
export const SkillsSection: React.FC<{ skills: PortfolioData['skills'] }> = ({ skills }) => {
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('frontend')) return <Smartphone className="w-5 h-5" />;
    if (t.includes('backend')) return <Server className="w-5 h-5" />;
    if (t.includes('data')) return <Database className="w-5 h-5" />;
    if (t.includes('infra')) return <Cloud className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  return (
    <section id="skills" className="py-20 px-6 bg-gray-50/50 dark:bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-px w-12 bg-blue-600" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Expertise technique</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((category, i) => (
            <div key={i} className="p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2.5rem] hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                {getIcon(category.title)}
              </div>
              <h3 className="text-lg font-black dark:text-white text-gray-900 mb-4 uppercase tracking-tight">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, j) => (
                  <span key={j} className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Fix: Added PackagesSection component which was missing in this file
export const PackagesSection: React.FC<{ packages: PortfolioData['npmPackages'] }> = ({ packages }) => (
  <section id="packages" className="py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-px w-12 bg-blue-600" />
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Open Source & NPM</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package className="w-20 h-20 text-white" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase">v{pkg.version}</p>
              </div>
            </div>
            {pkg.downloads && (
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <Download className="w-3 h-3" /> {pkg.downloads} Téléchargements
              </div>
            )}
            <a href={`https://www.npmjs.com/package/${pkg.name}`} target="_blank" rel="noreferrer" className="absolute bottom-8 right-8 text-slate-500 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Fix: Added ProjectsSection component which was missing in this file
export const ProjectsSection: React.FC<{ projects: PortfolioData['projects'] }> = ({ projects }) => (
  <section id="projects" className="py-20 px-6 scroll-mt-24">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-blue-600" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Réalisations</span>
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight uppercase dark:text-white text-gray-900">Selected Works</h2>
          <p className="text-gray-600 dark:text-gray-400">Projets phares alliant innovation technique et expérience utilisateur.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, i) => (
          <div key={i} className="group bg-white dark:bg-white/[0.02] rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/10 hover:border-blue-500/20 transition-all shadow-sm">
             <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex flex-col justify-end p-8">
               {project.image && <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-all" />
               <div className="relative z-10">
                 <div className="flex flex-wrap gap-2 mb-3">
                   {project.stack.map(s => <span key={s} className="px-2 py-0.5 bg-white/10 backdrop-blur rounded text-[8px] font-black uppercase tracking-widest text-white">{s}</span>)}
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{project.title}</h3>
               </div>
             </div>
             <div className="p-8">
               <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2 font-medium">{project.description}</p>
               <div className="flex gap-6">
                 {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1.5 uppercase tracking-widest">LIVE DEMO <ExternalLink className="w-3 h-3" /></a>}
                 {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 uppercase tracking-widest transition-colors">VIEW SOURCE <Github className="w-3 h-3" /></a>}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Fix: Added ExperienceSection component which was missing in this file
export const ExperienceSection: React.FC<{ experiences: PortfolioData['experiences'] }> = ({ experiences }) => (
  <section id="experience" className="py-20 px-6 scroll-mt-24 bg-gray-50/50 dark:bg-white/[0.01]">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-16">
        <div className="h-px w-12 bg-blue-600" />
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Parcours & Expertise</span>
      </div>
      <div className="space-y-16 relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600/50 to-transparent ml-4 md:ml-0" />
        {experiences.map((exp, i) => (
          <div key={i} className="relative pl-10 group">
            <div className="absolute left-[-3.5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-600/10" />
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 block">{exp.period}</span>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <h3 className="text-2xl font-black dark:text-white text-gray-900 uppercase tracking-tight">{exp.role}</h3>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{exp.company} — {exp.location}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">{exp.description}</p>
            <div className="flex flex-wrap gap-2">
              {exp.tasks.map((task, idx) => (
                <div key={idx} className="px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400">
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

export const ContactSection: React.FC<{ contact: PortfolioData['contact'] }> = ({ contact }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Web Development' as ProjectRequest['category'],
    description: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const categories: ProjectRequest['category'][] = [
    'Web Development', 'Mobile App', 'AI Integration', 'Automation', 'Audit & Consulting'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi et stockage local pour l'admin
    setTimeout(() => {
      const newRequest: ProjectRequest = {
        id: `req-${Date.now()}`,
        clientName: formData.name,
        clientEmail: formData.email,
        category: formData.category,
        description: formData.description,
        budget: formData.budget,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'New'
      };

      // Sauvegarde dans le localStorage pour que l'admin puisse le voir
      const savedData = localStorage.getItem('portfolio_data');
      if (savedData) {
        const data = JSON.parse(savedData) as PortfolioData;
        data.requests = [newRequest, ...(data.requests || [])];
        localStorage.setItem('portfolio_data', JSON.stringify(data));
        // Déclenche un événement personnalisé pour notifier l'App si nécessaire
        window.dispatchEvent(new Event('storage'));
      }

      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: '', email: '', category: 'Web Development', description: '', budget: '' });
    }, 1500);
  };

  if (isSent) {
    return (
      <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-slate-900/40 border border-blue-500/30 p-16 rounded-[4rem] backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/40">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Demande Reçue !</h2>
          <p className="text-slate-400 font-medium text-lg mb-10 max-w-md mx-auto">
            Merci pour votre confiance. Une confirmation vient d'être envoyée à votre adresse email. David vous contactera sous 24h.
          </p>
          <button 
            onClick={() => setIsSent(false)}
            className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Envoyer une autre demande
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Collaborons ensemble</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black dark:text-white uppercase tracking-tighter leading-[0.9] mb-6">
              LET'S SHIP <br /> <span className="text-gradient">AMAZING</span> <br /> PRODUCTS.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed max-w-md">
              Prêt à transformer votre vision en une infrastructure technologique de classe mondiale ? Remplissez le formulaire et démarrons l'aventure.
            </p>
          </div>

          <div className="grid gap-4 max-w-md">
            {[
              { icon: Mail, label: "Direct Email", value: contact.email },
              { icon: Phone, label: "Ligne Directe", value: contact.phone },
              { icon: MapPin, label: "Localisation", value: contact.address }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl hover:border-blue-500/30 transition-all group shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="font-bold dark:text-white truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-8 md:p-12 rounded-[3.5rem] border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-6 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-sm font-bold dark:text-white transition-all shadow-inner" 
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Professionnel</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-14 px-6 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-sm font-bold dark:text-white transition-all shadow-inner" 
                  placeholder="jean@entreprise.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Catégorie du Projet</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.category === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-500 hover:border-blue-500/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description du besoin</label>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full h-32 p-6 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl outline-none focus:ring-2 ring-blue-500/20 text-sm font-medium dark:text-white transition-all resize-none shadow-inner" 
                placeholder="Décrivez votre projet en quelques lignes..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Budget Estimé (Optionnel)</label>
              <input 
                type="text" 
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: e.target.value})}
                className="w-full h-14 px-6 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-sm font-bold dark:text-white transition-all shadow-inner" 
                placeholder="Ex: 5k€ - 10k€"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 group"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Propulser ma demande</>}
            </button>

            <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" /> Données sécurisées • Réponse sous 24h
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

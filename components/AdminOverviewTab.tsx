
import React from 'react';
import { BookOpen, Layers, Briefcase, Sparkles, Download, ChevronRight, Clock } from 'lucide-react';
import { PortfolioData } from '../types/index';

interface AdminOverviewTabProps {
  data: PortfolioData;
  setActiveTab: (tab: any) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ data, setActiveTab, addNotification }) => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Articles Blog', value: data.blogs.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Projets Récents', value: data.projects.length, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Expériences', value: data.experiences.length, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/50 border ${stat.border} p-10 rounded-[3rem] flex items-center justify-between group hover:bg-slate-900 transition-all duration-500`}>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <h4 className="text-5xl font-black text-white tracking-tighter">{stat.value}</h4>
            </div>
            <div className={`w-16 h-16 rounded-[2rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-500" /> Activité Blog
            </h3>
            <button onClick={() => setActiveTab('blogs')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Gérer tout</button>
          </div>
          <div className="space-y-4">
            {data.blogs.slice(0, 4).map((blog, i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-slate-950/30 border border-transparent hover:border-slate-800 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                   {blog.image ? <img src={blog.image} className="w-full h-full object-cover" alt="" /> : <Clock className="w-6 h-6 text-slate-700" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5 className="text-sm font-black text-white truncate">{blog.title}</h5>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{blog.date} • {blog.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center">
           <div className="w-24 h-24 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mb-8 border border-blue-500/10">
              <Download className="w-10 h-10 text-blue-500" />
           </div>
           <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Exporter les données</h3>
           <p className="text-slate-500 text-sm font-medium mb-10 max-w-xs">Générez une sauvegarde complète au format JSON.</p>
           <button 
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `backup-${Date.now()}.json`; a.click();
              addNotification('Export', 'Données exportées avec succès.', 'success');
            }}
            className="h-14 px-10 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3"
           >
              Télécharger JSON <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

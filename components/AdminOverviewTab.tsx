
import React from 'react';
import { BookOpen, Layers, Briefcase, Sparkles, Download, ChevronRight, Clock, ShieldCheck, UserCog, Eye, Inbox } from 'lucide-react';
import { PortfolioData, AdminRole } from '../types/index';

interface AdminOverviewTabProps {
  data: PortfolioData;
  setActiveTab: (tab: any) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  role: AdminRole;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ data, setActiveTab, addNotification, role }) => {
  const roleConfig = {
    SUPER_ADMIN: { icon: ShieldCheck, label: 'Super Administrateur', desc: 'Contrôle total du système.' },
    EDITOR: { icon: UserCog, label: 'Éditeur de contenu', desc: 'Gestion des articles et projets.' },
    VIEWER: { icon: Eye, label: 'Lecteur Invité', desc: 'Consultation uniquement.' }
  }[role];

  const newRequestsCount = (data.requests || []).filter(r => r.status === 'New').length;

  return (
    <div className="space-y-10">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <roleConfig.icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{roleConfig.label}</h3>
            <p className="text-slate-500 text-xs font-medium">{roleConfig.desc}</p>
          </div>
        </div>
        <div className="hidden md:block">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
             Session Active <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Demandes Neuves', value: newRequestsCount, icon: Inbox, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Articles Blog', value: data.blogs.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Projets', value: data.projects.length, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Expériences', value: data.experiences.length, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/50 border ${stat.border} p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-900 transition-all duration-500`}>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <h4 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-all duration-500`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
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
           <p className="text-slate-500 text-sm font-medium mb-10 max-w-xs">Générez une sauvegarde complète au format JSON pour archive ou migration.</p>
           {role === 'VIEWER' ? (
              <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                 <ShieldCheck className="w-4 h-4" /> Exportation restreinte au super admin
              </div>
           ) : (
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
           )}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { PlusCircle, Search, ImageIcon, Layers, Briefcase, Edit3, Trash2, Lock } from 'lucide-react';

interface AdminContentListTabProps {
  activeTab: string;
  filteredItems: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any, index: number) => void;
  onCreate: () => void;
  permissions: {
    canModifyContent: boolean;
    canDeleteContent: boolean;
  };
}

export const AdminContentListTab: React.FC<AdminContentListTabProps> = ({ 
  activeTab, filteredItems, onEdit, onDelete, onCreate, permissions 
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Gestion des contenus</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Gérez vos articles, projets et expériences affichés sur le site.</p>
        </div>
        {permissions.canModifyContent ? (
          <button 
            onClick={onCreate}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Créer une entrée
          </button>
        ) : (
          <div className="h-14 px-8 bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 opacity-50 cursor-not-allowed">
            <Lock className="w-4 h-4" /> Mode Lecture Seule
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item, idx) => (
          <div key={item.id || idx} className="group bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/30 p-8 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-8 transition-all duration-500">
            <div className="flex items-center gap-8">
              {(activeTab === 'blogs' || activeTab === 'projects') && (
                <div className="w-28 h-20 rounded-[1.25rem] overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-lg">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    activeTab === 'blogs' ? <ImageIcon className="w-full h-full p-6 text-slate-800" /> : <Layers className="w-full h-full p-6 text-blue-500" />
                  )}
                </div>
              )}
              {activeTab === 'experience' && (
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-600/20">
                  <Briefcase className="w-8 h-8 text-blue-500" />
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="font-black text-white text-xl group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate">{item.title || item.role}</h4>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {item.category && <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{item.category}</span>}
                  {item.date && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.date}</span>}
                  {item.company && <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{item.company}</span>}
                  {item.period && <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.period}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onEdit(item)} className="h-14 w-14 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-lg">
                {permissions.canModifyContent ? <Edit3 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </button>
              {permissions.canDeleteContent && (
                <button 
                  onClick={() => onDelete(item, idx)} 
                  className="h-14 w-14 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="py-24 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-700" />
            </div>
            <h4 className="text-xl font-black text-slate-400 uppercase tracking-tight">Aucun résultat trouvé</h4>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-2">Essayez d'autres mots-clés ou videz la recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

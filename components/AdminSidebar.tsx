
import React from 'react';
import { LogOut, ChevronRight } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
}

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuItems: MenuItem[];
  onExit: () => void;
  name: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  sidebarOpen, setSidebarOpen, activeTab, setActiveTab, menuItems, onExit, name 
}) => (
  <>
    {sidebarOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
    )}

    <aside className={`fixed lg:static inset-y-0 left-0 z-[70] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-500 w-80 bg-slate-900 border-r border-slate-800/50 flex flex-col`}>
      <div className="p-10 border-b border-slate-800/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg">
            {name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-white text-lg truncate tracking-tight">Console Admin</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{name}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold text-sm transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'text-slate-500 group-hover:text-blue-400'}`} />
            <span className="tracking-tight">{item.label}</span>
            {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4" />}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-800/30">
        <button onClick={onExit} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-tight">Déconnexion</span>
        </button>
      </div>
    </aside>
  </>
);

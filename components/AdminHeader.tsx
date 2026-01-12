
import React from 'react';
import { Menu, Search, Bell, ChevronRight, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

interface AdminHeaderProps {
  setSidebarOpen: (o: boolean) => void;
  activeTab: string;
  activeLabel: string;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (o: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  unreadCount: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  setSidebarOpen, activeTab, activeLabel, searchTerm, setSearchTerm,
  notifications, setNotifications, notificationsOpen, setNotificationsOpen,
  notificationRef, unreadCount
}) => (
  <header className="h-24 border-b border-slate-800/30 bg-slate-900/20 backdrop-blur-2xl flex items-center justify-between px-10 shrink-0 relative z-50">
    <div className="flex items-center gap-6">
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-800 rounded-xl text-white">
        <Menu className="w-6 h-6" />
      </button>
      <div className="hidden sm:flex flex-col">
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          System <ChevronRight className="w-3 h-3 text-slate-700" /> <span className="text-blue-500">{activeTab}</span>
        </div>
        <h2 className="text-xl font-black text-white mt-1 tracking-tight">{activeLabel}</h2>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="relative hidden xl:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input 
          type="text" 
          placeholder={`Rechercher dans ${activeTab}...`} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80 h-12 pl-12 pr-6 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-700" 
        />
      </div>
      
      <div className="relative" ref={notificationRef as any}>
        <button 
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            if (!notificationsOpen) {
              setNotifications(notifications.map(n => ({ ...n, read: true })));
            }
          }}
          className={`relative w-12 h-12 flex items-center justify-center bg-slate-800/50 rounded-2xl text-slate-400 hover:text-white transition-all border border-slate-700/50 ${notificationsOpen ? 'bg-slate-700 text-white' : ''}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900" />
          )}
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Centre d'alertes</h4>
              <button onClick={() => setNotifications([])} className="text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors">Tout vider</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className={`p-5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-black uppercase ${n.type === 'success' ? 'text-emerald-500' : n.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>{n.title}</span>
                      <span className="text-[9px] text-slate-600 font-bold">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <CheckCircle className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Aucune alerte</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700/50 p-0.5">
         <div className="w-full h-full rounded-[0.65rem] bg-indigo-600 flex items-center justify-center font-black text-white text-xs uppercase">DL</div>
      </div>
    </div>
  </header>
);

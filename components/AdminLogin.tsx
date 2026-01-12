
import React from 'react';
import { Settings, AlertCircle, Info } from 'lucide-react';

interface AdminLoginProps {
  password: string;
  setPassword: (p: string) => void;
  error: string;
  onLogin: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ password, setPassword, error, onLogin }) => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15),transparent_70%)]" />
    <div className="w-full max-w-md relative">
      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 group cursor-default">
            <Settings className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-700" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight text-center uppercase">Admin Console</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Système d'accès sécurisé</p>
        </div>
        
        <form onSubmit={onLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Clé d'administration</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 focus:border-blue-500 transition-all text-white font-mono placeholder:text-slate-700"
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl text-xs font-bold animate-pulse">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95">
            Authentification
          </button>
        </form>

        <div className="mt-10 p-5 bg-slate-950/50 border border-slate-800 rounded-2xl">
           <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Guide des Accès (Demo)</p>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-600">
                  <div className="flex flex-col"><span className="text-blue-400">logan</span> <span>Super Admin</span></div>
                  <div className="flex flex-col"><span className="text-amber-400">editor</span> <span>Éditeur</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">guest</span> <span>Lecteur seul</span></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);


import React from 'react';
import { Github, Linkedin, Mail, Heart, Cpu, Lock } from 'lucide-react';

interface FooterProps {
  setView: (v: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-white dark:bg-black border-t border-black/5 dark:border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">DL</div>
              <span className="font-bold uppercase tracking-tight dark:text-white">David Logan</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">Ingénieur logiciel dédié à la création d'architectures modernes et performantes.</p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Liens</h4>
              <ul className="space-y-3 text-xs font-bold">
                <li><button onClick={() => setView('home')} className="text-gray-500 hover:text-blue-500 transition-colors">Accueil</button></li>
                <li><button onClick={() => setView('blog')} className="text-gray-500 hover:text-blue-500 transition-colors">Blog</button></li>
                <li><button onClick={() => setView('admin')} className="text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1.5 opacity-40 hover:opacity-100"><Lock className="w-3 h-3" /> Admin</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Social</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors"><Github className="w-4 h-4" /></a>
                <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              DISPONIBLE POUR PROJETS
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Yao David Logan.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">Built with <Heart className="w-3 h-3 text-red-500 fill-current" /> & React</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

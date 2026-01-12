
import React from 'react';
import { User, MapPin, Mail, Phone, Share2, Github, Linkedin, FileText, CheckCircle } from 'lucide-react';
import { PortfolioData } from '../types/index';

interface AdminProfileTabProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({ data, onUpdate, addNotification }) => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3.5rem] space-y-12 shadow-2xl backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-4xl shadow-2xl">
            {data.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
             <h3 className="text-3xl font-black text-white tracking-tight uppercase">{data.name}</h3>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{data.role}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); addNotification('Système', 'Paramètres de profil mis à jour.', 'success'); }} className="space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Identité & Bio</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Identité Affichée</label>
                <input type="text" value={data.name} onChange={e => onUpdate({ ...data, name: e.target.value })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Titre Professionnel</label>
                <input type="text" value={data.role} onChange={e => onUpdate({ ...data, role: e.target.value })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Ma Bio Portfolio</label>
              <textarea value={data.bio} onChange={e => onUpdate({ ...data, bio: e.target.value })} className="w-full h-32 p-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] outline-none focus:ring-1 ring-blue-500 text-white font-medium resize-none" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Contact & Localisation</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email de contact
                </label>
                <input type="email" value={data.contact.email} onChange={e => onUpdate({ ...data, contact: { ...data.contact, email: e.target.value } })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Ligne Directe
                </label>
                <input type="text" value={data.contact.phone} onChange={e => onUpdate({ ...data, contact: { ...data.contact, phone: e.target.value } })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Adresse Physique
              </label>
              <input type="text" value={data.contact.address} onChange={e => onUpdate({ ...data, contact: { ...data.contact, address: e.target.value } })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Share2 className="w-5 h-5 text-emerald-500" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Réseaux Sociaux & Liens</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Github className="w-3 h-3" /> GitHub Username
                </label>
                <input type="text" value={data.contact.github} onChange={e => onUpdate({ ...data, contact: { ...data.contact, github: e.target.value } })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Linkedin className="w-3 h-3" /> LinkedIn ID / URL
                </label>
                <input type="text" value={data.contact.linkedin} onChange={e => onUpdate({ ...data, contact: { ...data.contact, linkedin: e.target.value } })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Lien du CV (URL / Path)
              </label>
              <input type="text" value={data.cvUrl} onChange={e => onUpdate({ ...data, cvUrl: e.target.value })} className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold" />
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex justify-end">
            <button type="submit" className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5" /> Sauvegarder la configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

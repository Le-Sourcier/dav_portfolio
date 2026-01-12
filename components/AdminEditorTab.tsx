
import React, { useRef } from 'react';
import { ArrowLeft, Save, ImageIcon, Bold, Italic, List, Link as LinkIcon, Video, Code } from 'lucide-react';

interface AdminEditorTabProps {
  activeTab: string;
  editingItem: any;
  setEditingItem: (item: any) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const AdminEditorTab: React.FC<AdminEditorTabProps> = ({ 
  activeTab, editingItem, setEditingItem, onCancel, onSave 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    const newText = before + prefix + (selection || "texte") + suffix + after;
    setEditingItem({ ...editingItem, content: newText });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + (selection.length || 5));
      }
    }, 10);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Annuler et revenir
        </button>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Mode Édition : {activeTab}</span>
        </div>
      </div>
      
      <form onSubmit={onSave} className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3rem] space-y-10 shadow-2xl backdrop-blur-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
              {activeTab === 'blogs' ? 'Titre de l\'article' : activeTab === 'projects' ? 'Nom du projet' : 'Rôle / Poste'}
            </label>
            <input 
              type="text" 
              value={editingItem.title || editingItem.role || ''} 
              onChange={e => setEditingItem({ ...editingItem, [activeTab === 'blogs' || activeTab === 'projects' ? 'title' : 'role']: e.target.value })} 
              className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold placeholder:text-slate-800" 
              placeholder="..."
              required 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Classification</label>
            <select 
              value={editingItem.category || editingItem.company || ''} 
              onChange={e => setEditingItem({ ...editingItem, [activeTab === 'blogs' || activeTab === 'projects' ? 'category' : 'company']: e.target.value })} 
              className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-bold"
            >
              {activeTab === 'blogs' && ['Code', 'Architecture', 'Security', 'AI', 'Frontend', 'Backend'].map(c => <option key={c} value={c}>{c}</option>)}
              {activeTab === 'projects' && ['Professional', 'Personal', 'Open Source'].map(c => <option key={c} value={c}>{c}</option>)}
              {activeTab === 'experience' && <option value={editingItem.company}>{editingItem.company || 'Nom entreprise'}</option>}
            </select>
          </div>
        </div>

        {activeTab === 'blogs' && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Image de Couverture (URL)
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={editingItem.image || ''} 
                onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} 
                className="w-full h-16 px-6 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-1 ring-blue-500 text-white font-medium placeholder:text-slate-800" 
                placeholder="https://images.unsplash.com/..."
              />
              {editingItem.image && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-10 rounded-lg overflow-hidden border border-slate-700">
                   <img src={editingItem.image} className="w-full h-full object-cover" alt="Prévisualisation" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Description / Résumé</label>
          <textarea 
            value={editingItem.excerpt || editingItem.description || ''} 
            onChange={e => setEditingItem({ ...editingItem, [activeTab === 'blogs' ? 'excerpt' : 'description']: e.target.value })} 
            className="w-full h-32 p-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] outline-none focus:ring-1 ring-blue-500 text-white font-medium resize-none placeholder:text-slate-800" 
            placeholder="..."
            required 
          />
        </div>

        {activeTab === 'blogs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Contenu (Markdown)</label>
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/50 border border-slate-800 rounded-xl">
                <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Gras"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Italique"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertMarkdown('- ')} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Liste"><List className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-800 mx-1" />
                <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Lien"><LinkIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertMarkdown('![Image](', ')')} className="p-2 text-blue-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all" title="Insérer Image"><ImageIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertMarkdown('[video](', ')')} className="p-2 text-purple-500 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-all" title="Insérer Vidéo (URL)"><Video className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertMarkdown('```typescript\n', '\n```')} className="p-2 text-emerald-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all" title="Bloc de Code"><Code className="w-4 h-4" /></button>
              </div>
            </div>
            <textarea 
              ref={textareaRef}
              value={editingItem.content || ''} 
              onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} 
              className="w-full h-96 p-8 bg-slate-950/50 border border-slate-800 rounded-[2.5rem] outline-none focus:ring-1 ring-blue-500 text-white font-mono text-sm leading-relaxed" 
              placeholder="Rédigez ici..."
              required 
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-5 pt-10 border-t border-slate-800">
          <button type="submit" className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3">
            <Save className="w-5 h-5" /> Enregistrer les modifications
          </button>
          <button type="button" onClick={onCancel} className="h-16 px-12 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
            Abandonner
          </button>
        </div>
      </form>
    </div>
  );
};

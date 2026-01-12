
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, Search, Terminal, BookOpen, Cpu, ChevronRight, Hash, Command } from 'lucide-react';
import { PortfolioData, Project, BlogPost } from './types';

interface NavbarProps {
  currentView: string;
  setView: (v: any) => void;
  isScrolled: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  data: PortfolioData;
}

export const ThemeToggle: React.FC<{ isDark: boolean, toggle: () => void }> = ({ isDark, toggle }) => (
  <button 
    onClick={toggle}
    className="p-3 rounded-2xl glass border border-white/10 dark:border-white/5 hover:scale-110 active:scale-95 transition-all text-blue-500 dark:text-yellow-400"
    aria-label="Changer le thème"
  >
    {isDark ? <Sun className="w-5 h-5 fill-current" /> : <Moon className="w-5 h-5 fill-current" />}
  </button>
);

const SearchModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  data: PortfolioData;
  setView: (v: any) => void;
}> = ({ isOpen, onClose, data, setView }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = {
    projects: data.projects.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) || 
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.stack.some(s => s.toLowerCase().includes(query.toLowerCase()))
    ),
    blogs: data.blogs.filter(b => 
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    ),
    skills: data.skills.flatMap(c => c.skills).filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5) // Limiter les compétences affichées
  };

  const hasResults = results.projects.length > 0 || results.blogs.length > 0 || results.skills.length > 0;

  const handleSelect = (type: 'project' | 'blog' | 'skill', item: any) => {
    onClose();
    if (type === 'project') {
      setView('home');
      setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (type === 'blog') {
      // Pour les blogs, on pourrait passer l'objet pour l'ouvrir direct, mais ici on va à la liste
      setView('blog');
    } else if (type === 'skill') {
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 sm:pt-40">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-6 py-4 border-b border-black/5 dark:border-white/10">
          <Search className="w-5 h-5 text-gray-400 mr-4" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Rechercher un projet, un article, une techno..." 
            className="flex-1 bg-transparent border-none outline-none text-lg dark:text-white placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 text-[10px] font-bold text-gray-400">
            <kbd className="font-sans uppercase">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {query && !hasResults ? (
            <div className="py-10 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun résultat pour "{query}"</p>
            </div>
          ) : !query ? (
            <div className="py-10 text-center">
              <Command className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tapez quelque chose pour commencer la recherche</p>
            </div>
          ) : (
            <>
              {results.projects.length > 0 && (
                <div>
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Projets
                  </h3>
                  <div className="space-y-1">
                    {results.projects.map((p, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelect('project', p)}
                        className="w-full text-left px-4 py-3 rounded-2xl hover:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold dark:text-white group-hover:text-blue-500">{p.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.blogs.length > 0 && (
                <div>
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Articles
                  </h3>
                  <div className="space-y-1">
                    {results.blogs.map((b, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelect('blog', b)}
                        className="w-full text-left px-4 py-3 rounded-2xl hover:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold dark:text-white group-hover:text-blue-500">{b.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{b.excerpt}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.skills.length > 0 && (
                <div>
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <Cpu className="w-3 h-3" /> Compétences
                  </h3>
                  <div className="flex flex-wrap gap-2 px-4">
                    {results.skills.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelect('skill', s)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-xs font-bold dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all"
                      >
                        #{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isScrolled, isDark, toggleTheme, data }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Accueil', view: 'home', hash: '#top' },
    { label: 'Projets', view: 'home', hash: '#projects' },
    { label: 'Blog', view: 'blog', hash: '' },
    { label: 'Expérience', view: 'home', hash: '#experience' }
  ];

  const handleNav = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (link.view !== currentView) {
      setView(link.view);
      if (link.hash) {
        setTimeout(() => {
          document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (link.hash) {
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 glass border-b border-black/5 dark:border-white/10 shadow-2xl' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-blue-500/50 transition-all">
              DL
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block uppercase dark:text-white text-gray-900">YAO LOGAN</span>
          </button>
          
          <div className="hidden md:flex gap-6 items-center text-sm font-medium">
            {navLinks.map((link) => (
              <button 
                key={link.label} 
                onClick={() => handleNav(link)}
                className={`transition-colors font-bold ${currentView === link.view ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-2" />
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              <Search className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs font-bold mr-4">Rechercher...</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-black/5 dark:border-white/5 text-[9px] font-black">
                <Command className="w-2 h-2" />
                <span>K</span>
              </div>
            </button>

            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
            
            <button 
              onClick={() => { setView('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Contact
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-3 text-gray-500 dark:text-gray-400">
              <Search className="w-6 h-6" />
            </button>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
            <button onClick={() => setMobileMenuOpen(true)} className="p-3 text-gray-500 dark:text-gray-400">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <div className={`fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-2xl transition-all duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-8">
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 dark:text-white text-gray-900"><X className="w-8 h-8" /></button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNav(link)} className="text-3xl font-bold dark:text-white text-gray-900 hover:text-blue-500 transition-colors">
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Recherche */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        data={data} 
        setView={setView} 
      />
    </>
  );
};

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, LayoutDashboard, FolderKanban, Briefcase,
  Newspaper, MessageSquare, CalendarDays, Star, Mail,
  Settings, Plus, ArrowRight, Hash, FileText, User,
  Lock, Palette, Globe, CornerDownLeft,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import {
  useProjects, useExperiences, useBlogPosts,
  useContacts, useTestimonials,
} from '@/hooks/queries';
import { cn } from '@/lib/utils';

// --- Types ---
interface SearchResult {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

// --- Navigation items (always shown) ---
function getNavigationItems(setActiveTab: (tab: string) => void): SearchResult[] {
  return [
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Vue d\'ensemble', icon: LayoutDashboard, category: 'Navigation', action: () => setActiveTab('dashboard') },
    { id: 'nav-projects', label: 'Projets', description: 'Gestion des projets', icon: FolderKanban, category: 'Navigation', action: () => setActiveTab('projects') },
    { id: 'nav-experiences', label: 'Experiences', description: 'Parcours professionnel', icon: Briefcase, category: 'Navigation', action: () => setActiveTab('experiences') },
    { id: 'nav-blog', label: 'Blog', description: 'Articles & publications', icon: Newspaper, category: 'Navigation', action: () => setActiveTab('blog') },
    { id: 'nav-contacts', label: 'Messages', description: 'Boite de reception', icon: MessageSquare, category: 'Navigation', action: () => setActiveTab('contacts') },
    { id: 'nav-appointments', label: 'Rendez-vous', description: 'Planning', icon: CalendarDays, category: 'Navigation', action: () => setActiveTab('appointments') },
    { id: 'nav-testimonials', label: 'Temoignages', description: 'Avis clients', icon: Star, category: 'Navigation', action: () => setActiveTab('testimonials') },
    { id: 'nav-newsletter', label: 'Newsletter', description: 'Abonnes', icon: Mail, category: 'Navigation', action: () => setActiveTab('newsletter') },
    { id: 'nav-settings', label: 'Parametres', description: 'Configuration', icon: Settings, category: 'Navigation', action: () => setActiveTab('settings') },
    { id: 'nav-settings-profile', label: 'Profil', description: 'Parametres > Profil', icon: User, category: 'Parametres', action: () => { setActiveTab('settings'); } },
    { id: 'nav-settings-security', label: 'Securite', description: 'Parametres > Securite', icon: Lock, category: 'Parametres', action: () => { setActiveTab('settings'); } },
    { id: 'nav-settings-appearance', label: 'Apparence & Theme', description: 'Parametres > Apparence', icon: Palette, category: 'Parametres', action: () => { setActiveTab('settings'); } },
    { id: 'nav-settings-seo', label: 'SEO & Meta', description: 'Parametres > SEO', icon: Globe, category: 'Parametres', action: () => { setActiveTab('settings'); } },
  ];
}

function getQuickActions(setActiveTab: (tab: string) => void, openModal: (type: string) => void): SearchResult[] {
  return [
    { id: 'action-new-project', label: 'Nouveau projet', description: 'Creer un projet', icon: Plus, category: 'Actions', action: () => { setActiveTab('projects'); setTimeout(() => openModal('project'), 100); } },
    { id: 'action-new-article', label: 'Nouvel article', description: 'Ecrire un article', icon: Plus, category: 'Actions', action: () => { setActiveTab('blog'); setTimeout(() => openModal('blog'), 100); } },
    { id: 'action-new-experience', label: 'Nouvelle experience', description: 'Ajouter une experience', icon: Plus, category: 'Actions', action: () => { setActiveTab('experiences'); setTimeout(() => openModal('experience'), 100); } },
    { id: 'action-new-testimonial', label: 'Nouveau temoignage', description: 'Ajouter un temoignage', icon: Plus, category: 'Actions', action: () => { setActiveTab('testimonials'); setTimeout(() => openModal('testimonial'), 100); } },
  ];
}

// --- Component ---
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openModal = useUIStore((s) => s.openModal);

  // Fetch data for content search
  const { data: projects = [] } = useProjects();
  const { data: experiences = [] } = useExperiences();
  const { data: blogPosts = [] } = useBlogPosts();
  const { data: contacts = [] } = useContacts();
  const { data: testimonials = [] } = useTestimonials();

  // Build searchable items
  const allItems = useMemo(() => {
    const nav = getNavigationItems(setActiveTab);
    const actions = getQuickActions(setActiveTab, openModal as any);

    const contentItems: SearchResult[] = [
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        label: p.title,
        description: `Projet - ${p.category}`,
        icon: FolderKanban,
        category: 'Projets',
        action: () => { setActiveTab('projects'); },
      })),
      ...experiences.map((e) => ({
        id: `exp-${e.id}`,
        label: e.title,
        description: `${e.company} - ${e.dates}`,
        icon: Briefcase,
        category: 'Experiences',
        action: () => { setActiveTab('experiences'); },
      })),
      ...blogPosts.map((b) => ({
        id: `blog-${b.id}`,
        label: b.title,
        description: `Article - ${b.category}${b.published ? '' : ' (brouillon)'}`,
        icon: FileText,
        category: 'Articles',
        action: () => { setActiveTab('blog'); },
      })),
      ...contacts.slice(0, 10).map((c) => ({
        id: `contact-${c.id}`,
        label: c.name,
        description: c.subject || c.email,
        icon: MessageSquare,
        category: 'Messages',
        action: () => { setActiveTab('contacts'); },
      })),
      ...testimonials.slice(0, 10).map((t) => ({
        id: `testimonial-${t.id}`,
        label: t.name,
        description: `${t.role}${t.company ? ` - ${t.company}` : ''}`,
        icon: Star,
        category: 'Temoignages',
        action: () => { setActiveTab('testimonials'); },
      })),
    ];

    return [...actions, ...nav, ...contentItems];
  }, [projects, experiences, blogPosts, contacts, testimonials, setActiveTab, openModal]);

  // Filter
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show quick actions + navigation when empty
      return allItems.filter((i) => i.category === 'Actions' || i.category === 'Navigation');
    }

    const q = query.toLowerCase().trim();
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach((r) => {
      const arr = map.get(r.category) || [];
      arr.push(r);
      map.set(r.category, arr);
    });
    return map;
  }, [results]);

  const flatResults = results;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Clamp index
  useEffect(() => {
    if (selectedIndex >= flatResults.length) setSelectedIndex(Math.max(0, flatResults.length - 1));
  }, [flatResults.length, selectedIndex]);

  // Scroll into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeResult = useCallback((result: SearchResult) => {
    result.action();
    onClose();
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, flatResults.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + flatResults.length) % Math.max(1, flatResults.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatResults[selectedIndex]) executeResult(flatResults[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[200] flex items-start justify-center pt-[12vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card/60 border border-border/70 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border/70">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher pages, projets, articles, actions..."
              className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-zinc-400 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setSelectedIndex(0); }} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto overscroll-contain">
            {flatResults.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">Aucun resultat pour "{query}"</p>
                <p className="text-[11px] text-zinc-400/60 mt-1">Essayez un autre terme</p>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                      {category}
                    </p>
                  </div>
                  {items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const isSelected = idx === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => executeResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800'
                            : 'hover:bg-accent/60'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isSelected
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-[13px] truncate',
                            isSelected ? 'text-foreground font-medium' : 'text-zinc-700 dark:text-zinc-300'
                          )}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 truncate">{item.description}</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 shrink-0">
                            <kbd className="text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5 flex items-center gap-0.5">
                              <CornerDownLeft className="w-2.5 h-2.5" />
                            </kbd>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/70 bg-zinc-50/50 bg-card/60">
            <div className="flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><kbd className="font-mono border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5">↑↓</kbd> Naviguer</span>
              <span className="flex items-center gap-1"><kbd className="font-mono border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5">↵</kbd> Ouvrir</span>
              <span className="flex items-center gap-1"><kbd className="font-mono border border-zinc-200 dark:border-zinc-700 rounded px-1 py-0.5">Esc</kbd> Fermer</span>
            </div>
            <p className="text-[10px] text-zinc-400">{flatResults.length} resultat{flatResults.length !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

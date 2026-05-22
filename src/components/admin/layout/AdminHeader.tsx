import { Plus, Menu, Bell, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';

interface AdminHeaderProps {
  unreadCount?: number;
  onSearchClick?: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Vue d\'ensemble' },
  projects: { title: 'Projets', subtitle: 'Gestion des projets' },
  experiences: { title: 'Experiences', subtitle: 'Parcours professionnel' },
  blog: { title: 'Blog', subtitle: 'Articles & publications' },
  tags: { title: 'Tags blog', subtitle: 'Taxonomie & monitoring' },
  comments: { title: 'Commentaires', subtitle: 'Moderation & reponses' },
  contacts: { title: 'Messages', subtitle: 'Boite de reception' },
  appointments: { title: 'Rendez-vous', subtitle: 'Planning' },
  testimonials: { title: 'Temoignages', subtitle: 'Avis clients' },
  newsletter: { title: 'Newsletter', subtitle: 'Abonnes' },
  settings: { title: 'Parametres', subtitle: 'Configuration' },
};

const pagesWithCreateButton = ['projects', 'experiences', 'blog', 'testimonials'];

export function AdminHeader({ unreadCount = 0, onSearchClick }: AdminHeaderProps) {
  const { activeTab, openModal, setSidebarOpen } = useUIStore();
  const pageInfo = pageTitles[activeTab] || { title: 'Dashboard', subtitle: '' };
  const showCreate = pagesWithCreateButton.includes(activeTab);

  const handleCreate = () => {
    const map: Record<string, string> = {
      projects: 'project',
      experiences: 'experience',
      blog: 'blog',
      testimonials: 'testimonial',
    };
    const type = map[activeTab];
    if (type) openModal(type as any);
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg border border-border/70 bg-card/55 hover:bg-accent transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            Console admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
            {pageInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Search trigger */}
        <button
          onClick={onSearchClick}
          className="group flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-full border border-border/70 bg-card/55 text-muted-foreground backdrop-blur-xl hover:border-primary/40 hover:text-foreground transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[12px]">Rechercher...</span>
          <div className="hidden sm:flex items-center gap-0.5 ml-3">
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-secondary border border-border/70 text-muted-foreground group-hover:border-primary/30 transition-colors">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-secondary border border-border/70 text-muted-foreground group-hover:border-primary/30 transition-colors">
              K
            </kbd>
          </div>
        </button>

        {/* Notifications */}
        <button
          onClick={() => useUIStore.getState().setActiveTab('contacts')}
          className="relative p-2 rounded-full border border-border/70 bg-card/55 hover:bg-accent transition-colors"
        >
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>

        {/* Create */}
        {showCreate && (
          <Button
            onClick={handleCreate}
            size="sm"
            className="h-9 px-4 rounded-lg text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau
          </Button>
        )}
      </div>
    </header>
  );
}

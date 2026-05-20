import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore, applyTheme } from '@/stores/settingsStore';
import { useUnreadCount } from '@/hooks/queries';
import { useTabSync } from '@/hooks/useTabSync';
import { cn } from '@/lib/utils';

import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ExperiencesPage } from '../pages/ExperiencesPage';
import { BlogPage } from '../pages/BlogPage';
import { ContactsPage } from '../pages/ContactsPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { TestimonialsPage } from '../pages/TestimonialsPage';
import { NewsletterPage } from '../pages/NewsletterPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminModal } from '../shared/AdminModal';
import { CommandPalette } from '../shared/CommandPalette';

const pageComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  projects: ProjectsPage,
  experiences: ExperiencesPage,
  blog: BlogPage,
  contacts: ContactsPage,
  appointments: AppointmentsPage,
  testimonials: TestimonialsPage,
  newsletter: NewsletterPage,
  settings: SettingsPage,
};

export function AdminLayout() {
  const { activeTab, sidebarOpen, setSidebarOpen } = useUIStore();
  const { theme, display } = useSettingsStore();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [commandOpen, setCommandOpen] = useState(false);

  const ActivePage = pageComponents[activeTab] || DashboardPage;

  // Sync activeTab <-> URL ?tab= param
  useTabSync();

  // Apply persisted theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Close mobile sidebar on tab change
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab, setSidebarOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K -> open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }

      // "/" key when not in an input -> open command palette
      if (e.key === '/' && !commandOpen) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          setCommandOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);

  return (
    <div className={cn(
      'min-h-screen flex text-foreground',
      display.denseMode && 'text-[13px] [&_*]:leading-snug'
    )}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:relative z-40 lg:z-auto transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <AdminSidebar unreadCount={typeof unreadCount === 'number' ? unreadCount : 0} />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <AdminHeader
            unreadCount={typeof unreadCount === 'number' ? unreadCount : 0}
            onSearchClick={openCommand}
          />

          {display.animations ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <ActivePage />
              </motion.div>
            </AnimatePresence>
          ) : (
            <ActivePage />
          )}
        </div>
      </main>

      <AdminModal />
      <CommandPalette isOpen={commandOpen} onClose={closeCommand} />
    </div>
  );
}

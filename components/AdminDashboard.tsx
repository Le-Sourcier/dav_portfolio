
import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, BookOpen, Layers, Briefcase, Settings } from 'lucide-react';
import { PortfolioData } from '../types/index';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminContentListTab } from './AdminContentListTab';
import { AdminEditorTab } from './AdminEditorTab';
import { AdminProfileTab } from './AdminProfileTab';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
  onExit: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'blogs' | 'projects' | 'experience' | 'profile' | 'overview'>('overview');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Système', message: 'Connexion administrateur réussie.', time: 'À l\'instant', type: 'success', read: false },
    { id: '2', title: 'Backup', message: 'Dernière sauvegarde automatique effectuée.', time: 'Il y a 2h', type: 'info', read: true },
  ]);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title, message, time: 'À l\'instant', type, read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'logan') {
      setIsAuthenticated(true);
      setError('');
      addNotification('Sécurité', 'Accès autorisé à la console.', 'success');
    } else {
      setError('Clé d\'accès invalide.');
    }
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editingItem.id;
    let newBlogs = [...data.blogs];
    if (isNew) {
      const newItem = { 
        ...editingItem, 
        id: `blog-${Date.now()}`, 
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
      };
      newBlogs = [newItem, ...newBlogs];
      addNotification('Contenu', `Article "${editingItem.title}" créé.`, 'success');
    } else {
      newBlogs = newBlogs.map(b => b.id === editingItem.id ? editingItem : b);
      addNotification('Contenu', `Article "${editingItem.title}" mis à jour.`, 'info');
    }
    onUpdate({ ...data, blogs: newBlogs });
    setEditingItem(null);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const index = editingItem.index;
    const newProjects = [...data.projects];
    if (index === undefined) {
      newProjects.unshift(editingItem);
      addNotification('Portfolio', `Projet "${editingItem.title}" ajouté.`, 'success');
    } else {
      const { index, ...projectWithoutIndex } = editingItem;
      newProjects[index] = projectWithoutIndex;
      addNotification('Portfolio', `Projet "${editingItem.title}" modifié.`, 'info');
    }
    onUpdate({ ...data, projects: newProjects });
    setEditingItem(null);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const index = editingItem.index;
    const newExp = [...data.experiences];
    if (index === undefined) {
      newExp.unshift(editingItem);
      addNotification('Expérience', `Nouvelle expérience ajoutée.`, 'success');
    } else {
      const { index, ...expWithoutIndex } = editingItem;
      newExp[index] = expWithoutIndex;
      addNotification('Expérience', `Expérience mise à jour.`, 'info');
    }
    onUpdate({ ...data, experiences: newExp });
    setEditingItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    if (activeTab === 'blogs') handleSaveBlog(e);
    else if (activeTab === 'projects') handleSaveProject(e);
    else handleSaveExperience(e);
  };

  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord' },
    { id: 'blogs', icon: BookOpen, label: 'Articles & Médias' },
    { id: 'projects', icon: Layers, label: 'Portfolio Projets' },
    { id: 'experience', icon: Briefcase, label: 'Carrière & Exp' },
    { id: 'profile', icon: Settings, label: 'Configuration' }
  ];

  const getFilteredItems = () => {
    const query = searchTerm.toLowerCase().trim();
    if (activeTab === 'blogs') return data.blogs.filter(b => b.title.toLowerCase().includes(query) || b.category.toLowerCase().includes(query));
    if (activeTab === 'projects') return data.projects.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    if (activeTab === 'experience') return data.experiences.filter(e => e.role.toLowerCase().includes(query) || e.company.toLowerCase().includes(query));
    return [];
  };

  if (!isAuthenticated) return <AdminLogin password={password} setPassword={setPassword} error={error} onLogin={handleLogin} />;

  const filteredItems = getFilteredItems();
  const activeLabel = menuItems.find(m => m.id === activeTab)?.label || '';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex overflow-hidden font-sans">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setEditingItem(null); }} 
        menuItems={menuItems} onExit={onExit} name={data.name} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          setSidebarOpen={setSidebarOpen} activeTab={activeTab} activeLabel={activeLabel} 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          notifications={notifications} setNotifications={setNotifications}
          notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen}
          notificationRef={notificationRef} unreadCount={notifications.filter(n => !n.read).length}
        />

        <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar bg-slate-950/20">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {activeTab === 'overview' && (
              <AdminOverviewTab data={data} setActiveTab={setActiveTab} addNotification={addNotification} />
            )}

            {!editingItem && activeTab !== 'overview' && activeTab !== 'profile' && (
              <AdminContentListTab 
                activeTab={activeTab} 
                filteredItems={filteredItems} 
                onEdit={(item) => setEditingItem(activeTab === 'blogs' ? item : { ...item, index: data[activeTab === 'projects' ? 'projects' : 'experiences'].indexOf(item) })}
                onDelete={(item, idx) => {
                  if (confirm('Supprimer cette entrée ?')) {
                    const key = activeTab as 'blogs' | 'projects' | 'experiences';
                    onUpdate({ ...data, [key]: (data[key] as any[]).filter((_, i) => (activeTab === 'blogs' ? _.id : i) !== (activeTab === 'blogs' ? item.id : idx)) });
                    addNotification('Suppression', `L'élément a été supprimé.`, 'warning');
                  }
                }}
                onCreate={() => setEditingItem(activeTab === 'blogs' ? { title: '', excerpt: '', content: '', category: 'Code', tags: [], readTime: '5 min', image: '' } : activeTab === 'projects' ? { title: '', description: '', stack: [], category: 'Professional' } : { company: '', role: '', period: '', location: '', description: '', tasks: [] })}
              />
            )}

            {editingItem && (
              <AdminEditorTab 
                activeTab={activeTab} 
                editingItem={editingItem} 
                setEditingItem={setEditingItem} 
                onCancel={() => setEditingItem(null)} 
                onSave={handleSave} 
              />
            )}

            {activeTab === 'profile' && (
              <AdminProfileTab data={data} onUpdate={onUpdate} addNotification={addNotification} />
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

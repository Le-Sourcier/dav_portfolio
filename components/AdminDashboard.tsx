
import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Layers, Briefcase, Settings, ShieldAlert } from 'lucide-react';
import { PortfolioData, AdminRole } from '../types/index';
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
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [userRole, setUserRole] = useState<AdminRole>(() => (localStorage.getItem('admin_role') as AdminRole) || 'VIEWER');
  const [password, setPassword] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Système', message: 'Connexion administrateur réussie.', time: 'À l\'instant', type: 'success', read: false },
    { id: '2', title: 'Backup', message: 'Dernière sauvegarde automatique effectuée.', time: 'Il y a 2h', type: 'info', read: true },
  ]);
  
  const navigate = useNavigate();
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
    const newNotif: Notification = { id: Date.now().toString(), title, message, time: 'À l\'instant', type, read: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let role: AdminRole | null = null;

    if (password === 'logan' || password === 'admin') role = 'SUPER_ADMIN';
    else if (password === 'editor') role = 'EDITOR';
    else if (password === 'guest') role = 'VIEWER';

    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_role', role);
      setError('');
      addNotification('Sécurité', `Accès autorisé en tant que ${role}.`, 'success');
      navigate('/admin/overview');
    } else {
      setError('Clé d\'accès invalide.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('VIEWER');
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_role');
    navigate('/');
  };

  if (!isAuthenticated) return <AdminLogin password={password} setPassword={setPassword} error={error} onLogin={handleLogin} />;

  // Roles Definition
  const canAccessProfile = userRole === 'SUPER_ADMIN';
  const canModifyContent = userRole === 'SUPER_ADMIN' || userRole === 'EDITOR';
  const canDeleteContent = userRole === 'SUPER_ADMIN';

  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', allowed: true },
    { id: 'blogs', icon: BookOpen, label: 'Articles & Médias', allowed: true },
    { id: 'projects', icon: Layers, label: 'Portfolio Projets', allowed: true },
    { id: 'experience', icon: Briefcase, label: 'Carrière & Exp', allowed: true },
    { id: 'profile', icon: Settings, label: 'Configuration', allowed: canAccessProfile }
  ].filter(item => item.allowed);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex w-full overflow-hidden font-sans">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
        menuItems={menuItems} onExit={handleLogout} name={data.name} 
        role={userRole}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Routes>
          <Route path=":tab" element={<AdminContentWrapper 
            data={data} onUpdate={onUpdate} 
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            notifications={notifications} setNotifications={setNotifications}
            notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen}
            notificationRef={notificationRef} unreadCount={notifications.filter(n => !n.read).length}
            menuItems={menuItems} addNotification={addNotification}
            editingItem={editingItem} setEditingItem={setEditingItem}
            role={userRole}
            permissions={{ canModifyContent, canDeleteContent, canAccessProfile }}
          />} />
          <Route path="/" element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminContentWrapper: React.FC<any> = ({ 
  data, onUpdate, setSidebarOpen, searchTerm, setSearchTerm, 
  notifications, setNotifications, notificationsOpen, setNotificationsOpen, 
  notificationRef, unreadCount, menuItems, addNotification,
  editingItem, setEditingItem, role, permissions
}) => {
  const { tab } = useParams();
  const activeLabel = menuItems.find(m => m.id === tab)?.label || 'Administration';
  const navigate = useNavigate();

  // Route guarding within the wrapper
  useEffect(() => {
    if (tab === 'profile' && !permissions.canAccessProfile) {
      addNotification('Accès refusé', 'Vous n\'avez pas les permissions pour accéder à la configuration.', 'warning');
      navigate('/admin/overview');
    }
  }, [tab, permissions.canAccessProfile, navigate, addNotification]);

  const getFilteredItems = () => {
    const query = searchTerm.toLowerCase().trim();
    if (tab === 'blogs') return data.blogs.filter(b => b.title.toLowerCase().includes(query) || b.category.toLowerCase().includes(query));
    if (tab === 'projects') return data.projects.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    if (tab === 'experience') return data.experiences.filter(e => e.role.toLowerCase().includes(query) || e.company.toLowerCase().includes(query));
    return [];
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canModifyContent) {
      addNotification('Erreur', 'Permission de modification refusée.', 'warning');
      return;
    }

    if (tab === 'blogs') {
      const isNew = !editingItem.id;
      const newBlogs = isNew ? [{ ...editingItem, id: `blog-${Date.now()}`, date: new Date().toLocaleDateString('fr-FR') }, ...data.blogs] : data.blogs.map(b => b.id === editingItem.id ? editingItem : b);
      onUpdate({ ...data, blogs: newBlogs });
    } else if (tab === 'projects') {
      const newProjects = [...data.projects];
      if (editingItem.index === undefined) newProjects.unshift(editingItem); else newProjects[editingItem.index] = editingItem;
      onUpdate({ ...data, projects: newProjects });
    } else if (tab === 'experience') {
      const newExp = [...data.experiences];
      if (editingItem.index === undefined) newExp.unshift(editingItem); else newExp[editingItem.index] = editingItem;
      onUpdate({ ...data, experiences: newExp });
    }
    setEditingItem(null);
    addNotification('Système', 'Contenu mis à jour avec succès.', 'success');
  };

  return (
    <>
      <AdminHeader 
        setSidebarOpen={setSidebarOpen} activeTab={tab} activeLabel={activeLabel} 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        notifications={notifications} setNotifications={setNotifications}
        notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen}
        notificationRef={notificationRef} unreadCount={unreadCount}
        role={role}
      />
      <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar bg-slate-950/20">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          {tab === 'overview' && <AdminOverviewTab data={data} setActiveTab={() => {}} addNotification={addNotification} role={role} />}
          {tab === 'profile' && permissions.canAccessProfile && <AdminProfileTab data={data} onUpdate={onUpdate} addNotification={addNotification} />}
          {['blogs', 'projects', 'experience'].includes(tab!) && !editingItem && (
            <AdminContentListTab 
              activeTab={tab!} 
              filteredItems={getFilteredItems()} 
              onEdit={(item) => setEditingItem(tab === 'blogs' ? item : { ...item, index: data[tab === 'projects' ? 'projects' : 'experiences'].indexOf(item) })}
              onDelete={(item, idx) => { 
                if (!permissions.canDeleteContent) {
                  addNotification('Restriction', 'Seul le Super Admin peut supprimer du contenu.', 'warning');
                  return;
                }
                if (confirm('Confirmer la suppression définitive ?')) { 
                  onUpdate({ ...data, [tab === 'experience' ? 'experiences' : tab!]: data[tab === 'experience' ? 'experiences' : tab!].filter((_, i) => i !== idx) }); 
                  addNotification('Suppression', 'Contenu supprimé avec succès.', 'warning'); 
                } 
              }}
              onCreate={() => {
                if (!permissions.canModifyContent) {
                   addNotification('Restriction', 'Votre rôle ne permet pas la création de contenu.', 'warning');
                   return;
                }
                setEditingItem(tab === 'blogs' ? { title: '', excerpt: '', content: '', category: 'Code', tags: [], readTime: '5 min', image: '' } : { company: '', role: '', period: '', location: '', description: '', tasks: [] })
              }}
              permissions={permissions}
            />
          )}
          {editingItem && (
            <AdminEditorTab 
              activeTab={tab!} 
              editingItem={editingItem} 
              setEditingItem={setEditingItem} 
              onCancel={() => setEditingItem(null)} 
              onSave={handleSave}
              readOnly={!permissions.canModifyContent}
            />
          )}
        </div>
      </div>
    </>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Layers, Briefcase, Settings, ShieldAlert, Inbox, Mail, CheckCircle, Trash2, Clock, User } from 'lucide-react';
import { PortfolioData, AdminRole, ProjectRequest } from '../types/index';
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
  const canViewLeads = userRole === 'SUPER_ADMIN' || userRole === 'EDITOR';

  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', allowed: true },
    { id: 'inquiries', icon: Inbox, label: 'Demandes Clients', allowed: canViewLeads },
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
            permissions={{ canModifyContent, canDeleteContent, canAccessProfile, canViewLeads }}
          />} />
          <Route path="/" element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminRequestsTab: React.FC<{ requests: ProjectRequest[], onUpdate: (reqs: ProjectRequest[]) => void, addNotification: any }> = ({ requests, onUpdate, addNotification }) => {
  const toggleStatus = (id: string) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        const nextStatus: ProjectRequest['status'] = r.status === 'New' ? 'Contacted' : r.status === 'Contacted' ? 'Archived' : 'New';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    onUpdate(updated);
    addNotification('Système', 'Statut de la demande mis à jour.', 'info');
  };

  const deleteRequest = (id: string) => {
    if (confirm('Supprimer cette demande ?')) {
      onUpdate(requests.filter(r => r.id !== id));
      addNotification('Suppression', 'Demande client supprimée.', 'warning');
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
        <h3 className="text-2xl font-black text-white tracking-tight">Leads & Demandes de Projets</h3>
        <p className="text-slate-500 text-sm font-medium mt-1">Gérez les contacts entrants depuis le formulaire du portfolio.</p>
      </div>

      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col lg:flex-row gap-8 transition-all hover:border-blue-500/30">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  req.status === 'New' ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 
                  req.status === 'Contacted' ? 'bg-emerald-600/10 border-emerald-600 text-emerald-500' : 
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {req.status}
                </span>
                <span className="px-4 py-1.5 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">
                  {req.category}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {req.date}
                </span>
              </div>
              
              <div>
                <h4 className="text-xl font-black text-white flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-500" /> {req.clientName}
                </h4>
                <a href={`mailto:${req.clientEmail}`} className="text-sm font-bold text-blue-400 hover:underline flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" /> {req.clientEmail}
                </a>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">"{req.description}"</p>
                {req.budget && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-500 uppercase">
                    <Inbox className="w-3 h-3" /> Budget : {req.budget}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 justify-end lg:justify-start shrink-0">
              <button 
                onClick={() => toggleStatus(req.id)}
                className="h-14 w-14 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-lg"
                title="Changer le statut"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => deleteRequest(req.id)}
                className="h-14 w-14 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-lg"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="py-32 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <Mail className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Aucune demande client pour le moment.</p>
          </div>
        )}
      </div>
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

  // Load requests from localStorage on sync if needed
  useEffect(() => {
    const syncRequests = () => {
      const saved = localStorage.getItem('portfolio_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed.requests) !== JSON.stringify(data.requests)) {
          onUpdate(parsed);
        }
      }
    };
    window.addEventListener('storage', syncRequests);
    return () => window.removeEventListener('storage', syncRequests);
  }, [data, onUpdate]);

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
          {tab === 'inquiries' && permissions.canViewLeads && (
            <AdminRequestsTab 
              requests={data.requests || []} 
              onUpdate={(reqs) => onUpdate({...data, requests: reqs})} 
              addNotification={addNotification} 
            />
          )}
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

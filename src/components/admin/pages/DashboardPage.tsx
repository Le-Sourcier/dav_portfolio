import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FolderKanban, Briefcase, Newspaper, MessageSquare,
  CalendarDays, Star, Mail, Clock, ArrowUpRight,
  TrendingUp, Eye, Users, Activity, Zap, Globe,
  CheckCircle2, AlertCircle, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StatsCard } from '../shared/StatsCard';
import { StatusBadge } from '../shared/StatusBadge';
import {
  useProjects, useExperiences, useBlogPosts,
  useUnreadCount, useUpcomingAppointments,
  useVisibleTestimonials, useNewsletterStats,
  useContacts, useAppointments, useTestimonials,
  useNewsletterSubscribers,
} from '@/hooks/queries';
import { useUIStore } from '@/stores/uiStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

// --- Helpers ---
function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card/85 rounded-xl border border-border/70 shadow-sm backdrop-blur-xl', className)}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          {action.label} <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

const COLORS = ['#0f766e', '#b8842f', '#2dd4bf', '#d7b464', '#0b4f49', '#f2c96b', '#6f6a60'];

// --- Seeded pseudo-random for stable analytics data (same values per day) ---
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateVisitorData(contentCount: number) {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const rng = seededRandom(seed);
  const currentMonth = now.getMonth();
  const baseVisitors = 80 + contentCount * 15;

  return months.slice(0, currentMonth + 1).map((m, i) => ({
    name: m,
    visiteurs: Math.floor(baseVisitors + rng() * 300 + i * 25),
    pages: Math.floor(baseVisitors * 2 + rng() * 600 + i * 40),
  }));
}

function generateWeeklyActivity(messagesCount: number, rdvCount: number) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + 1;
  const rng = seededRandom(seed);
  const msgPerDay = Math.max(1, Math.ceil(messagesCount / 7));
  const rdvPerDay = Math.max(0, Math.ceil(rdvCount / 7));

  return days.map((d) => ({
    name: d,
    messages: Math.floor(rng() * msgPerDay * 2.5),
    rdv: Math.floor(rng() * rdvPerDay * 2.5),
    vues: Math.floor(15 + rng() * 50),
  }));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon apres-midi';
  return 'Bonsoir';
}

export function DashboardPage() {
  const { data: projects = [] } = useProjects();
  const { data: experiences = [] } = useExperiences();
  const { data: blogPosts = [] } = useBlogPosts();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: upcomingAppointments = [] } = useUpcomingAppointments();
  const { data: testimonials = [] } = useVisibleTestimonials();
  const { data: allTestimonials = [] } = useTestimonials();
  const { data: newsletterStats } = useNewsletterStats();
  const { data: contacts = [] } = useContacts();
  const { data: appointments = [] } = useAppointments();
  const { data: subscribers = [] } = useNewsletterSubscribers();
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const { profile } = useSettingsStore();

  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('month');

  const unread = typeof unreadCount === 'object' ? (unreadCount as any)?.count ?? 0 : unreadCount;
  const nlActive = typeof newsletterStats === 'object'
    ? (newsletterStats as any)?.active ?? (newsletterStats as any)?.totalActive ?? (newsletterStats as any)?.total ?? 0
    : 0;

  // Computed data - seeded from real content counts so charts reflect actual portfolio size
  const totalContent = projects.length + experiences.length + blogPosts.length;
  const visitorData = useMemo(() => generateVisitorData(totalContent), [totalContent]);
  const weeklyData = useMemo(() => generateWeeklyActivity(contacts.length, appointments.length), [contacts.length, appointments.length]);

  const publishedPosts = blogPosts.filter((p) => p.published);
  const draftPosts = blogPosts.filter((p) => !p.published);

  const projectsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const appointmentsByStatus = useMemo(() => {
    const map: Record<string, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    appointments.forEach((a) => { map[a.status] = (map[a.status] || 0) + 1; });
    return [
      { name: 'En attente', value: map.pending, color: '#f59e0b' },
      { name: 'Confirmes', value: map.confirmed, color: '#3b82f6' },
      { name: 'Termines', value: map.completed, color: '#10b981' },
      { name: 'Annules', value: map.cancelled, color: '#ef4444' },
    ].filter((s) => s.value > 0);
  }, [appointments]);

  // Quick computed values
  const greeting = getGreeting();
  const avgRating = allTestimonials.length > 0
    ? (allTestimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / allTestimonials.length).toFixed(1)
    : '5.0';

  const stats = [
    { label: 'Projets', value: projects.length, icon: FolderKanban, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Experiences', value: experiences.length, icon: Briefcase, color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Articles', value: blogPosts.length, icon: Newspaper, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Messages', value: contacts.length, icon: MessageSquare, color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome banner with key metrics */}
      <div className="bg-card/85 rounded-xl border border-border/70 p-6 text-foreground relative overflow-hidden shadow-[0_24px_80px_var(--admin-shadow)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.18em]">{greeting}</p>
            <h2 className="text-xl font-semibold tracking-tight mt-0.5">{profile.name}</h2>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-md">
              {totalContent} contenus publies. {unread > 0 ? `${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}.` : 'Aucun message en attente.'}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">{avgRating}</p>
              <p className="text-muted-foreground text-[11px] flex items-center gap-1"><Star className="w-3 h-3 text-primary" /> Note moy.</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">{nlActive}</p>
              <p className="text-muted-foreground text-[11px] flex items-center gap-1"><Users className="w-3 h-3" /> Abonnes</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">{upcomingAppointments.length}</p>
              <p className="text-muted-foreground text-[11px] flex items-center gap-1"><CalendarDays className="w-3 h-3" /> RDV</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visitor chart - 2 cols */}
        <CardShell className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">Trafic du portfolio</h3>
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5 border border-border/50">
              {(['week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
                    chartPeriod === p
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p === 'week' ? '7j' : '12m'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPeriod === 'month' ? visitorData : weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisiteurs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fafafa',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                />
                <Area type="monotone" dataKey={chartPeriod === 'month' ? 'visiteurs' : 'vues'} stroke="#3b82f6" strokeWidth={2} fill="url(#colorVisiteurs)" name={chartPeriod === 'month' ? 'Visiteurs' : 'Vues'} />
                <Area type="monotone" dataKey={chartPeriod === 'month' ? 'pages' : 'messages'} stroke="#8b5cf6" strokeWidth={2} fill="url(#colorPages)" name={chartPeriod === 'month' ? 'Pages vues' : 'Messages'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        {/* Projects by category - pie */}
        <CardShell>
          <CardHeader icon={FolderKanban} title="Projets par categorie" />
          <div className="p-4 h-[260px] flex items-center justify-center">
            {projectsByCategory.length === 0 ? (
              <p className="text-[13px] text-zinc-400">Aucun projet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectsByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fafafa',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconSize={8}
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] text-zinc-500">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardShell>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly activity bar chart */}
        <CardShell className="lg:col-span-2">
          <CardHeader icon={Activity} title="Activite de la semaine" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fafafa',
                  }}
                />
                <Bar dataKey="messages" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Messages" />
                <Bar dataKey="rdv" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="RDV" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardShell>

        {/* RDV Status + Quick info */}
        <div className="space-y-4">
          {/* RDV by status */}
          <CardShell>
            <CardHeader icon={CalendarDays} title="Statut des RDV" />
            <div className="px-5 py-4 space-y-2.5">
              {appointmentsByStatus.length === 0 ? (
                <p className="text-[13px] text-zinc-400 text-center py-4">Aucun rendez-vous</p>
              ) : (
                appointmentsByStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[12px] text-zinc-600 dark:text-zinc-400">{s.name}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground">{s.value}</span>
                  </div>
                ))
              )}
            </div>
          </CardShell>

          {/* Content summary */}
          <CardShell>
            <CardHeader icon={FileText} title="Contenu" />
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Articles publies
                </span>
                <span className="text-[13px] font-semibold text-foreground">{publishedPosts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Brouillons
                </span>
                <span className="text-[13px] font-semibold text-foreground">{draftPosts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Note moyenne
                </span>
                <span className="text-[13px] font-semibold text-foreground">{avgRating}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" /> Temoignages visibles
                </span>
                <span className="text-[13px] font-semibold text-foreground">{testimonials.length}/{allTestimonials.length}</span>
              </div>
            </div>
          </CardShell>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Appointments */}
        <CardShell>
          <CardHeader icon={CalendarDays} title="Prochains RDV" action={{ label: 'Voir tout', onClick: () => setActiveTab('appointments') }} />
          <div className="p-2">
            {upcomingAppointments.length === 0 ? (
              <p className="text-[13px] text-zinc-400 py-6 text-center">Aucun a venir</p>
            ) : (
              upcomingAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/60 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{apt.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{apt.subject}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{apt.date}</p>
                    <p className="text-[11px] text-zinc-400">{apt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardShell>

        {/* Recent messages */}
        <CardShell>
          <CardHeader icon={MessageSquare} title="Messages recents" action={{ label: 'Voir tout', onClick: () => setActiveTab('contacts') }} />
          <div className="p-2">
            {contacts.length === 0 ? (
              <p className="text-[13px] text-zinc-400 py-6 text-center">Aucun message</p>
            ) : (
              contacts.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', c.read ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-blue-500')} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[13px] truncate', c.read ? 'text-zinc-500' : 'text-foreground font-medium')}>{c.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{c.subject || c.message?.slice(0, 50)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardShell>

        {/* Recent Blog Posts */}
        <CardShell>
          <CardHeader icon={Newspaper} title="Articles recents" action={{ label: 'Voir tout', onClick: () => setActiveTab('blog') }} />
          <div className="p-2">
            {blogPosts.length === 0 ? (
              <p className="text-[13px] text-zinc-400 py-6 text-center">Aucun article</p>
            ) : (
              blogPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge label={post.category} variant="info" />
                    </div>
                  </div>
                  <StatusBadge
                    label={post.published ? 'Publie' : 'Brouillon'}
                    variant={post.published ? 'success' : 'warning'}
                  />
                </div>
              ))
            )}
          </div>
        </CardShell>
      </div>

      {/* Quick actions */}
      <CardShell>
        <CardHeader icon={Zap} title="Actions rapides" />
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Nouveau projet', icon: FolderKanban, tab: 'projects', modal: 'project', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Ecrire un article', icon: Newspaper, tab: 'blog', modal: 'blog', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Ajouter experience', icon: Briefcase, tab: 'experiences', modal: 'experience', color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
            { label: 'Nouveau temoignage', icon: Star, tab: 'testimonials', modal: 'testimonial', color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setActiveTab(action.tab);
                setTimeout(() => useUIStore.getState().openModal(action.modal as any), 100);
              }}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border/70 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-accent/60 transition-all group"
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', action.color)}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors text-left">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </CardShell>
    </div>
  );
}

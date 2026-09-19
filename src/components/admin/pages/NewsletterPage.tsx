import { Mail, Users, UserCheck } from 'lucide-react';
import { useNewsletterSubscribers, useNewsletterStats } from '@/hooks/queries';
import { DataTable, type Column } from '../shared/DataTable';
import { StatsCard } from '../shared/StatsCard';
import { StatusBadge } from '../shared/StatusBadge';
import type { NewsletterSubscriber } from '@/types/admin.types';

export function NewsletterPage() {
  const { data: subscribers = [], isLoading } = useNewsletterSubscribers();
  const { data: stats } = useNewsletterStats();

  const nlStats = stats;
  const statsCards = [
    {
      label: 'Total abonnes',
      value: nlStats?.total ?? subscribers.length,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Abonnes actifs',
      value: nlStats?.active ?? nlStats?.totalActive ?? subscribers.filter((s) => s.active).length,
      icon: UserCheck,
      color: 'text-emerald-500',
    },
    {
      label: 'Desinscriptions',
      value: (nlStats?.total ?? 0) - (nlStats?.active ?? nlStats?.totalActive ?? 0) || subscribers.filter((s) => !s.active).length,
      icon: Mail,
      color: 'text-orange-500',
    },
  ];

  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: 'email',
      label: 'Email',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.active ? 'bg-emerald-500/10' : 'bg-secondary'}`}>
            <Mail className={`w-4 h-4 ${item.active ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </div>
          <span className="text-sm font-medium">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      render: (item) => (
        <StatusBadge
          label={item.active ? 'Actif' : 'Desabonne'}
          variant={item.active ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'subscribedAt',
      label: 'Inscrit le',
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.subscribedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>

      {/* Subscribers table */}
      <DataTable
        columns={columns}
        data={subscribers}
        isLoading={isLoading}
        getItemId={(item) => item.id}
        showActions={false}
        emptyMessage="Aucun abonne."
      />
    </div>
  );
}

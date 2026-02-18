import { useState } from 'react';
import { useAppointments, useDeleteAppointment, useUpdateAppointmentStatus } from '@/hooks/queries';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { Calendar, Clock, User, Mail, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types/admin.types';

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  cancelled: 'Annule',
  completed: 'Termine',
  expired: 'Expire',
};

const statusVariants: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'info',
  expired: 'neutral',
};

// State machine — only show valid transitions from current status
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  expired: [],
};

export function AppointmentsPage() {
  const { data: appointments = [], isLoading } = useAppointments();
  const deleteMutation = useDeleteAppointment();
  const updateStatusMutation = useUpdateAppointmentStatus();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Appointment | null>(null);

  const columns: Column<Appointment>[] = [
    {
      key: 'name',
      label: 'Client',
      render: (item) => (
        <div>
          <p className="font-medium text-[13px] text-zinc-800 dark:text-zinc-200">{item.name}</p>
          <p className="text-[11px] text-zinc-400">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Sujet',
      render: (item) => <span className="text-[12px] text-zinc-600 dark:text-zinc-400 truncate max-w-[180px] block">{item.subject}</span>,
    },
    {
      key: 'date',
      label: 'Date & Heure',
      render: (item) => (
        <div>
          <p className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">{item.date}</p>
          <p className="text-[11px] text-zinc-400">{item.time}</p>
        </div>
      ),
    },
    {
      key: 'urgency',
      label: 'Urgence',
      render: (item) => (
        <StatusBadge
          label={item.urgency === 'urgent' ? 'Urgent' : 'Normal'}
          variant={item.urgency === 'urgent' ? 'danger' : 'neutral'}
        />
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => (
        VALID_TRANSITIONS[item.status]?.length > 0 ? (
          <select
            value={item.status}
            onChange={(e) => {
              e.stopPropagation();
              updateStatusMutation.mutate({
                id: item.id,
                status: e.target.value as AppointmentStatus,
              });
            }}
            className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none"
          >
            <option value={item.status}>{statusLabels[item.status]}</option>
            {VALID_TRANSITIONS[item.status].map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        ) : (
          <StatusBadge label={statusLabels[item.status]} variant={statusVariants[item.status]} />
        )
      ),
    },
  ];

  const handleView = (item: Appointment) => {
    setViewingItem(item);
  };

  const handleDelete = (item: Appointment) => {
    setDeleteId(item.id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={appointments}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun rendez-vous."
      />

      {/* Appointment detail modal */}
      {viewingItem && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="bg-card border border-border w-full max-w-lg rounded-[2rem] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{viewingItem.name}</h3>
                <a href={`mailto:${viewingItem.email}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                  {viewingItem.email} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="text-sm font-bold">{viewingItem.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Heure</p>
                  <p className="text-sm font-bold">{viewingItem.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Urgence</p>
                  <p className="text-sm font-bold">{viewingItem.urgency === 'urgent' ? 'Urgent' : 'Non urgent'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="shrink-0">
                  <StatusBadge
                    label={statusLabels[viewingItem.status] || viewingItem.status}
                    variant={statusVariants[viewingItem.status] || 'neutral'}
                  />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Sujet</p>
              <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                <p className="text-sm font-medium leading-relaxed">{viewingItem.subject}</p>
              </div>
            </div>

            {/* Notes */}
            {viewingItem.notes && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingItem.notes}</p>
                </div>
              </div>
            )}

            {/* Status change */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Statut actuel</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge label={statusLabels[viewingItem.status]} variant={statusVariants[viewingItem.status]} />
              </div>
              {VALID_TRANSITIONS[viewingItem.status]?.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Actions possibles</p>
                  <div className="flex flex-wrap gap-2">
                    {VALID_TRANSITIONS[viewingItem.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          updateStatusMutation.mutate({ id: viewingItem.id, status: s });
                          setViewingItem({ ...viewingItem, status: s });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border bg-transparent border-border hover:bg-secondary/50"
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {VALID_TRANSITIONS[viewingItem.status]?.length === 0 && (
                <p className="text-[11px] text-muted-foreground italic">Ce statut est terminal — aucune action possible.</p>
              )}
            </div>

            {/* Meta */}
            {viewingItem.createdAt && (
              <p className="text-[11px] text-muted-foreground">
                Reserve le {new Date(viewingItem.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le rendez-vous"
        message="Ce rendez-vous sera definitivement supprime."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

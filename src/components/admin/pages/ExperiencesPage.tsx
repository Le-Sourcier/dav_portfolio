import { useState, useEffect } from 'react';
import { useExperiences, useDeleteExperience } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ExperienceEditorPage } from './ExperienceEditorPage';
import type { Experience } from '@/types/admin.types';

export function ExperiencesPage() {
  const { data: experiences = [], isLoading } = useExperiences();
  const deleteMutation = useDeleteExperience();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);

  // Intercept openModal('experience') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'experience') {
      setEditingItem((modal.data as Experience) || null);
      setEditorOpen(true);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

  const columns: Column<Experience>[] = [
    {
      key: 'title',
      label: 'Poste / Entreprise',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.coverImage && (
            <img src={item.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[13px] text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{item.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Lieu',
      render: (item) => (
        <span className="text-[12px] text-zinc-500">{item.location || '-'}</span>
      ),
    },
    {
      key: 'dates',
      label: 'Periode',
      render: (item) => <StatusBadge label={item.dates} variant="neutral" />,
    },
    {
      key: 'stack',
      label: 'Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {(item.stack || []).slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold">{tech}</span>
          ))}
          {(item.stack || []).length > 3 && (
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400">
              +{item.stack!.length - 3}
            </span>
          )}
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handleEdit = (item: Experience) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleDelete = (item: Experience) => {
    setDeleteId(item.id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  // Show editor page
  if (editorOpen) {
    return (
      <ExperienceEditorPage
        initialData={editingItem}
        onBack={() => setEditorOpen(false)}
      />
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreate}
          className="h-9 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
        >
          + Nouvelle experience
        </button>
      </div>

      <DataTable
        columns={columns}
        data={experiences}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucune experience. Cliquez sur 'Nouvelle experience' pour commencer."
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'experience"
        message="Cette action est irreversible."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

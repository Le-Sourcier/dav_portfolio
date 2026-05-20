import { useState, useEffect } from 'react';
import { useProjects, useDeleteProject } from '@/hooks/queries';
import { useUIStore, selectModal } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ProjectEditorPage } from './ProjectEditorPage';
import type { Project } from '@/types/admin.types';

export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteMutation = useDeleteProject();
  const modal = useUIStore(selectModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);

  // Intercept openModal('project') from header/dashboard quick actions
  useEffect(() => {
    if (modal.isOpen && modal.type === 'project') {
      setEditingItem((modal.data as Project) || null);
      setEditorOpen(true);
      closeModal();
    }
  }, [modal.isOpen, modal.type, modal.data, closeModal]);

  const columns: Column<Project>[] = [
    {
      key: 'title',
      label: 'Projet',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[13px] text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{item.description?.slice(0, 60)}...</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categorie',
      render: (item) => <StatusBadge label={item.category} variant="info" />,
    },
    {
      key: 'technologies',
      label: 'Stack',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(item.technologies || []).slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold">{tech}</span>
          ))}
          {(item.technologies || []).length > 3 && (
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400">
              +{item.technologies!.length - 3}
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

  const handleEdit = (item: Project) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleDelete = (item: Project) => {
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
      <ProjectEditorPage
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
          + Nouveau projet
        </button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun projet. Cliquez sur 'Nouveau projet' pour commencer."
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le projet"
        message="Cette action est irreversible."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

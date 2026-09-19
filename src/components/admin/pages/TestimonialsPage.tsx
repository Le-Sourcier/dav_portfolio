import { useState } from 'react';
import { useTestimonials, useDeleteTestimonial, useToggleTestimonialVisibility } from '@/hooks/queries';
import { useUIStore } from '@/stores/uiStore';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { Star } from 'lucide-react';
import type { Testimonial } from '@/types/admin.types';

export function TestimonialsPage() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const deleteMutation = useDeleteTestimonial();
  const toggleVisibility = useToggleTestimonialVisibility();
  const openModal = useUIStore((s) => s.openModal);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: Column<Testimonial>[] = [
    {
      key: 'name',
      label: 'Client',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-primary">{item.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-bold text-sm">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.role} {item.company ? `- ${item.company}` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Temoignage',
      render: (item) => (
        <p className="text-xs text-muted-foreground truncate max-w-[250px] italic">
          "{item.content.slice(0, 100)}..."
        </p>
      ),
    },
    {
      key: 'rating',
      label: 'Note',
      render: (item) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
      ),
    },
    {
      key: 'visible',
      label: 'Visibilite',
      render: (item) => (
        <button
          onClick={() => toggleVisibility.mutate(item.id)}
          className="flex items-center gap-1.5"
        >
          {item.visible ? (
            <StatusBadge label="Visible" variant="success" />
          ) : (
            <StatusBadge label="Masque" variant="neutral" />
          )}
        </button>
      ),
    },
  ];

  const handleEdit = (item: Testimonial) => {
    openModal('testimonial', item);
  };

  const handleDelete = (item: Testimonial) => {
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
        data={testimonials}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun temoignage. Cliquez sur 'Nouveau' pour en ajouter."
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le temoignage"
        message="Ce temoignage sera definitivement supprime."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

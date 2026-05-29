import { useEffect, useState } from 'react';
import { Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggleVisibility?: (item: T) => void;
  onView?: (item: T) => void;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  showActions?: boolean;
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  onToggleVisibility,
  onView,
  getItemId,
  emptyMessage = 'Aucun element trouve.',
  showActions = true,
  pageSize = 0,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const hasPagination = pageSize > 0 && data.length > pageSize;
  const totalPages = hasPagination ? Math.ceil(data.length / pageSize) : 1;
  const paginatedData = hasPagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="admin-glass-card rounded-2xl border overflow-hidden shadow-[0_18px_55px_var(--admin-shadow)]">
        <div className="p-7 space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-6 animate-pulse">
              <div className="h-4 bg-secondary rounded-full w-1/3" />
              <div className="h-4 bg-secondary rounded-full w-1/4" />
              <div className="h-4 bg-secondary rounded-full w-1/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-glass-card rounded-2xl border overflow-hidden shadow-[0_18px_55px_var(--admin-shadow)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-5 text-left text-[11px] font-black text-primary uppercase tracking-[0.16em]',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-5 text-right text-[11px] font-black text-primary uppercase tracking-[0.16em] w-[140px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-5 py-16 text-center"
                >
                  <p className="text-sm text-zinc-400 dark:text-zinc-600">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr
                  key={getItemId(item)}
                  className={cn(
                    'group transition-colors hover:bg-accent/60',
                    idx !== paginatedData.length - 1 && 'border-b border-border/55'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-6 py-5 align-middle', col.className)}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onToggleVisibility && (
                          <button
                            onClick={() => onToggleVisibility(item)}
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                            title="Visibilite"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasPagination && (
        <div className="flex items-center justify-between px-6 py-5 border-t border-border/70">
          <p className="text-[11px] text-zinc-400">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.length)} sur {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

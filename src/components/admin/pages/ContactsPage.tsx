import { useState } from 'react';
import { useContacts, useDeleteContact, useMarkAsRead, useReplyContact } from '@/hooks/queries';
import { DataTable, type Column } from '../shared/DataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { Mail, MailOpen, ExternalLink, Send, MessageSquareReply, Loader2 } from 'lucide-react';
import type { Contact } from '@/types/admin.types';

export function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const deleteMutation = useDeleteContact();
  const markAsReadMutation = useMarkAsRead();
  const replyMutation = useReplyContact();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState('');

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      label: 'Expediteur',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.read ? 'bg-secondary' : 'bg-primary/10'}`}>
            {item.read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <p className={`text-sm ${item.read ? 'font-medium' : 'font-black'}`}>{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Sujet',
      render: (item) => (
        <p className={`text-sm truncate max-w-[200px] ${item.read ? '' : 'font-bold'}`}>
          {item.subject || 'Sans sujet'}
        </p>
      ),
    },
    {
      key: 'message',
      label: 'Apercu',
      render: (item) => (
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {item.message?.slice(0, 80)}...
        </p>
      ),
    },
    {
      key: 'read',
      label: 'Statut',
      render: (item) => {
        if (item.reply) {
          return <StatusBadge label="Repondu" variant="success" />;
        }
        return (
          <StatusBadge
            label={item.read ? 'Lu' : 'Non lu'}
            variant={item.read ? 'neutral' : 'info'}
          />
        );
      },
    },
  ];

  const handleView = (item: Contact) => {
    setViewingContact(item);
    setReplyText('');
    if (!item.read) {
      markAsReadMutation.mutate(item.id);
    }
  };

  const handleDelete = (item: Contact) => {
    setDeleteId(item.id);
  };

  const handleSendReply = () => {
    if (!viewingContact || replyText.trim().length < 10) return;
    replyMutation.mutate(
      { id: viewingContact.id, reply: replyText.trim() },
      {
        onSuccess: (updated) => {
          setViewingContact(updated);
          setReplyText('');
        },
      }
    );
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
        data={contacts}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        getItemId={(item) => item.id}
        emptyMessage="Aucun message recu."
      />

      {/* Contact detail modal */}
      {viewingContact && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setViewingContact(null)}
        >
          <div
            className="bg-card border border-border w-full max-w-2xl rounded-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{viewingContact.name}</h3>
                <a href={`mailto:${viewingContact.email}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                  {viewingContact.email} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button onClick={() => setViewingContact(null)} className="p-2 hover:bg-secondary rounded-full">
                <span className="text-lg">&times;</span>
              </button>
            </div>
            {viewingContact.subject && (
              <p className="text-sm font-bold mb-4">Sujet : {viewingContact.subject}</p>
            )}
            <div className="bg-secondary/30 rounded-xl p-6">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingContact.message}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Recu le {new Date(viewingContact.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {/* Reply section */}
            <div className="mt-6 pt-6 border-t border-border">
              {viewingContact.reply ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquareReply className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-500">Reponse envoyee</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingContact.reply}</p>
                  </div>
                  {viewingContact.repliedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Repondu le {new Date(viewingContact.repliedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquareReply className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Repondre</span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ecrivez votre reponse (minimum 10 caracteres)..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-secondary/30 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSendReply}
                      disabled={replyText.trim().length < 10 || replyMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Envoyer la reponse
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le message"
        message="Ce message sera definitivement supprime."
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

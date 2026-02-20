import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contactsApi } from '@/services/api';
import type { Contact } from '@/types/admin.types';

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  unreadCount: () => [...contactKeys.all, 'unread'] as const,
};

// Get All Contacts
export function useContacts() {
  return useQuery({
    queryKey: contactKeys.lists(),
    queryFn: () => contactsApi.getAll(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get Contact by ID
export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  });
}

// Get Unread Count
export function useUnreadCount() {
  return useQuery({
    queryKey: contactKeys.unreadCount(),
    queryFn: async () => {
      const result = await contactsApi.getUnreadCount();
      return typeof result === 'number' ? result : result?.count ?? 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Mark as Read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.markAsRead(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<Contact[]>(contactKeys.lists(), (old) =>
        old?.map((c) => (c.id === updated.id ? updated : c))
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.unreadCount() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du marquage');
    },
  });
}

// Reply to Contact
export function useReplyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      contactsApi.reply(id, reply),
    onSuccess: (updated) => {
      queryClient.setQueryData<Contact[]>(contactKeys.lists(), (old) =>
        old?.map((c) => (c.id === updated.id ? updated : c))
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.unreadCount() });
      toast.success('Reponse envoyee avec succes');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi de la reponse');
    },
  });
}

// Delete Contact
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Contact[]>(contactKeys.lists(), (old) =>
        old?.filter((c) => c.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: contactKeys.unreadCount() });
      toast.success('Message supprime');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// Send Contact (public)
export function useSendContact() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject?: string; message: string }) =>
      contactsApi.create(data),
    onSuccess: () => {
      toast.success('Message envoye avec succes');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    },
  });
}

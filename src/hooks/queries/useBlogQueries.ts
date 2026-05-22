import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogApi } from '@/services/api';
import type { BlogCommentFilters, BlogPost, BlogPostFormData, BlogTagFormData } from '@/types/admin.types';

// Query Keys
export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
  bySlug: (slug: string) => [...blogKeys.all, 'slug', slug] as const,
  stats: () => [...blogKeys.all, 'stats'] as const,
  tags: () => [...blogKeys.all, 'tags'] as const,
  tagStats: () => [...blogKeys.all, 'tag-stats'] as const,
  comments: (filters: BlogCommentFilters) => [...blogKeys.all, 'comments', filters] as const,
  commentThread: (id: string) => [...blogKeys.all, 'comment-thread', id] as const,
};

// Get All Posts
export function useBlogPosts(published?: boolean) {
  return useQuery({
    queryKey: blogKeys.list({ published }),
    queryFn: () => blogApi.getAll(published),
    staleTime: 2 * 60 * 1000,
  });
}

// Get Post by ID
export function useBlogPost(id: string) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => blogApi.getById(id),
    enabled: !!id,
  });
}

// Get Post by Slug
export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: blogKeys.bySlug(slug),
    queryFn: () => blogApi.getBySlug(slug),
    enabled: !!slug,
  });
}

// Create Post
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogPostFormData) => blogApi.create(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      toast.success('Article cree avec succes');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la creation');
    },
  });
}

// Update Post
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostFormData> }) =>
      blogApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<BlogPost[]>(blogKeys.lists(), (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p))
      );
      queryClient.setQueryData(blogKeys.detail(updated.id), updated);
      if (updated.slug) {
        queryClient.setQueryData(blogKeys.bySlug(updated.slug), updated);
      }
      toast.success('Article mis a jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise a jour');
    },
  });
}

// Delete Post
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.removeQueries({ queryKey: blogKeys.detail(deletedId) });
      toast.success('Article supprime');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// Add Comment
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: { author: string; email: string; content: string };
    }) => blogApi.addComment(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(postId) });
      toast.success('Commentaire ajoute');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du commentaire');
    },
  });
}

export function useBlogComments(filters: BlogCommentFilters) {
  return useQuery({
    queryKey: blogKeys.comments(filters),
    queryFn: () => blogApi.getComments(filters),
    staleTime: 30 * 1000,
  });
}

export function useBlogCommentThread(commentId: string) {
  return useQuery({
    queryKey: blogKeys.commentThread(commentId),
    queryFn: () => blogApi.getCommentThread(commentId),
    enabled: !!commentId,
  });
}

export function useReplyToBlogComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: { author: string; email: string; content: string; mentions?: string[] };
    }) => blogApi.replyToComment(commentId, data),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      queryClient.invalidateQueries({ queryKey: blogKeys.commentThread(commentId) });
      toast.success('Reponse envoyee');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi de la reponse');
    },
  });
}

export function useDeleteBlogComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => blogApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Commentaire supprime');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du commentaire');
    },
  });
}

// Track View (fire-and-forget)
export function useTrackView() {
  return useMutation({
    mutationFn: (postId: string) => blogApi.trackView(postId),
  });
}

// Track Share (fire-and-forget)
export function useTrackShare() {
  return useMutation({
    mutationFn: (postId: string) => blogApi.trackShare(postId),
  });
}

// Blog Stats (admin)
export function useBlogStats() {
  return useQuery({
    queryKey: blogKeys.stats(),
    queryFn: () => blogApi.getStats(),
    staleTime: 30 * 1000,
  });
}

export function useBlogTags() {
  return useQuery({
    queryKey: blogKeys.tags(),
    queryFn: () => blogApi.getTags(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBlogTagStats() {
  return useQuery({
    queryKey: blogKeys.tagStats(),
    queryFn: () => blogApi.getTagStats(),
    staleTime: 30 * 1000,
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogTagFormData) => blogApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Tag cree');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la creation du tag');
    },
  });
}

export function useUpdateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogTagFormData> }) => blogApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Tag mis a jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise a jour du tag');
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Tag supprime');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du tag');
    },
  });
}

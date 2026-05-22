import { apiClient } from './client';
import type { BlogPost, BlogPostFormData, BlogComment, BlogStats } from '@/types/admin.types';

export const blogApi = {
  async getAll(published?: boolean): Promise<BlogPost[]> {
    const query = published !== undefined ? `?published=${published}` : '';
    return apiClient.get<BlogPost[]>(`/blog${query}`);
  },

  async getById(id: string): Promise<BlogPost> {
    return apiClient.get<BlogPost>(`/blog/${id}`);
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    return apiClient.get<BlogPost>(`/blog/slug/${slug}`);
  },

  async create(data: BlogPostFormData): Promise<BlogPost> {
    return apiClient.post<BlogPost>('/blog', data);
  },

  async update(id: string, data: Partial<BlogPostFormData>): Promise<BlogPost> {
    return apiClient.put<BlogPost>(`/blog/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/blog/${id}`);
  },

  async addComment(
    postId: string,
    data: { author: string; email: string; content: string }
  ): Promise<BlogComment> {
    return apiClient.post<BlogComment>(`/blog/${postId}/comments`, data);
  },

  async deleteComment(commentId: string): Promise<void> {
    return apiClient.delete(`/blog/comments/${commentId}`);
  },

  async trackView(postId: string): Promise<void> {
    return apiClient.post(`/blog/${postId}/view`, {});
  },

  async trackShare(postId: string): Promise<void> {
    return apiClient.post(`/blog/${postId}/share`, {});
  },

  async getStats(): Promise<BlogStats> {
    return apiClient.get<BlogStats>('/blog/stats/overview');
  },
};

export default blogApi;

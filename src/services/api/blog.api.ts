import { apiClient } from './client';
import type {
  BlogComment,
  BlogCommentFilters,
  BlogCommentListResponse,
  BlogPost,
  BlogPostFormData,
  BlogStats,
  BlogTag,
  BlogTagFormData,
} from '@/types/admin.types';

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

  async getComments(filters: BlogCommentFilters = {}): Promise<BlogCommentListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<BlogCommentListResponse>(`/blog/comments${query}`);
  },

  async getCommentThread(commentId: string): Promise<BlogComment> {
    return apiClient.get<BlogComment>(`/blog/comments/${commentId}/thread`);
  },

  async replyToComment(
    commentId: string,
    data: { author: string; email: string; content: string; mentions?: string[] }
  ): Promise<BlogComment> {
    return apiClient.post<BlogComment>(`/blog/comments/${commentId}/replies`, data);
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

  async getTags(): Promise<BlogTag[]> {
    return apiClient.get<BlogTag[]>('/blog/tags');
  },

  async getTagStats(): Promise<BlogTag[]> {
    return apiClient.get<BlogTag[]>('/blog/tags/stats');
  },

  async getTagBySlug(slug: string): Promise<BlogTag> {
    return apiClient.get<BlogTag>(`/blog/tags/slug/${slug}`);
  },

  async createTag(data: BlogTagFormData): Promise<BlogTag> {
    return apiClient.post<BlogTag>('/blog/tags', data);
  },

  async updateTag(id: string, data: Partial<BlogTagFormData>): Promise<BlogTag> {
    return apiClient.put<BlogTag>(`/blog/tags/${id}`, data);
  },

  async deleteTag(id: string): Promise<void> {
    return apiClient.delete(`/blog/tags/${id}`);
  },
};

export default blogApi;

import { apiClient } from "@/services/api/client";
import type { BackendBlogPost } from "@/types/backend.types";

export const blogApi = {
  getAll: () => apiClient.get<BackendBlogPost[]>("/blog"),
  getById: (id: string) => apiClient.get<BackendBlogPost>(`/blog/${id}`),
  getBySlug: (slug: string) => apiClient.get<BackendBlogPost>(`/blog/slug/${slug}`),
  trackView: (id: string) => apiClient.post<{ ok: boolean }>(`/blog/${id}/view`),
  trackShare: (id: string) => apiClient.post<{ ok: boolean }>(`/blog/${id}/share`),
};

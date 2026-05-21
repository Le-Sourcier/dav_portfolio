import { apiClient } from "@/services/api/client";
import type { BackendTestimonial } from "@/types/backend.types";

export const testimonialsApi = {
  getVisible: () => apiClient.get<BackendTestimonial[]>("/testimonials"),
  getById: (id: string) => apiClient.get<BackendTestimonial>(`/testimonials/${id}`),
};

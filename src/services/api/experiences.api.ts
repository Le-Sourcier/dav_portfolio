import { apiClient } from "@/services/api/client";
import type { BackendExperience } from "@/types/backend.types";

export const experiencesApi = {
  getAll: () => apiClient.get<BackendExperience[]>("/experiences"),
  getById: (id: string) => apiClient.get<BackendExperience>(`/experiences/${id}`),
};

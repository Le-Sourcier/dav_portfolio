import { apiClient } from "@/services/api/client";
import type { BackendContact, ContactPayload } from "@/types/backend.types";

export const contactsApi = {
  create: (payload: ContactPayload) => apiClient.post<BackendContact>("/contact", payload),
};

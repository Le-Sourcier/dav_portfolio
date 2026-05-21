import { apiClient } from "@/services/api/client";
import type { BackendNewsletterSubscriber } from "@/types/backend.types";

export const newsletterApi = {
  subscribe: (email: string) =>
    apiClient.post<BackendNewsletterSubscriber>("/newsletter/subscribe", { email }),
  unsubscribe: (email: string) =>
    apiClient.post<null>("/newsletter/unsubscribe", { email }),
};

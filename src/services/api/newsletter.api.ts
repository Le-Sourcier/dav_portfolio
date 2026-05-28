import { apiClient } from "@/services/api/client";
import type { BackendNewsletterSubscriber } from "@/types/backend.types";

export const newsletterApi = {
  subscribe: (email: string, locale: "fr" | "en" = "fr") =>
    apiClient.post<BackendNewsletterSubscriber>("/newsletter/subscribe", { email, locale }),
  unsubscribe: (email: string) =>
    apiClient.post<null>("/newsletter/unsubscribe", { email }),
};

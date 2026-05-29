import { apiClient } from "./client";
import type { TranslationRequest, TranslationResponse } from "@/types/admin.types";

export const translationApi = {
  async translate(data: TranslationRequest): Promise<TranslationResponse> {
    return apiClient.post<TranslationResponse>("/admin/translate", data);
  },
};

export default translationApi;

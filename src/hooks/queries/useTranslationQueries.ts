import { useMutation } from "@tanstack/react-query";
import { translationApi } from "@/services/api/translation.api";
import type { TranslationRequest } from "@/types/admin.types";

export function useTranslateFields() {
  return useMutation({
    mutationFn: (data: TranslationRequest) => translationApi.translate(data),
  });
}

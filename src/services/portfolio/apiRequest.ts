import { envConfig } from "@/config/env";
import type { BackendApiResponse } from "@/types/backend.types";

type RequestApiOptions = {
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
};

const DEFAULT_PUBLIC_REVALIDATE = 60;

export async function requestApi<T>(
  path: string,
  options: RequestApiOptions = {},
): Promise<T> {
  const url = `${envConfig.apiUrl}${path}`;
  const cache = options.cache;
  const revalidate = options.revalidate ?? DEFAULT_PUBLIC_REVALIDATE;
  const response = await fetch(url, {
    ...(cache ? { cache } : { next: { revalidate, tags: options.tags } }),
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as BackendApiResponse<T> | T;

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || `GET ${url} failed`);
    }

    return payload.data as T;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPagination;
}

export interface ApiError {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: ApiMeta;
}

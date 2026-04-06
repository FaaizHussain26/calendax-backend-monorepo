export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

export interface MessageResponse<T> {
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

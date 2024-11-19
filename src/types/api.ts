// Base API Response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Base Error Response
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

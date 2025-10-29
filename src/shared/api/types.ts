/**
 * Общие типы для API
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

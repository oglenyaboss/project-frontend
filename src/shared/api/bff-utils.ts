/**
 * Утилиты для BFF routes
 * Общие константы и хелперы для работы с cookies и бэкендом
 */

// Cookie names
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Cookie options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Backend API URL
export const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://93.189.230.54:8080";

/**
 * Создает headers для запроса к бэкенду с Authorization
 */
export function createAuthHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Типы ответов от бэкенда
 */
export interface BackendErrorResponse {
  message: string;
  detail?: string;
}

export interface BackendValidationError {
  message: string;
  detail: Array<{
    type: string;
    loc: (string | number)[];
    msg: string;
    ctx?: Record<string, unknown>;
  }>;
}

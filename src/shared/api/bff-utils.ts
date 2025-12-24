/**
 * Утилиты для BFF routes
 * Общие константы и хелперы для работы с cookies и бэкендом
 */

// Re-export logger utilities
export {
  logRequest,
  logResponse,
  logError,
  type BffLogOptions,
} from "@/shared/lib/bff-logger";

// Local import for internal use
import { logRequest, logResponse } from "@/shared/lib/bff-logger";

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

import { env } from "@/shared/config/env";

// ...

// Backend API URL
export const BACKEND_URL = env.BACKEND_API_URL || env.NEXT_PUBLIC_API_URL;

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

/**
 * Logged fetch wrapper для BFF routes
 * Автоматически логирует request и response
 */
export async function loggedFetch(
  url: string,
  options: RequestInit & { route: string },
  requestBody?: unknown,
): Promise<{ response: Response; data: unknown; responseText: string }> {
  const { route, ...fetchOptions } = options;
  const method = fetchOptions.method || "GET";
  const startTime = Date.now();

  // Log request
  logRequest(method, url, { route, logBody: true }, requestBody);

  const response = await fetch(url, fetchOptions);
  const durationMs = Date.now() - startTime;

  // Clone to read body without consuming
  const responseText = await response.clone().text();
  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = responseText;
  }

  // Log response
  logResponse(
    method,
    url,
    response.status,
    durationMs,
    { route, logResponse: true },
    responseText,
  );

  return { response, data, responseText };
}

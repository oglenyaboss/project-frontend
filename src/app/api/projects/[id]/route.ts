import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
  createAuthHeaders,
  loggedFetch,
  logError,
  logRequest,
  logResponse,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "projects/[id]";

/**
 * Попытка обновить access token
 */
async function tryRefreshToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Создает headers для запроса с Bearer token (без Content-Type для FormData)
 */
function createBearerHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * Логирует FormData содержимое
 */
function logFormData(formData: FormData): Record<string, string> {
  const formDataLog: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (value instanceof File) {
      formDataLog[key] = `[File: ${value.name}, ${value.size} bytes]`;
    } else {
      formDataLog[key] = String(value);
    }
  });
  return formDataLog;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * BFF API Route для конкретного проекта
 * GET /api/projects/:id
 * PATCH /api/projects/:id (добавление файлов - multipart/form-data)
 * DELETE /api/projects/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "Не авторизован", detail: "No tokens found" },
        { status: 401 }
      );
    }

    const url = `${BACKEND_URL}/projects/${id}`;

    let { response, data } = await loggedFetch(url, {
      route: ROUTE_NAME,
      headers: createAuthHeaders(accessToken),
    });

    if (response.status === 401 && refreshToken) {
      const tokens = await tryRefreshToken(refreshToken);
      if (tokens) {
        cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 15,
        });
        cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 7,
        });
        const retryResult = await loggedFetch(url, {
          route: ROUTE_NAME,
          headers: createAuthHeaders(tokens.access_token),
        });
        response = retryResult.response;
        data = retryResult.data;
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при получении проекта",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - добавление файлов к проекту (multipart/form-data)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "Не авторизован", detail: "No tokens found" },
        { status: 401 }
      );
    }

    // Обрабатываем FormData для загрузки файлов
    const formData = await request.formData();
    const url = `${BACKEND_URL}/projects/${id}`;
    const formDataLog = logFormData(formData);

    // Manual logging for FormData (can't use loggedFetch easily)
    const startTime = Date.now();
    logRequest("PATCH", url, { route: ROUTE_NAME }, formDataLog);

    let response = await fetch(url, {
      method: "PATCH",
      headers: createBearerHeaders(accessToken),
      body: formData,
    });

    if (response.status === 401 && refreshToken) {
      const tokens = await tryRefreshToken(refreshToken);
      if (tokens) {
        cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 15,
        });
        cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 7,
        });
        response = await fetch(url, {
          method: "PATCH",
          headers: createBearerHeaders(tokens.access_token),
          body: formData,
        });
      }
    }

    const responseText = await response.clone().text();
    const durationMs = Date.now() - startTime;
    logResponse("PATCH", url, response.status, durationMs, { route: ROUTE_NAME }, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при добавлении файлов",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "Не авторизован", detail: "No tokens found" },
        { status: 401 }
      );
    }

    const url = `${BACKEND_URL}/projects/${id}`;

    let { response, data, responseText } = await loggedFetch(url, {
      route: ROUTE_NAME,
      method: "DELETE",
      headers: createAuthHeaders(accessToken),
    });

    if (response.status === 401 && refreshToken) {
      const tokens = await tryRefreshToken(refreshToken);
      if (tokens) {
        cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 15,
        });
        cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 7,
        });
        const retryResult = await loggedFetch(url, {
          route: ROUTE_NAME,
          method: "DELETE",
          headers: createAuthHeaders(tokens.access_token),
        });
        response = retryResult.response;
        data = retryResult.data;
        responseText = retryResult.responseText;
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при удалении проекта",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

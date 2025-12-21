import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
  loggedFetch,
  logError,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "projects";

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
 * Создает headers для запроса с Bearer token
 */
function createBearerHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * BFF API Route для проектов
 * GET /api/projects - список проектов
 * POST /api/projects - создание проекта (multipart/form-data)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "Не авторизован", detail: "No tokens found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = `${BACKEND_URL}/projects?${searchParams.toString()}`;

    let { response, data } = await loggedFetch(
      url,
      {
        route: ROUTE_NAME,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      }
    );

    // Refresh если нужно
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
        const retryResult = await loggedFetch(
          url,
          {
            route: ROUTE_NAME,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );
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
        message: "Ошибка при получении проектов",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "Не авторизован", detail: "No tokens found" },
        { status: 401 }
      );
    }

    // Обрабатываем FormData
    const formData = await request.formData();
    const url = `${BACKEND_URL}/projects`;

    // Log FormData contents manually since we can't pass it to loggedFetch easily
    const formDataLog: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataLog[key] = `[File: ${value.name}, ${value.size} bytes]`;
      } else {
        formDataLog[key] = String(value);
      }
    });

    let { response, data } = await loggedFetch(
      url,
      {
        route: ROUTE_NAME,
        method: "POST",
        headers: createBearerHeaders(accessToken),
        body: formData,
      },
      formDataLog
    );

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
        const retryResult = await loggedFetch(
          url,
          {
            route: ROUTE_NAME,
            method: "POST",
            headers: createBearerHeaders(tokens.access_token),
            body: formData,
          },
          formDataLog
        );
        response = retryResult.response;
        data = retryResult.data;
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при создании проекта",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

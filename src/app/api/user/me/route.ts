import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
  createAuthHeaders,
} from "@/shared/api/bff-utils";

/**
 * Попытка обновить access token используя refresh token
 */
async function tryRefreshToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * BFF API Route для текущего пользователя
 * GET /api/user/me - получение данных
 * PATCH /api/user/me - обновление данных
 */
export async function GET() {
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

    // Пробуем получить пользователя
    let response = await fetch(`${BACKEND_URL}/user/me`, {
      headers: createAuthHeaders(accessToken),
    });

    // Если 401 и есть refresh token — пробуем обновить
    if (response.status === 401 && refreshToken) {
      const tokens = await tryRefreshToken(refreshToken);

      if (tokens) {
        // Обновляем cookies
        cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 15,
        });

        cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 7,
        });

        // Повторяем запрос с новым токеном
        response = await fetch(`${BACKEND_URL}/user/me`, {
          headers: createAuthHeaders(tokens.access_token),
        });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        cookieStore.delete(ACCESS_TOKEN_COOKIE);
        cookieStore.delete(REFRESH_TOKEN_COOKIE);
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при получении данных пользователя",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Запрос к бэкенду
    let response = await fetch(`${BACKEND_URL}/user/me`, {
      method: "PATCH",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
    });

    // Если 401 и есть refresh token — пробуем обновить
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

        response = await fetch(`${BACKEND_URL}/user/me`, {
          method: "PATCH",
          headers: createAuthHeaders(tokens.access_token),
          body: JSON.stringify(body),
        });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при обновлении данных пользователя",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

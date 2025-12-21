import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
  loggedFetch,
  logError,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "auth/refresh";

/**
 * BFF API Route для обновления токенов
 * POST /api/auth/refresh
 *
 * Использует refresh_token из cookie для получения новой пары токенов
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token не найден", detail: "No refresh token" },
        { status: 401 }
      );
    }

    const url = `${BACKEND_URL}/auth/refresh`;

    const { response, data } = await loggedFetch(
      url,
      {
        route: ROUTE_NAME,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      { refresh_token: "[REDACTED]" }
    );

    // Если ошибка — удаляем cookies и возвращаем ошибку
    if (!response.ok) {
      cookieStore.delete(ACCESS_TOKEN_COOKIE);
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
      return NextResponse.json(data, { status: response.status });
    }

    const tokenData = data as { access_token: string; refresh_token: string };

    // Обновляем cookies с новыми токенами
    cookieStore.set(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 15,
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при обновлении токена",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

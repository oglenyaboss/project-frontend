import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  BACKEND_URL,
  createAuthHeaders,
  loggedFetch,
  logError,
} from "@/shared/api/bff-utils";

const ROUTE_NAME = "auth/logout";

/**
 * BFF API Route для выхода
 * POST /api/auth/logout
 *
 * Инвалидирует токен на бэкенде и удаляет cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    // Если есть токен — отправляем logout на бэкенд
    if (accessToken) {
      try {
        await loggedFetch(`${BACKEND_URL}/auth/logout`, {
          route: ROUTE_NAME,
          method: "POST",
          headers: createAuthHeaders(accessToken),
        });
      } catch (error) {
        // Игнорируем ошибки бэкенда при logout
        logError(ROUTE_NAME, error);
      }
    }

    // Удаляем cookies в любом случае
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Ошибка при выходе",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

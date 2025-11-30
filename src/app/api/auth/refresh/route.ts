import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
} from "@/shared/api/bff-utils";

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

    // Запрос к бэкенду
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    // Если ошибка — удаляем cookies и возвращаем ошибку
    if (!response.ok) {
      cookieStore.delete(ACCESS_TOKEN_COOKIE);
      cookieStore.delete(REFRESH_TOKEN_COOKIE);
      return NextResponse.json(data, { status: response.status });
    }

    // Обновляем cookies с новыми токенами
    cookieStore.set(ACCESS_TOKEN_COOKIE, data.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 15,
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при обновлении токена",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

const ROUTE_NAME = "auth/register";

/**
 * BFF API Route для регистрации
 * POST /api/auth/register
 *
 * Проксирует запрос на бэкенд и сохраняет токены в httpOnly cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${BACKEND_URL}/auth/register`;

    // Don't log password in request
    const safeBody = { ...body, password: "[REDACTED]" };

    const { response, data } = await loggedFetch(
      url,
      {
        route: ROUTE_NAME,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      safeBody
    );

    // Если ошибка от бэкенда — прокидываем её
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Успешная регистрация — сохраняем токены в cookies
    const cookieStore = await cookies();
    const tokenData = data as { access_token: string; refresh_token: string };

    cookieStore.set(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 15, // 15 минут для access token
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 дней для refresh token
    });

    // Возвращаем успех без токенов (они в cookies)
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logError(ROUTE_NAME, error);
    return NextResponse.json(
      {
        message: "Внутренняя ошибка сервера",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

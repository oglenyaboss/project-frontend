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

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

/**
 * BFF API Route для интервью проекта
 * GET /api/interviews/projects/:projectId - список интервью
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
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

    let response = await fetch(
      `${BACKEND_URL}/interviews/projects/${projectId}?${searchParams.toString()}`,
      { headers: createAuthHeaders(accessToken) }
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
        response = await fetch(
          `${BACKEND_URL}/interviews/projects/${projectId}?${searchParams.toString()}`,
          { headers: createAuthHeaders(tokens.access_token) }
        );
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при получении интервью",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

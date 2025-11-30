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
  params: Promise<{ id: string }>;
}

/**
 * BFF API Route для конкретного интервью
 * GET /api/interviews/:id
 * PATCH /api/interviews/:id
 * DELETE /api/interviews/:id
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

    let response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
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
        response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
          headers: createAuthHeaders(tokens.access_token),
        });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при получении интервью",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();

    let response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(accessToken),
      body: JSON.stringify(body),
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
        response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
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
    console.error("Update interview error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при обновлении интервью",
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

    let response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
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
        response = await fetch(`${BACKEND_URL}/interviews/${id}`, {
          method: "DELETE",
          headers: createAuthHeaders(tokens.access_token),
        });
      }
    }

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при удалении интервью",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

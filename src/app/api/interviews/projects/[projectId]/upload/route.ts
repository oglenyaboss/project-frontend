import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  BACKEND_URL,
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
 * Клонирует FormData для повторного использования
 * FormData нельзя переиспользовать после отправки, поэтому создаём копию
 */
async function cloneFormData(
  formData: FormData
): Promise<{ original: FormData; clone: FormData }> {
  const original = new FormData();
  const clone = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Для файлов нужно прочитать содержимое и создать новые File объекты
      const arrayBuffer = await value.arrayBuffer();
      const blob1 = new Blob([arrayBuffer], { type: value.type });
      const blob2 = new Blob([arrayBuffer], { type: value.type });
      original.append(key, new File([blob1], value.name, { type: value.type }));
      clone.append(key, new File([blob2], value.name, { type: value.type }));
    } else {
      original.append(key, value);
      clone.append(key, value);
    }
  }

  return { original, clone };
}

/**
 * BFF API Route для загрузки интервью
 * POST /api/interviews/projects/:projectId/upload
 *
 * Принимает multipart/form-data с файлом или текстом
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Получаем FormData и клонируем для возможного retry
    const rawFormData = await request.formData();
    const { original: formData, clone: formDataClone } = await cloneFormData(
      rawFormData
    );

    // Создаём headers без Content-Type (браузер сам добавит с boundary)
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let response = await fetch(
      `${BACKEND_URL}/interviews/projects/${projectId}/upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
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

        headers["Authorization"] = `Bearer ${tokens.access_token}`;
        response = await fetch(
          `${BACKEND_URL}/interviews/projects/${projectId}/upload`,
          {
            method: "POST",
            headers,
            body: formDataClone, // Используем клон для retry
          }
        );
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload interview error:", error);
    return NextResponse.json(
      {
        message: "Ошибка при загрузке интервью",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * BFF API Route для выхода
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // 🎭 MOCK: Просто удаляем cookie, без запроса к бэкенду
    const token = request.cookies.get("auth_token")?.value;

    if (token) {
      // TODO: Добавить запрос к реальному бэкенду для инвалидации токена
      // Пока просто логируем
      console.log("Mock logout for token:", token);
    }

    // Удаляем cookie
    const response = NextResponse.json({ data: { success: true } });
    response.cookies.delete("auth_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error: {
          message: "Ошибка при выходе",
        },
      },
      { status: 500 }
    );
  }
}

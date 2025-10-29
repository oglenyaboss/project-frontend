import { NextRequest, NextResponse } from "next/server";

/**
 * BFF API Route для получения текущего пользователя
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: { message: "Не авторизован" } },
        { status: 401 }
      );
    }

    // 🎭 MOCK: Извлекаем данные пользователя из токена
    // TODO: Заменить на реальный запрос к бэкенду
    
    // Симулируем задержку сети
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Парсим моковый токен (формат: mock_token_{timestamp}_{userId})
    const userId = token.split("_").pop();

    // Моковые данные пользователей
    const mockUsers: Record<string, { id: string; email: string; name: string }> = {
      "1": { id: "1", email: "test@test.com", name: "Test User" },
      "2": { id: "2", email: "admin@admin.com", name: "Admin User" },
    };

    const user = userId ? mockUsers[userId] : null;

    if (!user) {
      // Если токен невалиден - удаляем cookie
      const errorResponse = NextResponse.json(
        { error: { message: "Сессия истекла" } },
        { status: 401 }
      );
      errorResponse.cookies.delete("auth_token");
      return errorResponse;
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error: {
          message: "Ошибка при получении данных пользователя",
        },
      },
      { status: 500 }
    );
  }
}

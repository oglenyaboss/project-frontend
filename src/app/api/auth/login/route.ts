import { NextRequest, NextResponse } from "next/server";
import type { LoginRequest, LoginResponse } from "@/shared/api/types";

/**
 * BFF API Route для авторизации
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;

    // Валидация
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: { message: "Email и пароль обязательны" } },
        { status: 400 }
      );
    }

    // 🎭 MOCK: Временная заглушка вместо реального бэкенда
    // TODO: Заменить на реальный запрос к бэкенду

    // Симулируем задержку сети
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Моковые пользователи для тестирования
    const mockUsers = [
      {
        email: "test@test.com",
        password: "123456",
        user: { id: "1", email: "test@test.com", name: "Test User" },
      },
      {
        email: "admin@admin.com",
        password: "admin123",
        user: { id: "2", email: "admin@admin.com", name: "Admin User" },
      },
    ];

    const user = mockUsers.find(
      (u) => u.email === body.email && u.password === body.password
    );

    if (!user) {
      return NextResponse.json(
        { error: { message: "Неверный email или пароль" } },
        { status: 401 }
      );
    }

    // Генерируем моковый токен
    const data: LoginResponse = {
      token: `mock_token_${Date.now()}_${user.user.id}`,
      user: user.user,
    };

    // Можно установить httpOnly cookie с токеном
    const responseWithCookie = NextResponse.json({ data });

    if (data.token) {
      responseWithCookie.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: "/",
      });
    }

    return responseWithCookie;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Внутренняя ошибка сервера",
        },
      },
      { status: 500 }
    );
  }
}

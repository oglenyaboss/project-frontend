/**
 * API функции для авторизации
 */

import { api } from "@/shared/api";
import type { LoginRequest, RegisterRequest } from "@/shared/lib/schemas";

/**
 * Логин пользователя
 */
export async function login(data: LoginRequest): Promise<{ success: boolean }> {
  return api.post("/auth/login", data);
}

/**
 * Регистрация пользователя
 */
export async function register(
  data: RegisterRequest
): Promise<{ success: boolean }> {
  return api.post("/auth/register", data);
}

/**
 * Выход из системы
 */
export async function logout(): Promise<{ success: boolean }> {
  return api.post("/auth/logout");
}

/**
 * Обновление токенов (внутренний, вызывается автоматически)
 */
export async function refreshToken(): Promise<{ success: boolean }> {
  return api.post("/auth/refresh");
}

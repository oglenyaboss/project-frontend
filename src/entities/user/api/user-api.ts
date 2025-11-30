/**
 * API функции для User
 */

import { api } from "@/shared/api";
import type { User, UserUpdateRequest } from "@/shared/lib/schemas";

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User> {
  return api.get("/user/me");
}

/**
 * Обновить данные текущего пользователя
 */
export async function updateCurrentUser(
  data: UserUpdateRequest
): Promise<User> {
  return api.patch("/user/me", data);
}

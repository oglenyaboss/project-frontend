/**
 * TanStack Query мутации для авторизации
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryKeys } from "@/shared/api";
import type { LoginRequest, RegisterRequest } from "@/shared/lib/schemas";

import { login, logout, register } from "../api/auth-api";

/**
 * Хук для логина
 *
 * @example
 * const { mutate: loginUser, isPending } = useLogin();
 * loginUser({ email: 'test@test.com', password: '123456' });
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      // Инвалидируем кеш пользователя
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
      // Редирект на дашборд
      router.push("/dashboard");
    },
  });
}

/**
 * Хук для регистрации
 *
 * @example
 * const { mutate: registerUser, isPending } = useRegister();
 * registerUser({ email: 'new@test.com', password: '12345678', display_name: 'New User' });
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      // Инвалидируем кеш пользователя
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
      // Редирект на дашборд
      router.push("/dashboard");
    },
  });
}

/**
 * Хук для выхода
 *
 * @example
 * const { mutate: logoutUser, isPending } = useLogout();
 * logoutUser();
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Очищаем весь кеш
      queryClient.clear();
      // Редирект на логин
      router.push("/login");
    },
  });
}

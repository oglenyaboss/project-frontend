/**
 * TanStack Query хуки для User
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import type { UserUpdateRequest } from "@/shared/lib/schemas";

import { getCurrentUser, updateCurrentUser } from "../api/user-api";

/**
 * Получить текущего пользователя
 *
 * @example
 * const { data: user, isLoading, error } = useCurrentUser();
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: false, // Не повторять при 401
  });
}

/**
 * Обновить данные текущего пользователя
 *
 * @example
 * const { mutate: updateUser, isPending } = useUpdateUser();
 * updateUser({ display_name: 'New Name' });
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => updateCurrentUser(data),
    onSuccess: (updatedUser) => {
      // Обновляем кеш с новыми данными
      queryClient.setQueryData(queryKeys.user.current(), updatedUser);
    },
  });
}

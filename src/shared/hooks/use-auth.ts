import { useAuthStore } from "@/shared/store";

/**
 * @deprecated Используйте useAuthStore напрямую
 *
 * Хук-обертка для обратной совместимости.
 * Рекомендуется использовать useAuthStore из @/shared/store
 *
 * @example
 * // Старый способ (deprecated)
 * const { login, logout, isLoading } = useAuth();
 *
 * // Новый способ (рекомендуется)
 * import { useAuthStore } from "@/shared/store";
 * const { login, logout, isLoading, user, error } = useAuthStore();
 */
export function useAuth() {
  return useAuthStore();
}

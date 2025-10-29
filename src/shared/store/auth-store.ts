import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Zustand store для управления состоянием авторизации
 *
 * Использует middleware persist для сохранения состояния в localStorage
 * (только isAuthenticated, user сохраняется для UX)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error?.message || "Ошибка авторизации");
          }

          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Ошибка сети";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Logout error:", error);
          // Все равно очищаем состояние
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        // Проверяем, есть ли уже данные пользователя
        if (get().user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/me");
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error?.message || "Не авторизован");
          }

          set({
            user: result.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Не показываем ошибку, если не авторизован
          });
        }
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только isAuthenticated и user для UX
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

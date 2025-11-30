/**
 * TanStack Query Client конфигурация
 */

import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./axios-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Данные считаются свежими 1 минуту
        staleTime: 1000 * 60,
        // Данные хранятся в кеше 10 минут после размонтирования
        gcTime: 1000 * 60 * 10,
        // Количество повторных попыток при ошибке
        retry: (failureCount, error) => {
          // Не повторяем при 4xx ошибках (кроме 408, 429)
          if (error instanceof ApiError) {
            if (error.status >= 400 && error.status < 500) {
              if (error.status !== 408 && error.status !== 429) {
                return false;
              }
            }
          }
          return failureCount < 2;
        },
        // Обновление при возврате на вкладку
        refetchOnWindowFocus: true,
        // Обновление при восстановлении соединения
        refetchOnReconnect: true,
      },
      mutations: {
        // Мутации не повторяем автоматически
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

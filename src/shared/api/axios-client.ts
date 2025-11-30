/**
 * Axios client с interceptors для работы с BFF
 *
 * Все запросы идут через BFF (Next.js API Routes),
 * который управляет токенами в httpOnly cookies
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// Типы для API ошибок
export interface ApiErrorResponse {
  message: string;
  detail?: string;
}

export interface ValidationErrorResponse {
  message: string;
  detail: Array<{
    type: string;
    loc: (string | number)[];
    msg: string;
    ctx?: Record<string, unknown>;
  }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse | ValidationErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Создание axios instance для BFF
 */
function createAxiosClient(): AxiosInstance {
  const client = axios.create({
    baseURL: "/api", // Все запросы идут через BFF
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Для отправки cookies
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Можно добавить логирование или дополнительные headers
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError<ApiErrorResponse | ValidationErrorResponse>) => {
      const originalRequest = error.config;

      // Обработка 401 - попытка refresh токена
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest.url?.includes("/auth/refresh") &&
        !originalRequest.url?.includes("/auth/login")
      ) {
        try {
          // Пробуем обновить токен
          await client.post("/auth/refresh");
          // Повторяем оригинальный запрос
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh не удался — пользователь должен залогиниться
          // Событие для перехвата в UI
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return Promise.reject(refreshError);
        }
      }

      // Преобразуем ошибку в наш формат
      const status = error.response?.status || 500;
      const data = error.response?.data;
      const message = data?.message || error.message || "Произошла ошибка";

      throw new ApiError(message, status, data);
    }
  );

  return client;
}

export const axiosClient = createAxiosClient();

// Типизированные методы для удобства
export const api = {
  get: <T>(url: string, config?: Parameters<typeof axiosClient.get>[1]) =>
    axiosClient.get<T>(url, config).then((res) => res.data),

  post: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.post>[2]
  ) => axiosClient.post<T>(url, data, config).then((res) => res.data),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.patch>[2]
  ) => axiosClient.patch<T>(url, data, config).then((res) => res.data),

  put: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof axiosClient.put>[2]
  ) => axiosClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: Parameters<typeof axiosClient.delete>[1]) =>
    axiosClient.delete<T>(url, config).then((res) => res.data),
};

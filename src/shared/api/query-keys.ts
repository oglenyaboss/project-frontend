/**
 * Централизованные Query Keys для TanStack Query
 *
 * Используем factory pattern для типобезопасных ключей
 */

// Параметры пагинации
export interface PaginationParams {
  search?: string;
  offset?: number;
  limit?: number;
}

export const queryKeys = {
  // ==================== User ====================
  user: {
    all: () => ["user"] as const,
    current: () => ["user", "current"] as const,
  },

  // ==================== Projects ====================
  projects: {
    all: () => ["projects"] as const,
    list: (params?: PaginationParams) =>
      params
        ? (["projects", "list", params] as const)
        : (["projects", "list"] as const),
    detail: (id: number) => ["projects", "detail", id] as const,
  },

  // ==================== Interviews ====================
  interviews: {
    all: () => ["interviews"] as const,
    byProject: (projectId: number) =>
      ["interviews", "project", projectId] as const,
    list: (projectId: number, params?: PaginationParams) =>
      params
        ? (["interviews", "project", projectId, "list", params] as const)
        : (["interviews", "project", projectId, "list"] as const),
    detail: (id: number) => ["interviews", "detail", id] as const,
  },
} as const;

// Type helpers для получения типа ключа
export type QueryKeys = typeof queryKeys;

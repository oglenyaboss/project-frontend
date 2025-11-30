/**
 * API функции для Interview
 */

import { api, type PaginationParams } from "@/shared/api";
import type {
  Interview,
  InterviewsList,
  InterviewUpdateRequest,
} from "@/shared/lib/schemas";

/**
 * Получить список интервью проекта
 */
export async function getInterviews(
  projectId: number,
  params?: PaginationParams
): Promise<InterviewsList> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return api.get(
    `/interviews/projects/${projectId}${query ? `?${query}` : ""}`
  );
}

/**
 * Получить интервью по ID
 */
export async function getInterview(id: number): Promise<Interview> {
  return api.get(`/interviews/${id}`);
}

/**
 * Загрузить интервью (файл или текст)
 */
export async function uploadInterview(
  projectId: number,
  data: { file?: File; content?: string }
): Promise<Interview> {
  const formData = new FormData();

  if (data.file) {
    formData.append("file", data.file);
  }

  if (data.content) {
    formData.append("content", data.content);
  }

  // Используем fetch напрямую для FormData
  const response = await fetch(`/api/interviews/projects/${projectId}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Ошибка при загрузке интервью");
  }

  return response.json();
}

/**
 * Обновить интервью
 */
export async function updateInterview(
  id: number,
  data: InterviewUpdateRequest
): Promise<Interview> {
  return api.patch(`/interviews/${id}`, data);
}

/**
 * Удалить интервью
 */
export async function deleteInterview(id: number): Promise<void> {
  return api.delete(`/interviews/${id}`);
}

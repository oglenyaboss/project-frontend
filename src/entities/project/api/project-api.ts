/**
 * API функции для Project
 */

import { api, type PaginationParams } from "@/shared/api";
import type {
  Project,
  ProjectsList,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/shared/lib/schemas";

/**
 * Получить список проектов
 */
export async function getProjects(
  params?: PaginationParams
): Promise<ProjectsList> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  if (params?.limit !== undefined)
    searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return api.get(`/projects${query ? `?${query}` : ""}`);
}

/**
 * Получить проект по ID
 */
export async function getProject(id: number): Promise<Project> {
  return api.get(`/projects/${id}`);
}

/**
 * Создать проект
 */
export async function createProject(
  data: ProjectCreateRequest
): Promise<Project> {
  return api.post("/projects", data);
}

/**
 * Обновить проект
 */
export async function updateProject(
  id: number,
  data: ProjectUpdateRequest
): Promise<Project> {
  return api.patch(`/projects/${id}`, data);
}

/**
 * Удалить проект
 */
export async function deleteProject(id: number): Promise<void> {
  return api.delete(`/projects/${id}`);
}

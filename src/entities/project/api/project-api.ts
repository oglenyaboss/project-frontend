/**
 * API функции для Project
 */

import { api } from "@/shared/api";
import { axiosClient } from "@/shared/api/axios-client";
import type { PaginationParams } from "@/shared/api";
import type {
  Project,
  ProjectsList,
  ProjectCreateRequest,
} from "@/shared/lib/schemas";

/**
 * Получить список проектов
 */
export async function getProjects(
  params?: PaginationParams,
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
 * Создать проект (multipart/form-data)
 */
export async function createProject(
  data: Omit<ProjectCreateRequest, "files"> & { files?: File[] },
): Promise<Project> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);

  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await axiosClient.post<Project>("/projects", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Добавить файлы к проекту (multipart/form-data)
 */
export async function addFilesToProject(
  id: number,
  files: File[],
): Promise<Project> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await axiosClient.patch<Project>(
    `/projects/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

/**
 * Удалить проект
 */
export async function deleteProject(id: number): Promise<void> {
  return api.delete(`/projects/${id}`);
}

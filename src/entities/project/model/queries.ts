/**
 * TanStack Query хуки для Project
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys, type PaginationParams } from "@/shared/api";
import type { Project, ProjectCreateRequest } from "@/shared/lib/schemas";

import {
  getProjects,
  getProject,
  createProject,
  addFilesToProject,
  deleteProject,
} from "../api/project-api";

/**
 * Получить список проектов
 *
 * @example
 * const { data, isLoading } = useProjects({ search: 'test', limit: 10 });
 */
export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => getProjects(params),
    staleTime: 1000 * 60, // 1 минута
  });
}

/**
 * Получить проект по ID
 *
 * @example
 * const { data: project, isLoading } = useProject(1);
 */
export function useProject(id: number) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProject(id),
    staleTime: 1000 * 60 * 2, // 2 минуты
    enabled: !!id,
  });
}

/**
 * Создать проект
 *
 * @example
 * const { mutate: create, isPending } = useCreateProject();
 * create({ title: 'New Project', description: 'Description', files: [file1, file2] });
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<ProjectCreateRequest, "files"> & { files?: File[] }
    ) => createProject(data),
    onSuccess: () => {
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      toast.success("Проект создан");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка создания проекта");
    },
  });
}

/**
 * Добавить файлы к проекту
 *
 * @example
 * const { mutate: addFiles, isPending } = useAddFilesToProject();
 * addFiles({ id: 1, files: [file1, file2] });
 */
export function useAddFilesToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      addFilesToProject(id, files),

    onSuccess: (_, { id }) => {
      // Инвалидируем проект и список
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      toast.success("Файлы добавлены");
    },

    onError: (error) => {
      toast.error(error.message || "Ошибка добавления файлов");
    },
  });
}

/**
 * Удалить проект (с optimistic update)
 *
 * @example
 * const { mutate: remove, isPending } = useDeleteProject();
 * remove(1);
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProject(id),

    // Optimistic update — удаляем из списка сразу
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all() });

      // Можно сохранить предыдущие данные для отката
      const previousProjects = queryClient.getQueriesData({
        queryKey: queryKeys.projects.all(),
      });

      return { previousProjects };
    },

    onSuccess: () => {
      toast.success("Проект удалён");
    },

    onError: (error) => {
      toast.error(error.message || "Ошибка удаления проекта");
    },

    onSettled: () => {
      // Инвалидируем все проекты
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

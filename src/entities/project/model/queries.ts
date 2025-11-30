/**
 * TanStack Query хуки для Project
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys, type PaginationParams } from "@/shared/api";
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/shared/lib/schemas";

import {
  getProjects,
  getProject,
  createProject,
  updateProject,
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
 * create({ name: 'New Project', description: 'Description' });
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => createProject(data),
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
 * Обновить проект (с optimistic update)
 *
 * @example
 * const { mutate: update, isPending } = useUpdateProject();
 * update({ id: 1, data: { name: 'Updated Name' } });
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdateRequest }) =>
      updateProject(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.detail(id),
      });

      // Сохраняем предыдущее значение
      const previousProject = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(id)
      );

      // Оптимистично обновляем кеш
      if (previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), {
          ...previousProject,
          ...data,
        });
      }

      return { previousProject };
    },

    // При ошибке откатываем
    onError: (err, { id }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          queryKeys.projects.detail(id),
          context.previousProject
        );
      }
      toast.error(err.message || "Ошибка обновления проекта");
    },

    onSuccess: () => {
      toast.success("Проект обновлён");
    },

    // После успеха/ошибки инвалидируем
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
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

/**
 * TanStack Query хуки для Interview
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys, type PaginationParams } from "@/shared/api";
import type { InterviewUpdateRequest } from "@/shared/lib/schemas";

import {
  getInterviews,
  getInterview,
  uploadInterview,
  updateInterview,
  deleteInterview,
} from "../api/interview-api";

/**
 * Получить список интервью проекта
 *
 * @example
 * const { data, isLoading } = useInterviews(projectId, { limit: 10 });
 */
export function useInterviews(projectId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.interviews.list(projectId, params),
    queryFn: () => getInterviews(projectId, params),
    staleTime: 1000 * 30, // 30 секунд
    enabled: !!projectId,
  });
}

/**
 * Получить интервью по ID
 *
 * @example
 * const { data: interview, isLoading } = useInterview(1);
 */
export function useInterview(id: number) {
  return useQuery({
    queryKey: queryKeys.interviews.detail(id),
    queryFn: () => getInterview(id),
    staleTime: 1000 * 60, // 1 минута
    enabled: !!id,
  });
}

/**
 * Загрузить интервью
 *
 * @example
 * const { mutate: upload, isPending } = useUploadInterview();
 * upload({ projectId: 1, data: { file: myFile } });
 */
export function useUploadInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: { file?: File; content?: string };
    }) => uploadInterview(projectId, data),

    onSuccess: (newInterview) => {
      // Инвалидируем список интервью проекта
      queryClient.invalidateQueries({
        queryKey: queryKeys.interviews.byProject(newInterview.project.id),
      });
      toast.success("Интервью загружено");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка загрузки интервью");
    },
  });
}

/**
 * Обновить интервью
 *
 * @example
 * const { mutate: update, isPending } = useUpdateInterview();
 * update({ id: 1, data: { name: 'New Name' } });
 */
export function useUpdateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InterviewUpdateRequest }) =>
      updateInterview(id, data),

    onSuccess: (updatedInterview) => {
      // Обновляем кеш интервью
      queryClient.setQueryData(
        queryKeys.interviews.detail(updatedInterview.id),
        updatedInterview
      );

      // Инвалидируем список
      queryClient.invalidateQueries({
        queryKey: queryKeys.interviews.byProject(updatedInterview.project.id),
      });
      toast.success("Интервью обновлено");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка обновления интервью");
    },
  });
}

/**
 * Удалить интервью
 *
 * @example
 * const { mutate: remove, isPending } = useDeleteInterview();
 * remove({ id: 1, projectId: 1 });
 */
export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; projectId: number }) =>
      deleteInterview(id),

    onSuccess: (_, { projectId }) => {
      // Инвалидируем список интервью проекта
      queryClient.invalidateQueries({
        queryKey: queryKeys.interviews.byProject(projectId),
      });
      toast.success("Интервью удалено");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка удаления интервью");
    },
  });
}

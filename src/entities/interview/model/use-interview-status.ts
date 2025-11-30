"use client";

/**
 * WebSocket клиент для отслеживания статуса интервью
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import type { InterviewStatus } from "@/shared/lib/schemas";

// URL WebSocket сервера (настраивается через env)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

interface InterviewStatusEvent {
  type: "interview:status" | "interview:error" | "interview:complete";
  data: {
    id: number;
    status?: InterviewStatus;
    progress?: number;
    error?: string;
    result?: unknown;
  };
}

interface UseInterviewStatusOptions {
  /** Включить WebSocket соединение */
  enabled?: boolean;
  /** Callback при изменении статуса */
  onStatusChange?: (status: InterviewStatus) => void;
  /** Callback при ошибке */
  onError?: (error: string) => void;
  /** Callback при завершении */
  onComplete?: (result: unknown) => void;
}

/**
 * Хук для отслеживания статуса интервью через WebSocket
 *
 * @example
 * const { status, progress, isConnected } = useInterviewStatus(interviewId, {
 *   enabled: interview.status === 'processing',
 *   onStatusChange: (status) => console.log('New status:', status),
 * });
 */
export function useInterviewStatus(
  interviewId: number,
  options: UseInterviewStatusOptions = {}
) {
  const { enabled = true, onStatusChange, onError, onComplete } = options;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<InterviewStatus | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !interviewId) return;

    // Закрываем существующее соединение
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`${WS_URL}/interviews/${interviewId}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log(`[WS] Connected to interview ${interviewId}`);
      };

      ws.onmessage = (event) => {
        try {
          const message: InterviewStatusEvent = JSON.parse(event.data);

          switch (message.type) {
            case "interview:status":
              if (message.data.status) {
                setStatus(message.data.status);
                onStatusChange?.(message.data.status);

                // Инвалидируем кеш интервью
                queryClient.invalidateQueries({
                  queryKey: queryKeys.interviews.detail(interviewId),
                });
              }
              if (message.data.progress !== undefined) {
                setProgress(message.data.progress);
              }
              break;

            case "interview:error":
              if (message.data.error) {
                setError(message.data.error);
                onError?.(message.data.error);
              }
              break;

            case "interview:complete":
              onComplete?.(message.data.result);
              // Инвалидируем кеш
              queryClient.invalidateQueries({
                queryKey: queryKeys.interviews.detail(interviewId),
              });
              break;
          }
        } catch (e) {
          console.error("[WS] Failed to parse message:", e);
        }
      };

      ws.onerror = (event) => {
        console.error("[WS] Error:", event);
        setError("Ошибка подключения");
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log(`[WS] Disconnected from interview ${interviewId}`);

        // Переподключаемся через 5 секунд если enabled
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("[WS] Failed to connect:", e);
      setError("Не удалось подключиться");
    }
  }, [enabled, interviewId, onStatusChange, onError, onComplete, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    /** Текущий статус интервью */
    status,
    /** Прогресс обработки (0-100) */
    progress,
    /** Ошибка, если есть */
    error,
    /** Подключен ли WebSocket */
    isConnected,
    /** Принудительно переподключиться */
    reconnect: connect,
    /** Отключиться */
    disconnect,
  };
}

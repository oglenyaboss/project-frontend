"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui";
import { agentApi } from "@/shared/api";
import { useAgentSession, AgentDialogue } from "@/entities/agent-session";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AgentSessionPage({ params }: Props) {
  const { id } = use(params);
  const sessionId = parseInt(id, 10);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // WebSocket connection with ping mechanism
  const {
    isConnected,
    dialogue,
    sessionStatus,
    currentIteration,
    result,
    error: wsError,
    sendPing,
    reconnect,
  } = useAgentSession(sessionId, {
    enabled: true,
    onStatusChange: (status) => {
      console.log("Status changed:", status);
    },
    onResult: (res) => {
      console.log("Result received:", res);
    },
  });

  const handleAnswer = async (text: string, questionId: number) => {
    setIsSubmitting(true);
    try {
      const { error } = await agentApi.submitAnswer(sessionId, questionId, {
        answer: text,
        is_skipped: false,
      });

      if (error) {
        console.error("Failed to submit answer:", error);
        toast.error("Не удалось отправить ответ", { description: error });
      } else {
        // Send ping to get updated dialogue
        setTimeout(() => sendPing(), 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async (questionId: number) => {
    setIsSubmitting(true);
    try {
      const { error } = await agentApi.submitAnswer(sessionId, questionId, {
        answer: "",
        is_skipped: true,
      });

      if (error) {
        console.error("Failed to skip:", error);
        toast.error("Не удалось пропустить вопрос", { description: error });
      } else {
        // Send ping to get updated dialogue
        setTimeout(() => sendPing(), 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async () => {
    setIsCancelling(true);
    try {
      const { error } = await agentApi.cancelSession(sessionId);
      if (error) {
        toast.error("Не удалось отменить сессию", {
          description: error,
        });
      } else {
        toast.success("Сессия успешно отменена");
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
      toast.error("Произошла ошибка при отмене сессии");
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading state
  if (!isConnected && dialogue.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Подключение к сессии...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (wsError && dialogue.length === 0) {
    return (
      <div className="container py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка подключения</AlertTitle>
          <AlertDescription>
            Не удалось подключиться к сессии. {wsError}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button onClick={reconnect}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Переподключиться
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const isSessionComplete =
    sessionStatus === "done" ||
    sessionStatus === "cancelled" ||
    sessionStatus === "error";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-base">Сессия с агентом</h1>
              <p className="text-xs text-muted-foreground">ID: {sessionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-500/10 text-green-600"
                  : "bg-yellow-500/10 text-yellow-600"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`}
              />
              {isConnected ? "Подключено" : "Соединение..."}
            </div>

            {/* Cancel button (only if session is active) */}
            {!isSessionComplete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Завершить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Завершить сессию?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите завершить текущую сессию с агентом?
                      Процесс будет остановлен, и вы вернетесь в список
                      проектов.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelSession();
                      }}
                      disabled={isCancelling}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {isCancelling ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Завершить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl px-4">
        {/* Progress / Status Header */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Итерация:{" "}
                <span className="font-medium text-foreground">
                  {currentIteration}/5
                </span>
              </span>
              <span className="text-muted-foreground">
                Вопросов:{" "}
                <span className="font-medium text-foreground">
                  {dialogue.length}
                </span>
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                sessionStatus === "done"
                  ? "bg-green-100 text-green-700"
                  : sessionStatus === "waiting_for_answers"
                    ? "bg-blue-100 text-blue-700"
                    : sessionStatus === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : sessionStatus === "error"
                        ? "bg-red-100 text-red-700"
                        : sessionStatus === "cancelled"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-gray-100 text-gray-700"
              }`}
            >
              {sessionStatus === "done" && "Завершено"}
              {sessionStatus === "waiting_for_answers" && "Ожидает ответа"}
              {sessionStatus === "processing" && "Обработка"}
              {sessionStatus === "error" && "Ошибка"}
              {sessionStatus === "cancelled" && "Отменено"}
              {!sessionStatus && "Загрузка..."}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentIteration / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="grid gap-6">
          {/* The Chat */}
          <AgentDialogue
            dialogue={dialogue}
            status={sessionStatus}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
            isSubmitting={isSubmitting}
          />

          {/* Results Area (visible when done) */}
          {sessionStatus === "done" && result && (
            <div className="rounded-xl border bg-card p-6 shadow-premium animate-fade-in">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Готово!</h2>
                  <p className="text-muted-foreground">
                    Требования успешно сформированы
                  </p>
                </div>
              </div>

              {/* Preview of result */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-48 overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {result.content.slice(0, 500)}...
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <a href={`/requirements/${result.requirement_id}`}>
                    Просмотреть и редактировать
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={agentApi.exportRequirementUrl(
                      result.requirement_id,
                      "docx",
                    )}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    DOCX
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={agentApi.exportRequirementUrl(
                      result.requirement_id,
                      "pdf",
                    )}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
          {sessionStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>
                Произошла ошибка при обработке сессии. Попробуйте начать новую
                сессию.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}

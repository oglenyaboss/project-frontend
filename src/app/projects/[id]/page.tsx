"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderOpen,
  Loader2,
  Sparkles,
  FileText,
  Upload,
  BrainCircuit,
  FileOutput,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button, Skeleton } from "@/shared/ui";
import { useProject } from "@/entities/project";
import { addFilesToProject } from "@/entities/project/api/project-api";
import { UserDropdown } from "@/features/user-dropdown";
import { agentApi } from "@/shared/api";
import { cn } from "@/shared/lib";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [activeTab, setActiveTab] = useState<"workspace" | "requirements">("workspace");

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => addFilesToProject(projectId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      alert("Не удалось загрузить файлы");
    },
  });

  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      const { data: session, error } = await agentApi.startProjectSession(
        projectId,
        { user_goal: "Анализ требований проекта и генерация документации" }
      );
      if (session) {
        router.push(`/agent/sessions/${session.id}`);
      } else {
        console.error("Failed to start session:", error);
        alert("Не удалось запустить сессию: " + (error || "Неизвестная ошибка"));
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка запуска сессии");
    }
    setIsStartingSession(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-9 w-9 rounded-lg mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="container py-8 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Проект не найден</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Возможно, проект был удалён или у вас нет к нему доступа
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard">Вернуться к проектам</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasFiles = project.files && project.files.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-lg hover:bg-primary/10"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 rounded-xl gradient-sber flex items-center justify-center shadow-sber">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-base tracking-tight">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-xl bg-muted p-1 mb-8 animate-fade-in sm:w-fit">
          <button
            onClick={() => setActiveTab("workspace")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "workspace"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            Рабочая область
          </button>
          <button
            onClick={() => setActiveTab("requirements")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === "requirements"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <FileOutput className="h-4 w-4" />
            Сгенерированные требования
          </button>
        </div>

        {activeTab === "workspace" ? (
          <div className="animate-slide-up space-y-8">
            {/* Action Area */}
            <div className={cn(
              "rounded-2xl border p-8 shadow-premium transition-colors duration-300 relative overflow-hidden",
              hasFiles
                ? "bg-gradient-to-br from-white to-primary/5"
                : "bg-card"
            )}>
              <div className="relative z-10 flex flex-col items-center text-center">
                {!hasFiles ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Загрузите данные</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                      Добавьте аудиозаписи интервью или текстовые расшифровки, чтобы начать анализ требований
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button
                      size="lg"
                      onClick={handleUploadClick}
                      disabled={uploadMutation.isPending}
                      className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-5 w-5" />
                      )}
                      Загрузить файлы
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl gradient-sber flex items-center justify-center mb-6 shadow-sber">
                      <BrainCircuit className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Данные загружены</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                      Искусственный интеллект готов проанализировать материалы и сформировать требования
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        onClick={handleStartSession}
                        disabled={isStartingSession}
                        className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all h-12 px-8 text-base"
                      >
                        {isStartingSession ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Анализируем...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Проанализировать с помощью ИИ
                          </>
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleUploadClick}
                        disabled={uploadMutation.isPending}
                        className="rounded-xl h-12"
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Добавить еще файлы
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Decorative backgrounds */}
              {hasFiles && (
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />
                </>
              )}
            </div>

            {/* Files List */}
            {hasFiles && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold px-1">Файлы проекта</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.files.map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate pr-2">{file.original_name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="uppercase">{file.original_name.split('.').pop()}</span>
                          <span>•</span>
                          <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context session link */}
            <div className="mt-6 text-center pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Или создайте сессию на основе контекстных вопросов
              </p>
              <Button variant="outline" asChild className="rounded-xl border-dashed">
                <Link href="/agent/context">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Контекстная сессия
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <FileOutput className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Требования еще не сформированы</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Запустите анализ в рабочей области, чтобы получить структурированный документ с требованиями
            </p>
            <Button onClick={() => setActiveTab("workspace")} variant="outline" className="rounded-xl">
              Перейти в рабочую область
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

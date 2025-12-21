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
  Clock,
  CheckCircle,
  PlayCircle,
  Upload,
  AlertTriangle,
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
        { user_goal: "Анализ требований проекта" }
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

  // Project info cards
  const infoCards = [
    {
      label: "Статус",
      value: project.status === "active" ? "Активен" : project.status === "finished" ? "Завершен" : project.status,
      icon: project.status === "finished" ? CheckCircle : PlayCircle,
      color: project.status === "finished" ? "text-green-500" : "text-blue-500",
      bgColor: project.status === "finished" ? "bg-green-500/10" : "bg-blue-500/10",
    },
    {
      label: "Файлов",
      value: project.files?.length ?? 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Создан",
      value: new Date(project.created_at).toLocaleDateString("ru-RU"),
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  const hasFiles = project.files && project.files.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
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
              <h1 className="font-semibold text-base">{project.title}</h1>
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
      <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 animate-slide-up">
          {infoCards.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-4 shadow-premium"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    stat.bgColor
                  )}
                >
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Files section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Файлы проекта</h2>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Загрузить файлы
              </Button>
            </div>
          </div>

          {project.files && project.files.length > 0 ? (
            <div className="rounded-xl border bg-card divide-y">
              {project.files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.original_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-8 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Нет файлов</h3>
              <p className="text-muted-foreground mb-4">
                Загрузите документы, чтобы AI-агент мог их проанализировать
              </p>
              <Button onClick={handleUploadClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Button>
            </div>
          )}
        </div>

        {/* Agent Session CTA */}
        <div className={cn(
          "rounded-xl border p-6 shadow-premium animate-scale-in transition-colors",
          hasFiles
            ? "bg-gradient-to-br from-primary/5 to-primary/10"
            : "bg-muted/30"
        )}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-colors",
              hasFiles ? "gradient-sber shadow-sber" : "bg-muted-foreground/20"
            )}>
              <Sparkles className={cn("w-7 h-7", hasFiles ? "text-white" : "text-muted-foreground")} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">AI-анализ требований</h2>
              <p className="text-muted-foreground">
                Запустите сессию с AI-агентом, чтобы сформировать бизнес-требования
                на основе файлов проекта.
              </p>
              {!hasFiles && (
                <div className="flex items-center gap-2 mt-2 text-amber-500 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Для запуска сессии необходимы файлы в проекте
                </div>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={isStartingSession || !hasFiles}
              className={cn(
                "w-full sm:w-auto transition-all duration-300",
                hasFiles ? "shadow-sber hover:shadow-sber-lg" : "opacity-50 cursor-not-allowed"
              )}
            >
              {isStartingSession ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Запуск...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Начать сессию
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Context session link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Или создайте сессию на основе контекстных вопросов
          </p>
          <Button variant="outline" asChild>
            <Link href="/agent/context">
              <Sparkles className="mr-2 h-4 w-4" />
              Контекстная сессия
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

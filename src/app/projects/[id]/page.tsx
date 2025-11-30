"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Search,
  FileAudio,
  Loader2,
  FolderOpen,
  Clock,
  BarChart3,
} from "lucide-react";

import { Button, Input, Skeleton, Progress } from "@/shared/ui";
import { useProject } from "@/entities/project";
import {
  useInterviews,
  useUploadInterview,
  InterviewCard,
} from "@/entities/interview";
import { UserDropdown } from "@/features/user-dropdown";
import { cn } from "@/shared/lib";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);

  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);
  const { data: interviewsData, isLoading: interviewsLoading } = useInterviews(
    projectId,
    { search }
  );
  const {
    mutate: uploadInterview,
    isPending: isUploading,
    variables: uploadingFile,
  } = useUploadInterview();

  const interviews = interviewsData?.items ?? [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadInterview({ projectId, data: { file } });
      event.target.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  const stats = [
    {
      label: "Интервью",
      value: interviews.length,
      icon: FileAudio,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Обработано",
      value: interviews.filter((i) => i.status === "done").length,
      icon: BarChart3,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "В обработке",
      value: interviews.filter((i) => i.status === "processing").length,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

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
              <h1 className="font-semibold text-base">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="hidden sm:flex shadow-sber hover:shadow-sber-lg transition-all duration-300"
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Загрузка..." : "Загрузить"}
            </Button>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 animate-slide-up">
          {stats.map((stat, index) => (
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

        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск интервью..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11"
            />
          </div>

          <div className="sm:hidden">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full shadow-sber"
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Загрузка..." : "Загрузить интервью"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Upload progress */}
        {isUploading && uploadingFile && (
          <div className="mb-6 rounded-xl border bg-card p-4 shadow-premium animate-scale-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {uploadingFile.data.file?.name || "Загрузка файла"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Загрузка и обработка...
                </p>
              </div>
            </div>
            <Progress value={undefined} className="h-1.5 rounded-full" />
          </div>
        )}

        {/* Content */}
        {interviewsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileAudio className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет интервью</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Загрузите первое интервью в этот проект, чтобы начать работу
            </p>
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all duration-300"
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить интервью
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

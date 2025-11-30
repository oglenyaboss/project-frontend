"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Search, FileAudio, Loader2 } from "lucide-react";

import { Button, Input, Skeleton, Progress } from "@/shared/ui";
import { useProject } from "@/entities/project";
import {
  useInterviews,
  useUploadInterview,
  InterviewCard,
} from "@/entities/interview";
import { UserDropdown } from "@/features/user-dropdown";

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
      // Сбрасываем input для повторной загрузки того же файла
      event.target.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container py-8 px-4">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Проект не найден</h1>
          <p className="text-muted-foreground mb-4">
            Возможно, проект был удалён или у вас нет к нему доступа
          </p>
          <Button asChild>
            <Link href="/dashboard">Вернуться к проектам</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <UserDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4">
        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск интервью..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Загрузка..." : "Загрузить интервью"}
            </Button>
          </div>
        </div>

        {/* Upload progress */}
        {isUploading && uploadingFile && (
          <div className="mb-6 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Загрузка: {uploadingFile.data.file?.name || "файл"}
              </span>
            </div>
            <Progress value={undefined} className="h-1.5" />
          </div>
        )}

        {/* Content */}
        {interviewsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <FileAudio className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Нет интервью</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Загрузите первое интервью в этот проект
            </p>
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить интервью
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
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

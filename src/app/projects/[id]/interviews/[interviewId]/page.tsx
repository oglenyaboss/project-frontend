"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileAudio,
  FileText,
  Calendar,
  FolderOpen,
  Download,
  Copy,
  Check,
  MoreHorizontal,
} from "lucide-react";

import {
  Button,
  Skeleton,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Progress,
} from "@/shared/ui";
import {
  useInterview,
  useDeleteInterview,
  useInterviewStatus,
  InterviewStatusBadge,
  InterviewTypeBadge,
} from "@/entities/interview";
import { UserDropdown } from "@/features/user-dropdown";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ id: string; interviewId: string }>;
}

export default function InterviewPage({ params }: Props) {
  const { id, interviewId } = use(params);
  const projectId = parseInt(id, 10);
  const interviewIdNum = parseInt(interviewId, 10);
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  const { data: interview, isLoading, error } = useInterview(interviewIdNum);

  const { mutate: deleteInterview, isPending: isDeleting } =
    useDeleteInterview();

  // WebSocket для отслеживания статуса
  const { status, progress, isConnected } = useInterviewStatus(interviewIdNum, {
    enabled: interview?.status === "processing",
  });

  const currentStatus = status || interview?.status;

  const handleDelete = () => {
    deleteInterview(
      { id: interviewIdNum, projectId },
      {
        onSuccess: () => {
          router.push(`/projects/${projectId}`);
        },
      }
    );
  };

  const handleCopyContent = async () => {
    if (interview?.content) {
      await navigator.clipboard.writeText(interview.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = interview
    ? new Date(interview.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const formattedUpdatedDate = interview?.updated_at
    ? new Date(interview.updated_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (isLoading) {
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
          <Skeleton className="h-96 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <FileAudio className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Интервью не найдено</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Возможно, интервью было удалено или у вас нет к нему доступа
          </p>
          <Button asChild className="rounded-xl">
            <Link href={`/projects/${projectId}`}>Вернуться к проекту</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {interview.type === "audio" ? (
                <FileAudio className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-base truncate max-w-md">
                {interview.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href={`/projects/${projectId}`}
                  className="hover:text-primary transition-colors"
                >
                  {interview.project.name}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InterviewStatusBadge
              status={currentStatus || "uploaded"}
              isConnected={isConnected}
            />
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link
                      href={`/projects/${projectId}/interviews/${interviewIdNum}/edit`}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Переименовать
                    </Link>
                  </DropdownMenuItem>
                  {interview.content && (
                    <DropdownMenuItem
                      onClick={handleCopyContent}
                      className="rounded-lg"
                    >
                      {copied ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copied ? "Скопировано!" : "Скопировать текст"}
                    </DropdownMenuItem>
                  )}
                  {interview.file_path && (
                    <DropdownMenuItem className="rounded-lg">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать файл
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive rounded-lg">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить интервью?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Интервью &ldquo;
                    {interview.name}
                    &rdquo; будет удалено навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                  >
                    {isDeleting ? "Удаление..." : "Удалить"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {interview.name}
          </h1>
          <Link
            href={`/projects/${projectId}`}
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <FolderOpen className="h-4 w-4" />
            {interview.project.name}
          </Link>
        </div>

        {/* Progress for processing */}
        {currentStatus === "processing" && progress !== null && (
          <div className="mb-6 rounded-xl border bg-card p-4 shadow-premium animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Обработка интервью</span>
              <span className="text-sm font-medium text-primary">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="rounded-xl border bg-card p-4 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Создано</p>
                <p className="font-medium text-sm">{formattedDate}</p>
              </div>
            </div>
          </div>

          {formattedUpdatedDate && (
            <div className="rounded-xl border bg-card p-4 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Обновлено</p>
                  <p className="font-medium text-sm">{formattedUpdatedDate}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-4 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                {interview.type === "audio" ? (
                  <FileAudio className="w-5 h-5 text-chart-4" />
                ) : (
                  <FileText className="w-5 h-5 text-chart-4" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Тип</p>
                <InterviewTypeBadge type={interview.type} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {interview.content ? (
          <div className="rounded-xl border bg-card shadow-premium animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Содержание</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyContent}
                className="rounded-lg"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {interview.content}
                </p>
              </div>
            </ScrollArea>
          </div>
        ) : currentStatus === "processing" ? (
          <div className="text-center py-16 animate-fade-in rounded-xl border bg-card shadow-premium">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileAudio className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Обработка интервью</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Интервью обрабатывается. Это может занять несколько минут.
            </p>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in rounded-xl border bg-card shadow-premium">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет содержания</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Текстовое содержание интервью пока недоступно
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

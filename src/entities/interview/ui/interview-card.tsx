"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileAudio,
  Calendar,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { cn } from "@/shared/lib";
import type { InterviewShallow } from "../model/types";
import { useDeleteInterview, useInterviewStatus } from "../";
import {
  InterviewStatusBadge,
  InterviewTypeBadge,
} from "./interview-status-badge";

interface InterviewCardProps {
  interview: InterviewShallow;
  projectId: number;
  className?: string;
}

export function InterviewCard({
  interview,
  projectId,
  className,
}: InterviewCardProps) {
  const { mutate: deleteInterview, isPending: isDeleting } =
    useDeleteInterview();

  const { status, progress, isConnected } = useInterviewStatus(interview.id, {
    enabled: interview.status === "processing",
  });

  const currentStatus = status || interview.status;

  const handleDelete = () => {
    deleteInterview({ id: interview.id, projectId });
  };

  const formattedDate = new Date(interview.created_at).toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border bg-card p-4 shadow-premium hover:shadow-premium-lg transition-all duration-300",
        className
      )}
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileAudio className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/projects/${projectId}/interviews/${interview.id}`}
            className="font-medium text-base truncate hover:text-primary transition-colors"
          >
            {interview.name}
          </Link>
          <InterviewTypeBadge type={interview.type} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Progress bar для processing статуса */}
        {currentStatus === "processing" && progress !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Обработка</span>
              <span className="text-xs font-medium text-primary">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5 rounded-full" />
          </div>
        )}
      </div>

      {/* Status Badge */}
      <InterviewStatusBadge status={currentStatus} isConnected={isConnected} />

      {/* Action Menu */}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem asChild className="rounded-lg">
              <Link href={`/projects/${projectId}/interviews/${interview.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Открыть
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg">
              <Link
                href={`/projects/${projectId}/interviews/${interview.id}/edit`}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Переименовать
              </Link>
            </DropdownMenuItem>
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
              Это действие нельзя отменить. Интервью &ldquo;{interview.name}
              &rdquo; будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Отмена</AlertDialogCancel>
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
    </div>
  );
}

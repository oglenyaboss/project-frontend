"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

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

  // Подключаем WebSocket только для processing статуса
  const { status, progress, isConnected } = useInterviewStatus(interview.id, {
    enabled: interview.status === "processing",
  });

  const currentStatus = status || interview.status;

  const handleDelete = () => {
    deleteInterview({ id: interview.id, projectId });
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/projects/${projectId}/interviews/${interview.id}`}
            className="font-medium truncate hover:underline"
          >
            {interview.name}
          </Link>
          <InterviewTypeBadge type={interview.type} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {new Date(interview.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Progress bar для processing статуса */}
        {currentStatus === "processing" && progress !== null && (
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground mt-1">
              {progress}%
            </span>
          </div>
        )}
      </div>

      <InterviewStatusBadge status={currentStatus} isConnected={isConnected} />

      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${projectId}/interviews/${interview.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Открыть
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/projects/${projectId}/interviews/${interview.id}/edit`}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Переименовать
              </Link>
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить интервью?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Интервью &ldquo;{interview.name}
              &rdquo; будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  Calendar,
  ArrowRight,
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
} from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { ProjectShallow } from "../model/types";
import { useDeleteProject } from "../model/queries";

// Extended ProjectShallow with optional description for card display
interface ProjectCardProject extends ProjectShallow {
  description?: string | null;
}

interface ProjectCardProps {
  project: ProjectCardProject;
  className?: string;
  viewMode?: "grid" | "list";
}

export function ProjectCard({
  project,
  className,
  viewMode = "grid",
}: ProjectCardProps) {
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const handleDelete = () => {
    deleteProject(project.id);
  };

  const formattedDate = new Date(project.created_at).toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group relative flex items-center gap-4 rounded-xl border bg-card p-4 shadow-premium hover:shadow-premium-lg transition-all duration-300",
          className
        )}
      >
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{formattedDate}</span>
          </div>
        </div>

        <ActionMenu
          project={project}
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Card Header with gradient */}
      <div className="h-2 gradient-sber" />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {project.title}
              </h3>
            </div>
          </Link>

          <ActionMenu
            project={project}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Открыть
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({
  project,
  isDeleting,
  onDelete,
}: {
  project: ProjectCardProject;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Открыть меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem asChild className="rounded-lg">
            <Link href={`/projects/${project.id}`}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Открыть
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg">
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
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
          <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие нельзя отменить. Проект &ldquo;{project.title}
            &rdquo; и все связанные с ним интервью будут удалены навсегда.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg">Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

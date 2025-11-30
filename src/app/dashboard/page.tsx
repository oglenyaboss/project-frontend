"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  LayoutGrid,
  List,
  Users,
  FileAudio,
  Clock,
} from "lucide-react";

import { Button, Input, Skeleton } from "@/shared/ui";
import { useProjects, ProjectCard } from "@/entities/project";
import { CreateProjectDialog } from "@/features/create-project";
import { UserDropdown } from "@/features/user-dropdown";
import { cn } from "@/shared/lib";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: projectsData, isLoading, error } = useProjects({ search });

  const projects = projectsData?.items ?? [];

  const stats = [
    {
      label: "Всего проектов",
      value: projects.length,
      icon: FolderOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Интервью",
      value: "—",
      icon: FileAudio,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Участников",
      value: "—",
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Часов записей",
      value: "—",
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-sber flex items-center justify-center shadow-sber">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">
              Сбер Интервью
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <CreateProjectDialog>
              <Button className="hidden sm:flex shadow-sber hover:shadow-sber-lg transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Новый проект
              </Button>
            </CreateProjectDialog>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Добро пожаловать 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Управляйте проектами и интервью в одном месте
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-card p-5 shadow-premium hover:shadow-premium-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.bgColor
                  )}
                >
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              placeholder="Поиск проектов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile create button */}
            <CreateProjectDialog>
              <Button size="icon" className="sm:hidden shadow-sber">
                <Plus className="h-5 w-5" />
              </Button>
            </CreateProjectDialog>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            )}
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "rounded-2xl",
                  viewMode === "grid" ? "h-44" : "h-24"
                )}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-destructive"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ошибка загрузки</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Не удалось загрузить проекты. Пожалуйста, попробуйте снова.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="rounded-xl"
            >
              Попробовать снова
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет проектов</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Создайте свой первый проект, чтобы начать организовывать интервью
            </p>
            <CreateProjectDialog>
              <Button className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Создать первый проект
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div
            className={cn(
              "animate-fade-in",
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            )}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

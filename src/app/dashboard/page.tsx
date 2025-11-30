"use client";

import { useState } from "react";
import { Plus, Search, FolderOpen } from "lucide-react";

import { Button, Input, Skeleton } from "@/shared/ui";
import { useProjects, ProjectCard } from "@/entities/project";
import { CreateProjectDialog } from "@/features/create-project";
import { UserDropdown } from "@/features/user-dropdown";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const { data: projectsData, isLoading, error } = useProjects({ search });

  const projects = projectsData?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Мои проекты</h1>
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
              placeholder="Поиск проектов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <CreateProjectDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Новый проект
            </Button>
          </CreateProjectDialog>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Ошибка загрузки проектов</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Нет проектов</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Создайте свой первый проект для организации интервью
            </p>
            <CreateProjectDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать первый проект
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

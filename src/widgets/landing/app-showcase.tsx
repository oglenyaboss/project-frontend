"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  LayoutGrid,
  List,
  Users,
  FileText,
  Clock,
  Calendar,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/shared/lib";

export function AppShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);

  const stats = [
    {
      label: "Активные проекты",
      value: 12,
      icon: FolderOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Требования",
      value: 124,
      icon: FileText,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Команда",
      value: 8,
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Часов экономии",
      value: 320,
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const mockProjects = [
    {
      id: 1,
      title: "FinTech App",
      description: "Мобильное приложение для банкинга",
      date: "12 мар 2024",
    },
    {
      id: 2,
      title: "CRM для Логистики",
      description: "Система управления перевозками",
      date: "10 мар 2024",
    },
    {
      id: 3,
      title: "HR Портал",
      description: "Внутренний портал для сотрудников",
      date: "08 мар 2024",
    },
  ];

  return (
    <div
      ref={ref}
      className="relative z-10 w-full max-w-6xl mx-auto mt-20 px-4 perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{
          scale: scaleProgress,
          opacity: opacityProgress,
          rotateX: rotateX,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-xl border border-white/10 bg-gray-900/50 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4"
      >
        {/* Mock Browser Window */}
        <div className="rounded-md bg-white p-4 ring-1 ring-white/10 lg:rounded-lg overflow-hidden relative aspect-[16/10] flex flex-col bg-background text-foreground font-sans">
          {/* Sticky Header Mock */}
          <div className="h-16 border-b flex items-center justify-between px-6 -mx-4 -mt-4 mb-6 bg-background/80 backdrop-blur-md sticky top-0 z-20">
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
              <span className="font-semibold text-lg tracking-tight">
                Сбер Требования
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex h-9 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Новый проект
              </div>
              <div className="w-9 h-9 rounded-full bg-muted border flex items-center justify-center">
                <span className="text-xs font-medium">AD</span>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-hidden flex flex-col gap-6 px-2">
            {/* Welcome */}
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold tracking-tight mb-1">
                Рабочее пространство 👋
              </h1>
              <p className="text-muted-foreground text-sm">
                Ваши проекты и требования в одном месте
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        stat.bgColor,
                      )}
                    >
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none mb-1">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 flex items-center text-muted-foreground">
                  Поиск проектов...
                </div>
              </div>
              <div className="flex items-center rounded-lg border bg-muted/50 p-1">
                <div className="p-1.5 rounded-md bg-background shadow-sm text-foreground">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </div>
                <div className="p-1.5 rounded-md text-muted-foreground">
                  <List className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-3 gap-4">
              {mockProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="h-1.5 gradient-sber" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{project.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">
                        Открыть <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* Glow behind */}
        <div className="absolute -inset-10 bg-primary/20 blur-3xl -z-10 opacity-30 pointer-events-none" />
      </motion.div>
    </div>
  );
}

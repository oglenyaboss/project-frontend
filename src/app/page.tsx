"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  BarChart3,
  Users,
  BrainCircuit,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";

import {
  Button,
  ThemeToggle,
  Counter,
  TiltCard,
  Magnetic,
  BentoGrid,
  BentoGridItem,
} from "@/shared/ui";
import { cn } from "@/shared/lib";
import { BackgroundBeams } from "@/shared/ui/grid-pattern";
import { Hero3D } from "@/widgets/landing/hero-3d";
import { AppShowcase } from "@/widgets/landing/app-showcase";

// ... existing imports ...

const stats = [
  { value: "5000+", label: "Требований создано" },
  { value: "50+", label: "Компаний используют" },
  { value: "98%", label: "Точность анализа" },
  { value: "5x", label: "Быстрее создание ТЗ" },
];

const features = [
  {
    title: "AI-Анализ интервью",
    description: "Автоматическое извлечение требований из записей встреч",
    icon: BrainCircuit,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    title: "Умные шаблоны",
    description: "Готовые структуры ТЗ по ГОСТ и ISO стандартам",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    title: "Версионность",
    description: "Полная история изменений требований",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  {
    title: "Командная работа",
    description: "Совместное редактирование в реальном времени",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    title: "Безопасность",
    description: "Шифрование данных и ролевая модель доступа",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  {
    title: "Аналитика",
    description: "Дашборды по статусам и метрикам требований",
    icon: BarChart3,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
  },
  {
    title: "Интеграции",
    description: "Синхронизация с Jira, Confluence и GitLab",
    icon: BarChart3,
    color: "text-teal-500",
    bgColor: "bg-teal-100 dark:bg-teal-900/20",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Combined 3D Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundBeams />
        <div className="absolute inset-0 opacity-40">
          <Hero3D />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b transition-all duration-300 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-sber flex items-center justify-center shadow-sber hover:scale-105 transition-transform duration-300">
              {/* Logo SVG */}
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              asChild
              className="hidden sm:flex hover:bg-primary/5"
            >
              <Link href="/login">Войти</Link>
            </Button>
            <Button
              asChild
              className="shadow-sber hover:shadow-sber-lg transition-all duration-300"
            >
              <Link href="/register">
                Начать бесплатно <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 dark:bg-black/40 backdrop-blur-sm px-4 py-1.5 text-sm text-foreground/80 shadow-sm mb-8 hover:bg-white/90 dark:hover:bg-black/60 transition-colors cursor-default animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Новое: Интеллектуальный анализ бизнес-требований
          </div>

          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="block text-foreground drop-shadow-sm">
              Веб-сервис для
            </span>
            <span className="gradient-sber-text drop-shadow-lg">
              анализа требований
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Превращайте хаос интервью в структурные спецификации.
            <br className="hidden sm:block" />
            ИИ-ассистент, который понимает контекст вашего бизнеса.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Magnetic>
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-14 px-10 text-lg shadow-sber-lg hover:shadow-sber hover:-translate-y-1 transition-all duration-300 rounded-full"
              >
                <Link href="/login">
                  Начать работу
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-14 px-10 text-lg bg-background/50 backdrop-blur hover:bg-background hover:-translate-y-1 transition-all duration-300 rounded-full border-primary/20"
              >
                <Link href="/register">
                  Попробовать
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* 3D Mockup Showcase */}
        <div
          className="relative z-10 mt-16 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <AppShowcase />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl sm:text-5xl font-bold gradient-sber-text mb-2 tracking-tight">
                  <Counter
                    value={parseInt(stat.value)}
                    suffix={stat.value.replace(/[\d]/g, "")}
                  />
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Полный цикл работы с требованиями
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              От сырых данных интервью до согласованной документации
            </p>
          </div>

          <div className="grid md:hidden gap-6">
            {features.map((feature, index) => (
              <TiltCard
                key={index}
                className="group rounded-3xl border bg-card p-6 shadow-premium"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    feature.bgColor,
                  )}
                >
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </TiltCard>
            ))}
          </div>

          <div className="hidden md:block">
            <BentoGrid className="max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <BentoGridItem
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  header={
                    <div
                      className={cn(
                        "flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 to-neutral-100 dark:to-neutral-800 items-center justify-center",
                        feature.bgColor,
                      )}
                    >
                      <feature.icon
                        className={cn("w-12 h-12 opacity-50", feature.color)}
                      />
                    </div>
                  }
                  className={index === 3 || index === 6 ? "md:col-span-2" : ""}
                />
              ))}
            </BentoGrid>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 gradient-sber relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container relative px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Начните работать эффективнее
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Присоединяйтесь к аналитикам, которые уже используют нашу платформу
            для ускорения сбора требований
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white text-primary hover:bg-white/90 shadow-xl h-14 px-8 text-lg hover:scale-105 transition-all duration-300"
          >
            <Link href="/register">
              Создать бесплатный аккаунт
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-sber flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold text-foreground/80">
                Сбер Требования
              </span>
            </div>

            <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Конфиденциальность
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Условия
              </Link>
              <Link
                href="/support"
                className="hover:text-primary transition-colors"
              >
                Поддержка
              </Link>
            </div>

            <p className="text-sm text-muted-foreground/80">
              © {new Date().getFullYear()} Сбер. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

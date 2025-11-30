"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileAudio,
  BarChart3,
  Users,
  Zap,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";

const features = [
  {
    icon: FileAudio,
    title: "Загрузка интервью",
    description:
      "Загружайте аудио, видео или текстовые файлы интервью для обработки",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "AI Транскрипция",
    description:
      "Автоматическая расшифровка речи с высокой точностью распознавания",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: BarChart3,
    title: "Умный анализ",
    description: "Получайте инсайты и ключевые темы из интервью автоматически",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Users,
    title: "Совместная работа",
    description: "Работайте с командой над проектами и делитесь результатами",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description:
      "Ваши данные защищены и хранятся в соответствии с требованиями",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Clock,
    title: "Экономия времени",
    description: "Сокращайте время на обработку интервью до 10 раз",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
];

const stats = [
  { value: "1000+", label: "Интервью обработано" },
  { value: "50+", label: "Компаний используют" },
  { value: "95%", label: "Точность транскрипции" },
  { value: "10x", label: "Быстрее ручной работы" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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
            <span className="font-semibold text-lg">Сбер Интервью</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="shadow-sber hover:shadow-sber-lg">
              <Link href="/register">
                Начать бесплатно
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMUEwMzgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-accent/50 px-4 py-1.5 text-sm text-accent-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Новое: AI-анализ интервью
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Современная платформа для{" "}
              <span className="gradient-sber-text">проведения интервью</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Загружайте, транскрибируйте и анализируйте интервью с помощью
              искусственного интеллекта. Всё в одном месте.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto shadow-sber-lg hover:shadow-sber transition-all duration-300"
              >
                <Link href="/register">
                  Начать бесплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/login">
                  Войти в систему
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up">
                <p className="text-3xl sm:text-4xl font-bold gradient-sber-text mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Всё для работы с интервью
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              От загрузки файла до получения готового анализа — все инструменты
              в одной платформе
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border bg-card p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    feature.bgColor
                  )}
                >
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 gradient-sber relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container relative px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Начните работать эффективнее уже сегодня
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к компаниям, которые уже используют Сбер Интервью
            для улучшения процессов исследований
          </p>
          <Button
            size="lg"
            asChild
            className="bg-white text-primary hover:bg-white/90 shadow-lg"
          >
            <Link href="/register">
              Создать бесплатный аккаунт
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-sber flex items-center justify-center">
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
              <span className="font-semibold">Сбер Интервью</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Конфиденциальность
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Условия
              </Link>
              <Link href="/support" className="hover:text-foreground">
                Поддержка
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 Сбер. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

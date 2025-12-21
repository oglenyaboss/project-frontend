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

import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";

const features = [
  {
    icon: FileText,
    title: "Анализ интервью",
    description:
      "Автоматическое извлечение бизнес-требований из текстов и аудиозаписей",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BrainCircuit,
    title: "AI Структурирование",
    description:
      "Превращение хаотичных заметок в четкую структуру требований",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: BarChart3,
    title: "Шаблоны документов",
    description: "Готовые шаблоны для формирования ТЗ и спецификаций",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Users,
    title: "Командная работа",
    description: "Совместное редактирование и согласование требований",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description:
      "Защищенное хранение конфиденциальных данных проекта",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Clock,
    title: "Ускорение работы",
    description: "Сокращение времени на аналитику в 5-10 раз",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
];

const stats = [
  { value: "5000+", label: "Требований создано" },
  { value: "50+", label: "Компаний используют" },
  { value: "98%", label: "Точность анализа" },
  { value: "5x", label: "Быстрее создание ТЗ" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-sber flex items-center justify-center shadow-sber hover:scale-105 transition-transform duration-300">
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
            <span className="font-semibold text-lg tracking-tight">Сбер Требования</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex hover:bg-primary/5">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="shadow-sber hover:shadow-sber-lg transition-all duration-300">
              <Link href="/register">
                Начать бесплатно
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-accent/30 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMUEwMzgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm text-foreground/80 shadow-sm mb-8 hover:bg-white transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Новое: Интеллектуальный анализ бизнес-требований
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Веб-сервис для работы с{" "}
              <span className="gradient-sber-text">интервью и бизнес-требованиями</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Превращайте записи интервью в структурированные бизнес-требования,
              технические задания и спецификации с помощью искусственного интеллекта.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-12 px-8 text-base shadow-sber-lg hover:shadow-sber hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link href="/register">
                  Начать работу
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-12 px-8 text-base bg-white/50 hover:bg-white hover:-translate-y-0.5 transition-all duration-300"
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
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-4xl sm:text-5xl font-bold gradient-sber-text mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-3xl border bg-card p-8 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110",
                    feature.bgColor
                  )}
                >
                  <feature.icon className={cn("w-7 h-7", feature.color)} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
              <span className="font-semibold text-foreground/80">Сбер Требования</span>
            </div>

            <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Конфиденциальность
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Условия
              </Link>
              <Link href="/support" className="hover:text-primary transition-colors">
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

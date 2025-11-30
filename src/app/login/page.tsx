"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Sparkles,
} from "lucide-react";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared/ui";
import { loginSchema, type LoginRequest } from "@/shared/lib/schemas";
import { useLogin } from "@/features/auth";
import { Sber3DLogo } from "@/features/sber-3d-logo";

const features = [
  {
    icon: Shield,
    title: "Безопасность",
    description: "Корпоративный уровень защиты данных",
  },
  {
    icon: Zap,
    title: "Скорость",
    description: "Мгновенная транскрипция и анализ",
  },
  {
    icon: Users,
    title: "Командная работа",
    description: "Совместный доступ к проектам",
  },
];

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginRequest) {
    login(values);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Left Side - 3D Hero Section */}
      <div className="relative lg:w-3/5 min-h-[50vh] lg:min-h-screen bg-gradient-to-br from-[#0d1117] via-[#0a1628] to-[#0d1117] overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(33,160,56,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(33,160,56,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#21A038]/20 rounded-full blur-[128px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#21A038]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        {/* 3D Logo */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <Sber3DLogo className="w-[140%] h-[140%] max-w-none max-h-none" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12 xl:p-16">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#21A038] flex items-center justify-center shadow-lg shadow-[#21A038]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 font-semibold text-xl tracking-tight">
                Сбер Интервью
              </span>
            </div>
          </div>

          {/* Hero Text - Hidden on mobile, shown on lg */}
          <div className="hidden lg:block max-w-xl animate-fade-in">
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Новый стандарт
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#21A038] to-[#2ecc71]">
                проведения интервью
              </span>
            </h1>
            <p className="text-white/60 text-lg xl:text-xl leading-relaxed mb-10">
              Организуйте, записывайте и анализируйте интервью с помощью
              искусственного интеллекта. Всё в одном месте.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-slide-up"
                >
                  <feature.icon className="w-4 h-4 text-[#21A038]" />
                  <span className="text-white/80 text-sm font-medium">
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="hidden lg:flex items-center gap-6 text-white/40 text-sm">
            <span>© 2025</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Все права защищены</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <Link
              href="/privacy"
              className="hover:text-white/60 transition-colors"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background relative">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#21A038]/5 via-transparent to-transparent opacity-50" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[#21A038] flex items-center justify-center shadow-lg shadow-[#21A038]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl">Сбер Интервью</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              Добро пожаловать
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg">
              Войдите в свой аккаунт для продолжения
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-scale-in">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-medium">
                  {error.message || "Неверный email или пароль"}
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 px-4 text-base rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-[#21A038] focus:ring-[#21A038]/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">
                        Пароль
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-[#21A038] hover:text-[#21A038]/80 transition-colors font-medium"
                      >
                        Забыли пароль?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 px-4 text-base rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-[#21A038] focus:ring-[#21A038]/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 text-base font-semibold rounded-xl bg-[#21A038] hover:bg-[#1a8f2f] text-white shadow-lg shadow-[#21A038]/25 hover:shadow-[#21A038]/40 transition-all duration-300 group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    Войти
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">
                или продолжить с
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              className="h-12 rounded-xl border-border/50 hover:bg-accent/50 hover:border-border transition-all"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-12 rounded-xl border-border/50 hover:bg-[#21A038]/10 hover:border-[#21A038]/30 hover:text-[#21A038] transition-all"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"
                />
              </svg>
              Сбер ID
            </Button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="text-[#21A038] font-semibold hover:text-[#21A038]/80 transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-8 border-t border-border/30">
            <div className="flex items-center justify-center gap-6 text-muted-foreground/60 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>SSL шифрование</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>GDPR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

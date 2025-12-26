"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Loader2,
  Shield,
  LogOut,
  Pencil,
  Moon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Skeleton,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Avatar,
  AvatarFallback,
  Badge,
  ThemeToggle,
} from "@/shared/ui";
import { useCurrentUser, useUpdateUser } from "@/entities/user";
import { useAuthStore } from "@/shared/store";
import { UserDropdown } from "@/features/user-dropdown";

const profileSchema = z.object({
  display_name: z
    .string()
    .min(4, "Имя должно быть не менее 4 символов")
    .max(50, "Имя слишком длинное"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();

  const { data: user, isLoading, error } = useCurrentUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const logout = useAuthStore((state) => state.logout);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ display_name: user.display_name });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileForm) => {
    updateUser(data, {
      onSuccess: () => {
        toast.success("Профиль обновлён");
      },
      onError: (error) => {
        toast.error(error.message || "Ошибка обновления профиля");
      },
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const formattedCreatedDate = user
    ? new Date(user.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </header>
        <main className="container py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Ошибка загрузки профиля</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Не удалось загрузить данные профиля. Попробуйте войти снова.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/login">Войти</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-lg hover:bg-primary/10"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 rounded-xl gradient-sber flex items-center justify-center shadow-sber">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold hidden sm:inline-block">
              Профиль
            </span>
          </div>
          <UserDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 animate-fade-in">
            <Avatar className="h-24 w-24 text-3xl shrink-0">
              <AvatarFallback className="gradient-sber text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                {user.display_name}
              </h1>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <Badge
                variant={user.is_active ? "success" : "warning"}
                className="text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                {user.is_active ? "Активный аккаунт" : "Неактивный аккаунт"}
              </Badge>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
            <div className="rounded-xl border bg-card p-4 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Дата регистрации
                  </p>
                  <p className="font-medium text-sm">{formattedCreatedDate}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-chart-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="font-medium text-sm">#{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="rounded-xl border bg-card p-6 shadow-premium mb-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pencil className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Редактировать профиль</h2>
                <p className="text-sm text-muted-foreground">
                  Измените отображаемое имя
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Отображаемое имя</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите имя"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isDirty}
                  className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all duration-300"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border bg-card p-6 shadow-premium mb-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="font-semibold">Внешний вид</h2>
                <p className="text-sm text-muted-foreground">
                  Настройте тему оформления
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Тема приложения</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Logout */}
          <div className="rounded-xl border bg-card p-6 shadow-premium animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold">Выход</h2>
                <p className="text-sm text-muted-foreground">
                  Выйти из текущего аккаунта
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти из аккаунта
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

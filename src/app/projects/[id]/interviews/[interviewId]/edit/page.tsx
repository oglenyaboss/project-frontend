"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, FileAudio, FileText, Loader2 } from "lucide-react";

import {
  Button,
  Input,
  Skeleton,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui";
import { useInterview, useUpdateInterview } from "@/entities/interview";
import { UserDropdown } from "@/features/user-dropdown";

const editInterviewSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Название слишком длинное"),
});

type EditInterviewForm = z.infer<typeof editInterviewSchema>;

interface Props {
  params: Promise<{ id: string; interviewId: string }>;
}

export default function EditInterviewPage({ params }: Props) {
  const { id, interviewId } = use(params);
  const projectId = parseInt(id, 10);
  const interviewIdNum = parseInt(interviewId, 10);
  const router = useRouter();

  const { data: interview, isLoading, error } = useInterview(interviewIdNum);
  const { mutate: updateInterview, isPending } = useUpdateInterview();

  const form = useForm<EditInterviewForm>({
    resolver: zodResolver(editInterviewSchema),
    defaultValues: {
      name: "",
    },
  });

  // Заполняем форму после загрузки данных
  useEffect(() => {
    if (interview) {
      form.reset({ name: interview.name });
    }
  }, [interview, form]);

  const onSubmit = (data: EditInterviewForm) => {
    updateInterview(
      { id: interviewIdNum, data },
      {
        onSuccess: () => {
          router.push(`/projects/${projectId}/interviews/${interviewIdNum}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-9 w-9 rounded-lg mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-14 rounded-xl mb-4" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <FileAudio className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Интервью не найдено</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Возможно, интервью было удалено или у вас нет к нему доступа
          </p>
          <Button asChild className="rounded-xl">
            <Link href={`/projects/${projectId}`}>Вернуться к проекту</Link>
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
              <Link
                href={`/projects/${projectId}/interviews/${interviewIdNum}`}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {interview.type === "audio" ? (
                <FileAudio className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <span className="font-semibold">Редактирование интервью</span>
          </div>
          <UserDropdown />
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Переименовать интервью
          </h1>
          <p className="text-muted-foreground">Измените название интервью</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 animate-slide-up"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название интервью</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название"
                      className="h-14 text-lg rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all duration-300"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

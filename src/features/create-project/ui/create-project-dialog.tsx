"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, FolderPlus, Upload, X, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/shared/ui";
import { useCreateProject } from "@/entities/project";

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

// Схема для формы (валидация названия и описания)
const createProjectFormSchema = z.object({
  title: z
    .string()
    .min(4, "Название должно содержать минимум 4 символа")
    .max(50, "Название не должно превышать 50 символов"),
  description: z.string().min(1, "Описание обязательно"),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createProject, isPending, error } = useCreateProject();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    // Сбрасываем value, чтобы можно было выбрать тот же файл повторно если нужно
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values: CreateProjectFormData) {
    createProject(
      {
        title: values.title,
        description: values.description,
        files: files.length > 0 ? files : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          setFiles([]);
        },
      }
    );
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // При закрытии можно не сбрасывать форму, если пользователь случайно закрыл
      // Но если нужно сбрасывать - раскомментировать:
      // form.reset();
      // setFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with gradient */}
        <div className="gradient-sber px-6 pt-6 pb-8 text-white shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FolderPlus className="w-6 h-6" />
            </div>
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-white">
              Создать проект
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Создайте новый проект и загрузите необходимые файлы
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-scale-in">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error.message || "Ошибка создания проекта"}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Название проекта
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: UX исследование"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Описание
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите цели и задачи проекта..."
                        className="resize-none min-h-[100px] rounded-xl"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Files Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">Файлы проекта</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8"
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Добавить файлы
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 ? (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Файлы не выбраны. Вы можете загрузить их сейчас или добавить позже.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-xl"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl shadow-sber hover:shadow-sber-lg transition-all duration-300"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Создать проект
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

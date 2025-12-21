"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { UserDropdown } from "@/features/user-dropdown";
import {
    Loader2,
    Sparkles,
    ArrowRight,
    Target,
    ArrowLeft,
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
    Textarea,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/ui";
import { agentApi } from "@/shared/api";
import {
    sessionStartManualContextRequestSchema,
    SessionStartManualContextRequest
} from "@/shared/lib/schemas";

export default function AgentContextPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SessionStartManualContextRequest>({
        resolver: zodResolver(sessionStartManualContextRequestSchema),
        defaultValues: {
            user_goal: "",
            context_questions: {
                task: "",
                goal: "",
                value: ""
            }
        },
    });

    const onSubmit = async (data: SessionStartManualContextRequest) => {
        setIsSubmitting(true);
        const { data: session, error } = await agentApi.startContextSession(data);

        if (error || !session) {
            console.error("Failed to start session:", error);
            form.setError("root", { message: error || "Не удалось создать сессию" });
        } else {
            router.push(`/agent/sessions/${session.id}`);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-50 glass border-b transition-all duration-300">
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
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">
                            Сбер Требования
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserDropdown />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-10 px-4 max-w-3xl">
                <div className="mb-8 text-center animate-fade-in">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Новая сессия анализа</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Ответьте на несколько контекстных вопросов, чтобы агент мог помочь вам сформировать требования к системе.
                    </p>
                </div>

                <Card className="shadow-premium border-muted/50 animate-slide-up">
                    <CardHeader>
                        <CardTitle>Контекст задачи</CardTitle>
                        <CardDescription>Заполните начальную информацию</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <FormField
                                    control={form.control}
                                    name="user_goal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Общая цель</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Например: Разработать CRM для малого бизнеса" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-6 p-6 bg-muted/30 rounded-xl border border-border/50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Детализация
                                    </h3>

                                    <FormField
                                        control={form.control}
                                        name="context_questions.task"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Что хотите сделать? (Task)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Опишите саму задачу..." className="min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="context_questions.goal"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Какая цель у этой задачи? (Goal)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Для чего это нужно..." className="min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="context_questions.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Какую ценность несёт? (Value)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Польза для бизнеса или пользователя..." className="min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {form.formState.errors.root && (
                                    <div className="text-destructive text-sm font-medium">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Создание сессии...
                                        </>
                                    ) : (
                                        <>
                                            Начать анализ
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

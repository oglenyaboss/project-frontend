"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Edit3,
    Save,
    X,
    Loader2,
    FileText,
    CheckCircle,
    Eye,
    Columns,
    Maximize2
} from "lucide-react";

import {
    Button,
    Textarea,
    Skeleton,
    Alert,
    AlertDescription,
    AlertTitle,
    ScrollArea,
} from "@/shared/ui";
import { agentApi } from "@/shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib";

interface Props {
    params: Promise<{ id: string }>;
}

export default function RequirementsPage({ params }: Props) {
    const { id } = use(params);
    const requirementsId = parseInt(id, 10);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

    // Fetch requirements
    const {
        data: requirementResult,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["requirements", requirementsId],
        queryFn: () => agentApi.getRequirement(requirementsId),
        enabled: !!requirementsId,
    });

    const requirement = requirementResult?.data;

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await fetch(`/api/requirements/${requirementsId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                throw new Error("Failed to update requirements");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requirements", requirementsId] });
            setIsEditing(false);
        },
    });

    const handleStartEdit = () => {
        if (requirement) {
            setEditContent(requirement.content);
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        updateMutation.mutate(editContent);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent("");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-50 glass border-b">
                    <div className="container flex h-16 items-center px-4">
                        <Skeleton className="h-9 w-9 rounded-lg mr-3" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </header>
                <main className="container py-8 px-4 max-w-5xl mx-auto">
                    <Skeleton className="h-10 w-64 mb-4" />
                    <Skeleton className="h-[600px] rounded-xl" />
                </main>
            </div>
        );
    }

    if (error || !requirement) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Требования не найдены</h1>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Возможно, требования были удалены или у вас нет к ним доступа
                    </p>
                    <Button onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b backdrop-blur-md bg-background/80">
                <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-lg hover:bg-primary/10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-base">Бизнес-требования</h1>
                            <p className="text-xs text-muted-foreground font-mono">
                                ID: {requirementsId} • {new Date(requirement.created_at).toLocaleDateString("ru-RU")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Редактировать
                                </Button>
                                <Button variant="outline" size="sm" asChild className="gap-2">
                                    <a href={agentApi.exportRequirementUrl(requirementsId, "docx")}>
                                        <Download className="w-4 h-4" />
                                        DOCX
                                    </a>
                                </Button>
                                <Button size="sm" asChild className="gap-2">
                                    <a href={agentApi.exportRequirementUrl(requirementsId, "pdf")}>
                                        <Download className="w-4 h-4" />
                                        PDF
                                    </a>
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center border rounded-lg mr-2 p-1 bg-muted/30">
                                    <Button
                                        variant={viewMode === "split" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7 rounded-md"
                                        onClick={() => setViewMode("split")}
                                        title="Split View"
                                    >
                                        <Columns className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "edit" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7 rounded-md"
                                        onClick={() => setViewMode("edit")}
                                        title="Edit Only"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "preview" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7 rounded-md"
                                        onClick={() => setViewMode("preview")}
                                        title="Preview Only"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={updateMutation.isPending}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Отмена
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="min-w-[100px]"
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Сохранить
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className={cn(
                "flex-1 container mx-auto py-6 px-4",
                isEditing ? "max-w-7xl h-[calc(100vh-64px)] overflow-hidden" : "max-w-4xl"
            )}>
                {updateMutation.isError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Ошибка</AlertTitle>
                        <AlertDescription>
                            Не удалось сохранить изменения. Попробуйте ещё раз.
                        </AlertDescription>
                    </Alert>
                )}

                {isEditing ? (
                    <div className="h-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                        {/* Editor */}
                        <div className={cn(
                            "h-full flex flex-col font-mono text-sm",
                            viewMode === "preview" && "hidden",
                            viewMode === "edit" && "col-span-2 md:col-span-2"
                        )}>
                            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Edit3 className="w-3 h-3" /> Source (Markdown)
                            </div>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 resize-none bg-card p-4 rounded-xl border shadow-sm focus-visible:ring-1 h-full min-h-[500px]"
                                placeholder="Введите содержимое требований..."
                            />
                        </div>

                        {/* Preview */}
                        <div className={cn(
                            "h-full flex flex-col min-h-0",
                            viewMode === "edit" && "hidden",
                            viewMode === "preview" && "col-span-2 md:col-span-2"
                        )}>
                            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Eye className="w-3 h-3" /> Preview
                            </div>
                            <div className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
                                <ScrollArea className="flex-1 p-6">
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {editContent}
                                        </ReactMarkdown>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border shadow-premium overflow-hidden">
                        <div className="p-8">
                            <div className="prose prose-base dark:prose-invert max-w-none break-words">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {requirement.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

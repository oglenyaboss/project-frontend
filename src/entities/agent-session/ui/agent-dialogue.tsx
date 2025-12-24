"use client";

import { useEffect, useRef } from "react";
import type { DialogueItem, SessionStatus } from "@/shared/lib/schemas";
import { ScrollArea } from "@/shared/ui";
import { AnswerInput } from "./answer-input";
import { Loader2, CheckCircle, SkipForward, HelpCircle, User, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AgentDialogueProps {
    dialogue: DialogueItem[];
    status: SessionStatus | null;
    onAnswer: (text: string, questionId: number) => void;
    onSkip: (questionId: number) => void;
    isSubmitting?: boolean;
    className?: string;
}

export function AgentDialogue({
    dialogue,
    status,
    onAnswer,
    onSkip,
    isSubmitting = false,
    className,
}: AgentDialogueProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevDialogueLengthRef = useRef<number>(0);
    const userHasScrolledRef = useRef<boolean>(false);

    // Track user scroll to disable auto-scroll when user is reading history
    useEffect(() => {
        const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
            // If user scrolled up more than 100px from bottom, mark as user-scrolled
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            userHasScrolledRef.current = !isNearBottom;
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll to bottom only when new dialogue items are added
    useEffect(() => {
        const newLength = dialogue.length;
        const prevLength = prevDialogueLengthRef.current;

        // Only scroll if new items were added AND user hasn't scrolled up
        if (newLength > prevLength && !userHasScrolledRef.current) {
            if (scrollRef.current) {
                const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                    scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
                }
            }
        }

        prevDialogueLengthRef.current = newLength;
    }, [dialogue]);

    // Find the last unanswered question
    const lastUnansweredQuestion = dialogue.find(
        item => !item.answer
    )?.question;

    const isWaitingForAnswer = lastUnansweredQuestion && !["done", "cancelled", "error"].includes(status || "");
    const isProcessing = status === "processing";

    const handleSubmit = (text: string) => {
        if (lastUnansweredQuestion) {
            onAnswer(text, lastUnansweredQuestion.id);
        }
    };

    const handleSkip = () => {
        if (lastUnansweredQuestion) {
            onSkip(lastUnansweredQuestion.id);
        }
    };

    return (
        <div className={cn("flex flex-col h-[calc(100vh-300px)] min-h-[500px] border rounded-xl overflow-hidden bg-muted/30", className)}>
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm z-10">
                <h3 className="font-semibold flex items-center gap-2">
                    <motion.div
                        className={cn("w-2 h-2 rounded-full",
                            isProcessing ? "bg-yellow-500" :
                                status === "waiting_for_answers" ? "bg-green-500" :
                                    status === "done" ? "bg-blue-500" :
                                        status === "cancelled" ? "bg-red-500" :
                                            "bg-gray-500"
                        )}
                        animate={{
                            scale: isProcessing ? [1, 1.2, 1] : 1,
                            opacity: isProcessing ? [1, 0.7, 1] : 1
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    Диалог с агентом
                    <AnimatePresence mode="wait">
                        {status && (
                            <motion.span
                                key={status}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="text-xs font-normal text-muted-foreground ml-2"
                            >
                                ({status})
                            </motion.span>
                        )}
                    </AnimatePresence>
                </h3>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1 p-4 min-h-0">
                <div className="space-y-6 pb-4">
                    {dialogue.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                            <p>Ожидание вопросов от агента...</p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {dialogue.map((item) => (
                            <div key={item.question.id} className="space-y-4">
                                {/* Question */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 max-w-[90%]">
                                        <div className="bg-card border rounded-2xl rounded-tl-sm p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-xs font-medium text-primary">
                                                    Вопрос {item.question.question_number}
                                                </span>
                                                <QuestionStatusBadge status={item.answer ? "answered" : item.question.status} />
                                            </div>
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {item.question.content}
                                                </ReactMarkdown>
                                            </div>
                                            {item.question.explanation && (
                                                <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5 bg-muted/50 p-2 rounded-lg">
                                                    <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    {item.question.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Answer (if exists) */}
                                {item.answer && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="flex gap-3 justify-end"
                                    >
                                        <div className="flex-1 max-w-[85%]">
                                            <div className={cn(
                                                "rounded-2xl rounded-tr-sm p-4 shadow-sm transition-colors",
                                                item.answer.is_skipped
                                                    ? "bg-muted border border-dashed"
                                                    : "bg-primary text-primary-foreground"
                                            )}>
                                                {item.answer.is_skipped ? (
                                                    <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                        <SkipForward className="w-4 h-4" />
                                                        Вопрос пропущен
                                                    </p>
                                                ) : (
                                                    <div className={cn("prose prose-sm max-w-none text-sm break-words",
                                                        !item.answer.is_skipped && "prose-invert"
                                                    )}>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {item.answer.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                                            <User className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </AnimatePresence>

                    {/* Processing indicator */}
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-card border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-sm text-muted-foreground shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Агент думает...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>

            <AnswerInput
                onSubmit={handleSubmit}
                onSkip={handleSkip}
                isSubmitting={isSubmitting}
                disabled={!isWaitingForAnswer}
                canSkip={true}
                placeholder={
                    isWaitingForAnswer
                        ? "Введите ваш ответ..."
                        : isProcessing
                            ? "Агент обрабатывает..."
                            : "Ожидайте вопроса..."
                }
            />
        </div>
    );
}

function QuestionStatusBadge({ status }: { status: string }) {
    return (
        <motion.span
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider",
                status === "answered" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                status === "skipped" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                status === "unanswered" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                !["answered", "skipped", "unanswered"].includes(status) && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            )}>
            {status === "answered" && <CheckCircle className="w-3 h-3" />}
            {status === "skipped" && <SkipForward className="w-3 h-3" />}
            {status === "unanswered" && <Bot className="w-3 h-3" />}
            {!["answered", "skipped", "unanswered"].includes(status) && <AlertCircle className="w-3 h-3" />}

            {status === "answered" && "Отвечен"}
            {status === "skipped" && "Пропущен"}
            {status === "unanswered" && "Ожидает"}
            {!["answered", "skipped", "unanswered"].includes(status) && (status || "Ожидает")}
        </motion.span>
    );
}

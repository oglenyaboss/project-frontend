import { useState } from "react";
import { Send, SkipForward, Loader2 } from "lucide-react";
import { Button, Textarea } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface AnswerInputProps {
    onSubmit: (text: string) => void;
    onSkip?: () => void;
    isSubmitting?: boolean;
    canSkip?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export function AnswerInput({
    onSubmit,
    onSkip,
    isSubmitting = false,
    canSkip = true,
    disabled = false,
    placeholder = "Введите ваш ответ...",
}: AnswerInputProps) {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) return;
        onSubmit(value);
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="p-4 bg-background border-t">
            <div className="relative">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isSubmitting}
                    className="min-h-[80px] max-h-[200px] pr-24 resize-none rounded-xl"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                    {canSkip && onSkip && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            disabled={disabled || isSubmitting}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                            title="Пропустить вопрос"
                        >
                            <SkipForward className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!value.trim() || disabled || isSubmitting}
                        className="h-8 w-8 p-0 rounded-lg"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Enter для отправки, Shift + Enter для переноса строки
            </p>
        </div>
    );
}

import { AgentSessionMessage } from "@/shared/lib/schemas";
import { cn } from "@/shared/lib/utils";
import { Copy, HelpCircle, Check } from "lucide-react";
import { Button } from "@/shared/ui";
import { useState } from "react";

interface AgentMessageCardProps {
  message: AgentSessionMessage;
}

export function AgentMessageCard({ message }: AgentMessageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isQuestion = message.message_type === "question";
  const isAgent = message.role === "agent";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isAgent ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4 shadow-sm relative group",
          isAgent
            ? "bg-card border rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm",
        )}
      >
        {isQuestion && (
          <div className="flex items-center gap-2 mb-2 text-xs font-medium opacity-70">
            <HelpCircle className="w-3 h-3" />
            <span>Вопрос {message.question_number}</span>
            {message.question_status === "answered" && (
              <span className="text-green-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Отвечен
              </span>
            )}
            {message.question_status === "skipped" && (
              <span className="text-orange-500">Пропущен</span>
            )}
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {message.explanation && (
          <div className="mt-3 pt-3 border-t border-border/10 text-xs opacity-70">
            <p className="font-semibold mb-1">Пояснение:</p>
            {message.explanation}
          </div>
        )}

        <div
          className={cn(
            "text-[10px] mt-2 opacity-50 text-right",
            isAgent ? "text-muted-foreground" : "text-primary-foreground",
          )}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {isAgent && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

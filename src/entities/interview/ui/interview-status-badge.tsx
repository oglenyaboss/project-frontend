"use client";

import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileAudio,
  FileText,
  Upload,
} from "lucide-react";
import { Badge } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { InterviewStatus } from "../model/types";

interface InterviewStatusBadgeProps {
  status: InterviewStatus;
  isConnected?: boolean;
  className?: string;
}

const statusConfig: Record<
  InterviewStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  uploaded: {
    label: "Загружено",
    variant: "secondary",
    icon: Upload,
  },
  processing: {
    label: "Обработка",
    variant: "default",
    icon: Loader2,
  },
  question: {
    label: "Ожидание",
    variant: "outline",
    icon: Clock,
  },
  done: {
    label: "Готово",
    variant: "outline",
    icon: CheckCircle2,
  },
  error: {
    label: "Ошибка",
    variant: "destructive",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Отменено",
    variant: "secondary",
    icon: AlertCircle,
  },
};

export function InterviewStatusBadge({
  status,
  isConnected,
  className,
}: InterviewStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.uploaded;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-1", className)}
    >
      <Icon
        className={cn("h-3 w-3", status === "processing" && "animate-spin")}
      />
      {config.label}
      {status === "processing" && isConnected && (
        <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      )}
    </Badge>
  );
}

interface InterviewTypeBadgeProps {
  type: "text" | "text_file" | "audio";
  className?: string;
}

const typeConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  text: {
    label: "Текст",
    icon: FileText,
  },
  text_file: {
    label: "Файл",
    icon: FileText,
  },
  audio: {
    label: "Аудио",
    icon: FileAudio,
  },
};

export function InterviewTypeBadge({
  type,
  className,
}: InterviewTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.text;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1", className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

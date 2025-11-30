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
    variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning"
      | "info"
      | "processing";
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
    variant: "processing",
    icon: Loader2,
  },
  question: {
    label: "Ожидание",
    variant: "warning",
    icon: Clock,
  },
  done: {
    label: "Готово",
    variant: "success",
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
      className={cn("flex items-center gap-1.5", className)}
    >
      <Icon
        className={cn("h-3.5 w-3.5", status === "processing" && "animate-spin")}
      />
      {config.label}
      {status === "processing" && isConnected && (
        <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
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
      variant="info"
      className={cn("flex items-center gap-1.5", className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

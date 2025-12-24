"use client";

import { useTypewriter } from "./typewriter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownTypewriterProps {
  content: string;
  speed?: number;
  className?: string;
}

export function MarkdownTypewriter({
  content,
  speed = 10,
  className,
}: MarkdownTypewriterProps) {
  const typedContent = useTypewriter(content, speed);

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{typedContent}</ReactMarkdown>
    </div>
  );
}

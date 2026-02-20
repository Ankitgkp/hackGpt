"use client";

import { Message } from "./types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-4 px-4 py-6", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted border border-border",
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm",
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
        )}
      </div>
    </div>
  );
}

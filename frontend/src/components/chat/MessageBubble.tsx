"use client";

import { ReactNode } from "react";
import { Message } from "./types";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split("\n").map((line, i, arr) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
      .map((part, j) => {
        if (/^\*\*[^*]+\*\*$/.test(part))
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part))
          return <em key={j}>{part.slice(1, -1)}</em>;
        if (/^`[^`]+`$/.test(part))
          return (
            <code
              key={j}
              className="bg-black/10 dark:bg-white/10 rounded px-1 font-mono text-xs"
            >
              {part.slice(1, -1)}
            </code>
          );
        return part;
      });
    return (
      <span key={i}>
        {parts}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function renderMarkdown(content: string): ReactNode[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const elements: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      elements.push(
        <span
          key={`text-${lastIndex}`}
          className="whitespace-pre-wrap break-words"
        >
          {renderInlineMarkdown(textBefore)}
        </span>,
      );
    }

    const language = match[1] || "text";
    const code = match[2].replace(/\n$/, "");
    elements.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />,
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.slice(lastIndex);
  if (remaining) {
    elements.push(
      <span
        key={`text-${lastIndex}`}
        className="whitespace-pre-wrap break-words"
      >
        {renderInlineMarkdown(remaining)}
      </span>,
    );
  }

  return elements;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex px-4 py-3", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "text-sm leading-relaxed",
          isUser
            ? "max-w-[75%] rounded-3xl bg-muted dark:bg-white/10 text-foreground px-4 py-2.5"
            : "max-w-[75%]",
        )}
      >
        <div className="wrap-break-word">{renderMarkdown(message.content)}</div>
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
        )}
      </div>
    </div>
  );
}

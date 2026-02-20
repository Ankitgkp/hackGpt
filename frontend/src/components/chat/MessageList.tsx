"use client";

import { useEffect, useRef } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingMessageId: string | null;
}

export function MessageList({
  messages,
  isStreaming,
  streamingMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= 100;
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted border border-border">
          <Bot size={28} className="text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            How can I help you?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask me anything — I&apos;m ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto max-w-3xl">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.id === streamingMessageId}
          />
        ))}
        {isStreaming && streamingMessageId === null && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

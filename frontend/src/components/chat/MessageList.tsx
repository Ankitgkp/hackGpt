"use client";

import { useEffect, useRef } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { UnlimitedBadge } from "./UnlimitedBadge";

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
      <div className="relative flex flex-1 flex-col items-center justify-center text-center px-6">
        <div className="absolute top-4 right-5">
          <UnlimitedBadge />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Hello! How can I help you today?
        </h2>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto max-w-3xl pt-6">
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

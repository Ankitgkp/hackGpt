"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Session } from "./types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Sidebar } from "./Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth, authHeaders } from "@/context/AuthContext";

const BACKEND_URL = "http://localhost:3000";

export function ChatContainer() {
  const { user, isLoading } = useAuth();

  // Sidebar / session state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ── Load / clear sessions when auth state changes ──────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Guest: clear everything
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    // Logged in: fetch saved sessions
    fetch(`${BACKEND_URL}/sessions`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: Session[]) =>
        setSessions(
          data.map((s) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          })),
        ),
      )
      .catch(console.error);
  }, [user, isLoading]);

  // ── Load messages when switching sessions ─────────────────────────────────
  useEffect(() => {
    if (!activeSessionId || !user) return;
    fetch(`${BACKEND_URL}/sessions/${activeSessionId}/messages`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data: Message[]) =>
        setMessages(
          data.map((m) => ({ ...m, createdAt: new Date(m.createdAt) })),
        ),
      )
      .catch(console.error);
  }, [activeSessionId, user]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleNewChat = useCallback(async () => {
    if (!user) {
      // Guest: just clear the current in-memory chat
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`, {
        method: "POST",
        headers: authHeaders(),
      });
      const session: Session = await res.json();
      setSessions((prev) => [
        {
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        },
        ...prev,
      ]);
      setActiveSessionId(session.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await fetch(`${BACKEND_URL}/sessions/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [activeSessionId],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    // For logged-in users, auto-create a session if none is active
    let sessionId = activeSessionId;
    if (user && !sessionId) {
      try {
        const res = await fetch(`${BACKEND_URL}/sessions`, {
          method: "POST",
          headers: authHeaders(),
        });
        const session: Session = await res.json();
        setSessions((prev) => [
          {
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
          },
          ...prev,
        ]);
        setActiveSessionId(session.id);
        sessionId = session.id;
      } catch (err) {
        console.error(err);
        return;
      }
    }
    // Guests: sessionId stays null — messages are ephemeral (no DB write)

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      },
    ]);
    setIsStreaming(true);
    setStreamingMessageId(assistantId);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${BACKEND_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ prompt, sessionId }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Network error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Optimistically update sidebar title after first message
      if (user && sessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, title: prompt.slice(0, 60), updatedAt: new Date() }
              : s,
          ),
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Something went wrong. Please try again." }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }, [input, isStreaming, activeSessionId, user]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onSignInClick={() => setAuthModalOpen(true)}
      />

      {/* Main panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
            <span className="font-semibold tracking-tight">HackGPT</span>
            {!user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Sign in to save chats
              </button>
            )}
            {user && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {user.username}
              </span>
            )}
          </div>
        </header>

        {/* Messages */}
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingMessageId={streamingMessageId}
        />

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

"use client";

import { Session } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  PenSquare,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  LogIn,
  User,
} from "lucide-react";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onSignInClick: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggle,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onSignInClick,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  if (!isOpen) {
    return (
      <div className="flex h-full w-14 flex-col items-center justify-between border-r border-border bg-muted/30 py-3">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="size-9"
            title="Open sidebar"
          >
            <PanelLeft size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="size-9"
            title="New chat"
          >
            <PenSquare size={18} />
          </Button>
        </div>
        <div className="pb-1">
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="size-9"
              title="Sign out"
            >
              <LogOut size={16} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignInClick}
              className="size-9"
              title="Sign in"
            >
              <LogIn size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-muted/30">
      <div className="flex h-14 items-center justify-between px-3">
        <span className="text-sm font-semibold tracking-tight">HackGPT</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="size-8"
            title="New chat"
          >
            <PenSquare size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="size-8"
            title="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {!user ? (
          <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Sign in to save your chats across sessions.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onSignInClick}
              className="w-full gap-2"
            >
              <LogIn size={14} />
              Sign in
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            No chats yet. Start a new one!
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                session.id === activeSessionId
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={14} className="shrink-0 opacity-60" />
              <span className="flex-1 truncate">{session.title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={cn(
                  "size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
                  "hover:bg-destructive/10 hover:text-destructive",
                )}
                title="Delete chat"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-border p-3">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{user.username}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="size-7 shrink-0"
              title="Sign out"
            >
              <LogOut size={14} />
            </Button>
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <User size={14} />
            <span>Sign in to save chats</span>
          </button>
        )}
      </div>
    </aside>
  );
}

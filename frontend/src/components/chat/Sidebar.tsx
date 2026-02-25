"use client";

import { useState } from "react";
import { Session } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  PenSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  LogIn,
  Search,
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

function groupSessionsByDate(sessions: Session[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const groups: { label: string; sessions: Session[] }[] = [];
  const todayGroup: Session[] = [];
  const yesterdayGroup: Session[] = [];
  const last7Group: Session[] = [];
  const olderGroup: Session[] = [];

  for (const s of sessions) {
    const d = new Date(s.updatedAt);
    if (d >= today) todayGroup.push(s);
    else if (d >= yesterday) yesterdayGroup.push(s);
    else if (d >= sevenDaysAgo) last7Group.push(s);
    else olderGroup.push(s);
  }

  if (todayGroup.length) groups.push({ label: "Today", sessions: todayGroup });
  if (yesterdayGroup.length)
    groups.push({ label: "Yesterday", sessions: yesterdayGroup });
  if (last7Group.length)
    groups.push({ label: "Previous 7 days", sessions: last7Group });
  if (olderGroup.length) groups.push({ label: "Older", sessions: olderGroup });

  return groups;
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sessions;

  const groupedSessions = groupSessionsByDate(filteredSessions);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-border bg-muted/30 dark:bg-sidebar backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-14",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-between py-3 transition-opacity duration-300",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
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

      <div
        className={cn(
          "flex h-full w-64 flex-col transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-2">
            <PanelLeftClose
              size={16}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              onClick={onToggle}
            />
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">
              HackGPT
            </span>
          </div>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={onNewChat}
            className="w-full rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/20 text-primary transition-all py-2.5 font-semibold text-sm flex items-center justify-center whitespace-nowrap"
          >
            New Chat
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your threads..."
              className="w-full rounded-lg bg-accent/50 border border-border/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {!user ? (
            <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Sign in to save your chats.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground whitespace-nowrap">
              {searchQuery
                ? "No matching chats."
                : "No chats yet. Start a new one!"}
            </p>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 pt-2 pb-1 text-xs font-medium text-primary/80">
                  {group.label}
                </p>
                {group.sessions.map((session) => (
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
                ))}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/50 p-3">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {user.username}
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
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

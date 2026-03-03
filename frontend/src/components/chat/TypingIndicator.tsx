"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-6 py-4 animate-fade-in-up">
      <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 border border-border/40 px-4 py-3">
        <span
          className="size-1.5 rounded-full bg-primary/70 animate-dot-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-primary/70 animate-dot-bounce"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-primary/70 animate-dot-bounce"
          style={{ animationDelay: "320ms" }}
        />
      </div>
    </div>
  )
}

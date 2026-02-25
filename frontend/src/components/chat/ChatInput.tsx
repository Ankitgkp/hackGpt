"use client"

import { useRef, useEffect, KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSubmit, onStop, isStreaming, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming && value.trim()) onSubmit()
    }
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border px-4 py-3 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={disabled}
            className={cn(
              "max-h-[200px] flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/60"
            )}
          />
          <Button
            size="icon"
            onClick={isStreaming ? onStop : onSubmit}
            disabled={!isStreaming && (!value.trim() || disabled)}
            className="mb-0.5 size-8 shrink-0 rounded-full"
          >
            {isStreaming ? <Square size={14} fill="currentColor" /> : <ArrowUp size={16} />}
          </Button>
        </div>

      </div>
    </div>
  )
}

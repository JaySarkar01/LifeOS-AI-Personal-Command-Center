"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";

interface AIInputProps {
  onSend: (prompt: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export function AIInput({ onSend, onClear, isLoading }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSend(prompt.trim());
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = prompt.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-card/80 border border-card-border/90 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 focus-within:shadow-[0_0_25px_rgba(56,189,248,0.12)] backdrop-blur-xl shadow-glass transition-all">
        {/* Left Sparkle / Prompt icon */}
        <div className="p-2 text-muted select-none flex items-center justify-center shrink-0">
          <Sparkles className={`w-4 h-4 transition-colors ${hasContent ? "text-accent" : "text-muted"}`} />
        </div>

        {/* Auto-expanding Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask LifeOS anything about your tasks, habits, schedule, or goals..."
          disabled={isLoading}
          style={{ outline: "none", boxShadow: "none" }}
          className="flex-1 max-h-40 min-h-[38px] py-2 bg-transparent text-xs md:text-sm text-foreground placeholder:text-muted/70 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none resize-none leading-relaxed"
        />

        {/* Actions Button Group */}
        <div className="flex items-center gap-1.5 shrink-0 pb-1">
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isLoading}
            title="Clear conversation history"
            className="p-2 h-8 w-8 rounded-xl text-muted hover:text-foreground"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </GlassButton>

          <button
            type="submit"
            disabled={isLoading || !hasContent}
            className={`flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-xl transition-all font-semibold cursor-pointer ${hasContent && !isLoading
              ? "bg-gradient-to-br from-accent to-accent-hover text-accent-foreground shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-100"
              : "bg-foreground/5 text-muted/50 cursor-not-allowed scale-95"
              }`}
            title="Send message (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer shortcut info */}
      <div className="flex items-center justify-between px-3 pt-1.5 text-[10px] text-muted/60 font-mono">
        <span className="hidden sm:inline">LifeOS context linked</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-foreground/5 border border-border/40 text-[9px]">Enter</kbd>
            <span>send</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-foreground/5 border border-border/40 text-[9px]">Shift+Enter</kbd>
            <span>newline</span>
          </span>
        </div>
      </div>
    </form>
  );
}

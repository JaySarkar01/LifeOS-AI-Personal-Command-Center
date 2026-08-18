"use client";

import React from "react";
import { Sparkles, Calendar, Target, Repeat, CheckSquare } from "lucide-react";

interface AIQuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  { text: "What should I focus on today?", icon: CheckSquare },
  { text: "Plan my schedule for today", icon: Calendar },
  { text: "Review my current goals", icon: Target },
  { text: "Check my habit streak momentum", icon: Repeat },
  { text: "Break down a big project into tasks", icon: Sparkles },
];

export function AIQuickPrompts({ onSelectPrompt, disabled }: AIQuickPromptsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
      <span className="text-[10px] font-semibold text-muted/70 uppercase flex items-center gap-1 shrink-0 mr-1 font-mono">
        <Sparkles className="w-3 h-3 text-accent" /> Quick:
      </span>
      {PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.text}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(p.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 hover:bg-card border border-card-border/70 hover:border-accent/40 text-foreground/80 hover:text-foreground text-xs font-medium whitespace-nowrap transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Icon className="w-3 h-3 text-accent/80" />
            <span>{p.text}</span>
          </button>
        );
      })}
    </div>
  );
}

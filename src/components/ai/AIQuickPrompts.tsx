import React from "react";
import { Sparkles } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";

interface AIQuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  "What should I focus on today?",
  "Plan my day.",
  "Review my current goals.",
  "How consistent have my habits been?",
  "Help me prioritize my tasks.",
  "Summarize my week.",
];

export function AIQuickPrompts({ onSelectPrompt, disabled }: AIQuickPromptsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted uppercase flex items-center gap-1.5 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-accent" /> Suggested:
      </span>
      {PROMPTS.map((prompt) => (
        <GlassButton
          key={prompt}
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onSelectPrompt(prompt)}
          className="text-xs py-1 px-3 border border-card-border/60 hover:border-accent/40 rounded-full text-foreground/80 hover:text-foreground"
        >
          {prompt}
        </GlassButton>
      ))}
    </div>
  );
}

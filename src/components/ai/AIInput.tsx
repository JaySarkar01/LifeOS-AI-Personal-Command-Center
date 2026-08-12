import React, { useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";

interface AIInputProps {
  onSend: (prompt: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export function AIInput({ onSend, onClear, isLoading }: AIInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSend(prompt.trim());
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
      <div className="flex-1">
        <GlassInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask LifeOS anything about your tasks, habits, schedule, or goals..."
          disabled={isLoading}
          icon={Sparkles}
        />
      </div>

      <GlassButton
        type="submit"
        variant="primary"
        size="md"
        disabled={isLoading || !prompt.trim()}
        className="gap-2 shrink-0"
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Send</span>
      </GlassButton>

      <GlassButton
        type="button"
        variant="ghost"
        size="md"
        onClick={onClear}
        disabled={isLoading}
        title="Clear conversation history"
        className="p-2.5 shrink-0"
      >
        <Trash2 className="w-4 h-4 text-muted hover:text-foreground" />
      </GlassButton>
    </form>
  );
}

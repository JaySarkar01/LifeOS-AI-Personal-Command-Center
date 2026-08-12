import React from "react";
import { Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function AIThinking() {
  return (
    <div className="flex gap-3.5 items-start max-w-[85%] mr-auto">
      <div className="w-8 h-8 rounded-xl bg-card border border-card-border flex items-center justify-center shrink-0 shadow-glass">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
      </div>

      <GlassPanel className="p-4 bg-card/90 border-card-border flex items-center gap-3">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-xs text-muted font-medium">LifeOS Intelligence is processing context...</span>
      </GlassPanel>
    </div>
  );
}

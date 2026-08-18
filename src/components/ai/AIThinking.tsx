"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function AIThinking() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 items-start max-w-[85%] mr-auto"
    >
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-panel/90 border border-card-border flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
      </div>

      <GlassPanel className="px-4 py-3.5 bg-card/70 border-card-border/80 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-glass">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-xs text-muted/90 font-medium">LifeOS Intelligence is thinking...</span>
      </GlassPanel>
    </motion.div>
  );
}

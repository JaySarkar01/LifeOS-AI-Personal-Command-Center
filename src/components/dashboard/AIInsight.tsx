import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";

export function AIInsight() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-card to-accent-secondary/10 border border-accent/20 p-6 shadow-glass-lg backdrop-blur-2xl backdrop-saturate-150 flex flex-col justify-between min-h-[250px]">
      {/* Subtle animated ambient light sources */}
      <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent-secondary/15 blur-[60px] pointer-events-none" />

      <div className="flex flex-col gap-3.5 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> LIFEOS INTELLIGENCE
          </span>
          <GlassBadge variant="accent" className="text-[9px]">Observation</GlassBadge>
        </div>

        <p className="text-xs md:text-sm leading-relaxed text-foreground/90 font-medium mt-1">
          You tend to complete your most difficult tasks before noon.
        </p>

        <p className="text-xs text-muted leading-relaxed">
          Consider moving tomorrow&apos;s highest-priority architecture task to 9:00 AM for optimal focus.
        </p>
      </div>

      <div className="pt-4 border-t border-accent/15 relative z-10 flex items-center justify-between">
        <span className="text-[11px] text-muted font-medium">Based on 14 days activity</span>
        <GlassButton variant="ghost" size="sm" className="text-xs gap-1 text-accent hover:text-accent">
          View insight <ArrowRight className="w-3 h-3" />
        </GlassButton>
      </div>
    </div>
  );
}

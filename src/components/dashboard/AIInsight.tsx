"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { AIInsightResult } from "@/services/ai/types/ai";

export function AIInsight() {
  const [insight, setInsight] = useState<AIInsightResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/insight");
      const data = await res.json();
      if (data.success) {
        setInsight(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchInsight();
    }, 0);
  }, [fetchInsight]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-card to-accent-secondary/10 border border-accent/20 p-6 shadow-glass-lg backdrop-blur-2xl backdrop-saturate-150 flex flex-col justify-between min-h-[240px]">
      <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent-secondary/15 blur-[60px] pointer-events-none" />

      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> LIFEOS INTELLIGENCE
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInsight()}
              disabled={isLoading}
              className="p-1 rounded text-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh AI Insight"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <GlassBadge variant="accent" className="text-[9px]">Observation</GlassBadge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 my-2 animate-pulse">
            <div className="h-4 bg-accent/20 rounded w-3/4" />
            <div className="h-3 bg-card-border/40 rounded w-full" />
            <div className="h-3 bg-card-border/40 rounded w-2/3" />
          </div>
        ) : (
          <>
            <h4 className="text-sm font-bold text-foreground">
              {insight?.headline || "Welcome to LifeOS"}
            </h4>
            <p className="text-xs md:text-sm leading-relaxed text-foreground/90 font-medium">
              {insight?.insight || "Add some workspace tasks and habits and I'll start identifying patterns."}
            </p>
            {insight?.actionableTip && (
              <p className="text-xs text-accent font-semibold leading-relaxed">
                💡 {insight.actionableTip}
              </p>
            )}
          </>
        )}
      </div>

      <div className="pt-4 border-t border-accent/15 relative z-10 flex items-center justify-between">
        <span className="text-[11px] text-muted font-medium">Powered by Gemini AI</span>
        <Link href="/ai">
          <GlassButton variant="ghost" size="sm" className="text-xs gap-1 text-accent hover:text-accent">
            Ask LifeOS <ArrowRight className="w-3 h-3" />
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { CheckSquare, Flame, Target, Calendar, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { LifeOSTodayContext } from "@/services/ai/types/ai";

interface AIContextPanelProps {
  context: LifeOSTodayContext | null;
}

export function AIContextPanel({ context }: AIContextPanelProps) {
  if (!context) {
    return (
      <GlassPanel className="p-5 flex flex-col gap-4 text-xs text-center items-center justify-center min-h-[200px]">
        <Sparkles className="w-5 h-5 text-muted animate-spin" />
        <span className="text-muted text-xs">Syncing workspace context...</span>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-5 flex flex-col gap-5 text-xs h-full overflow-y-auto max-h-[calc(100vh-12rem)] shadow-glass rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="font-display font-bold text-sm text-foreground">Workspace Intelligence</h3>
        </div>
        <GlassBadge variant="accent" className="text-[10px] font-mono">
          SYNCED
        </GlassBadge>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-card/60 border border-card-border/60 flex flex-col">
          <span className="text-[10px] text-muted uppercase font-mono">Focus Tasks</span>
          <span className="text-lg font-display font-bold text-foreground mt-0.5">{context.tasks.length}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-card/60 border border-card-border/60 flex flex-col">
          <span className="text-[10px] text-muted uppercase font-mono">Habits Tracked</span>
          <span className="text-lg font-display font-bold text-amber-400 mt-0.5">{context.habits.length}</span>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center justify-between text-[10px] tracking-wider font-mono">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-accent" /> Active Focus
          </span>
          <span className="text-accent font-bold">{context.tasks.length}</span>
        </span>
        {context.tasks.length === 0 ? (
          <span className="text-muted/60 italic text-[11px] px-1">No active tasks today</span>
        ) : (
          context.tasks.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="p-2.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/40 flex items-center justify-between gap-2 transition-colors"
            >
              <span className="truncate max-w-[170px] font-medium text-foreground text-xs">{t.title}</span>
              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                t.priority === "urgent" || t.priority === "high"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-accent/10 text-accent border-accent/20"
              }`}>
                {t.priority}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Habits Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center justify-between text-[10px] tracking-wider font-mono">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Habits Momentum
          </span>
          <span className="text-amber-400 font-bold">{context.habits.length}</span>
        </span>
        {context.habits.length === 0 ? (
          <span className="text-muted/60 italic text-[11px] px-1">No active habits</span>
        ) : (
          context.habits.slice(0, 3).map((h) => (
            <div
              key={h.id}
              className="p-2.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/40 flex items-center justify-between gap-2 transition-colors"
            >
              <span className="truncate max-w-[170px] font-medium text-foreground text-xs">{h.title}</span>
              <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                {h.streak}d streak
              </span>
            </div>
          ))
        )}
      </div>

      {/* Goals Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center justify-between text-[10px] tracking-wider font-mono">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Active Goals
          </span>
          <span className="text-emerald-400 font-bold">{context.goals.length}</span>
        </span>
        {context.goals.length === 0 ? (
          <span className="text-muted/60 italic text-[11px] px-1">No goals set</span>
        ) : (
          context.goals.slice(0, 3).map((g) => (
            <div
              key={g.id}
              className="p-2.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/40 flex flex-col gap-1.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-medium text-foreground text-xs">{g.title}</span>
                <span className="font-mono text-[10px] font-bold text-emerald-400">{g.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-background/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center justify-between text-[10px] tracking-wider font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Today&apos;s Schedule
          </span>
          <span className="text-cyan-400 font-bold">{context.schedule.length}</span>
        </span>
        {context.schedule.length === 0 ? (
          <span className="text-muted italic text-[11px] px-1">No scheduled calendar blocks today</span>
        ) : (
          context.schedule.slice(0, 2).map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-xl bg-card/40 border border-card-border/40 flex items-center justify-between text-xs"
            >
              <span className="truncate max-w-[150px] font-medium text-foreground">{s.title}</span>
              <span className="font-mono text-[10px] text-muted bg-foreground/5 px-1.5 py-0.5 rounded">{s.startTime}</span>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

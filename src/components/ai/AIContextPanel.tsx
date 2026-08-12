import React from "react";
import { CheckSquare, Flame, Target, Calendar } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { LifeOSTodayContext } from "@/services/ai/types/ai";

interface AIContextPanelProps {
  context: LifeOSTodayContext | null;
}

export function AIContextPanel({ context }: AIContextPanelProps) {
  if (!context) return null;

  return (
    <GlassPanel className="p-5 flex flex-col gap-5 text-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 className="font-display font-bold text-sm text-foreground">Active Workspace Context</h3>
        <GlassBadge variant="accent" className="text-[10px]">LIVE</GlassBadge>
      </div>

      {/* Tasks Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center gap-1.5 text-[10px]">
          <CheckSquare className="w-3.5 h-3.5 text-accent" /> Active Focus ({context.tasks.length})
        </span>
        {context.tasks.slice(0, 3).map((t) => (
          <div key={t.id} className="p-2 rounded-lg bg-card/60 border border-card-border/50 flex items-center justify-between">
            <span className="truncate max-w-[180px] font-medium text-foreground">{t.title}</span>
            <GlassBadge variant="accent" className="text-[9px] uppercase">{t.priority}</GlassBadge>
          </div>
        ))}
      </div>

      {/* Habits Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center gap-1.5 text-[10px]">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Active Habits ({context.habits.length})
        </span>
        {context.habits.slice(0, 3).map((h) => (
          <div key={h.id} className="p-2 rounded-lg bg-card/60 border border-card-border/50 flex items-center justify-between">
            <span className="truncate max-w-[180px] font-medium text-foreground">{h.title}</span>
            <span className="font-mono text-[10px] font-bold text-amber-400">{h.streak}d streak</span>
          </div>
        ))}
      </div>

      {/* Goals Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center gap-1.5 text-[10px]">
          <Target className="w-3.5 h-3.5 text-emerald-400" /> Goals ({context.goals.length})
        </span>
        {context.goals.slice(0, 3).map((g) => (
          <div key={g.id} className="p-2 rounded-lg bg-card/60 border border-card-border/50 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="truncate font-medium text-foreground">{g.title}</span>
              <span className="font-mono text-[10px] font-bold text-emerald-400">{g.progress}%</span>
            </div>
            <div className="w-full h-1 bg-background/80 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${g.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Section */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-muted uppercase flex items-center gap-1.5 text-[10px]">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Today&apos;s Timeline ({context.schedule.length})
        </span>
        {context.schedule.length === 0 ? (
          <span className="text-muted italic text-[11px]">No events scheduled today</span>
        ) : (
          context.schedule.slice(0, 2).map((s) => (
            <div key={s.id} className="p-2 rounded-lg bg-card/60 border border-card-border/50 flex items-center justify-between">
              <span className="truncate max-w-[150px] font-medium text-foreground">{s.title}</span>
              <span className="font-mono text-[10px] text-muted">{s.startTime}</span>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

import React from "react";
import { TrendingUp, Flame, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function ProgressSummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Metric 1: Daily Progress */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Daily Progress</span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold tracking-tight">74%</span>
            <span className="text-[10px] text-emerald-500 font-semibold">↑ 8% from yesterday</span>
          </div>
          <div className="w-full h-1.5 bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full w-[74%] transition-all duration-1000" />
          </div>
        </div>
      </GlassCard>

      {/* Metric 2: Habit Streak */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Habit Streak</span>
          <Flame className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex flex-col mt-3">
          <span className="font-display text-2xl font-extrabold tracking-tight">12 Days</span>
          <span className="text-[10px] text-muted font-medium mt-1">3 habits completed today</span>
        </div>
      </GlassCard>

      {/* Metric 3: Focus Time */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Focus Time</span>
          <Clock className="w-4 h-4 text-accent-secondary" />
        </div>
        <div className="flex flex-col mt-3">
          <span className="font-display text-2xl font-extrabold tracking-tight">3h 24m</span>
          <span className="text-[10px] text-muted font-medium mt-1">Target: 4h deep work</span>
        </div>
      </GlassCard>
    </div>
  );
}

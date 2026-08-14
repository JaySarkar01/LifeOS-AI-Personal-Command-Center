import React from "react";
import { TrendingUp, Flame, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export interface DashboardSummaryMetrics {
  completionRate?: number;
  completedTasks?: number;
  totalTasks?: number;
  maxStreak?: number;
  completedHabitsToday?: number;
  totalHabits?: number;
  overallGoalProgress?: number;
  totalGoals?: number;
}

export interface ProgressSummaryProps {
  summary?: DashboardSummaryMetrics;
}

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  const totalTasks = summary?.totalTasks || 0;
  const completedTasks = summary?.completedTasks || 0;
  const completionRate = totalTasks > 0 ? summary?.completionRate || Math.round((completedTasks / totalTasks) * 100) : 0;

  const maxStreak = summary?.maxStreak || 0;
  const completedHabitsToday = summary?.completedHabitsToday || 0;
  const totalHabits = summary?.totalHabits || 0;

  const totalGoals = summary?.totalGoals || 0;
  const overallGoalProgress = summary?.overallGoalProgress || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Metric 1: Daily Task Completion */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Task Progress</span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold tracking-tight">
              {totalTasks > 0 ? `${completionRate}%` : "0%"}
            </span>
            <span className="text-[10px] text-muted font-medium">
              {totalTasks > 0 ? `${completedTasks} of ${totalTasks} completed` : "No task activity yet"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Metric 2: Habit Streak */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Habit Streak</span>
          <Flame className={`w-4 h-4 ${maxStreak > 0 ? "text-amber-500" : "text-muted"}`} />
        </div>
        <div className="flex flex-col mt-3">
          <span className="font-display text-2xl font-extrabold tracking-tight">
            {maxStreak} {maxStreak === 1 ? "Day" : "Days"}
          </span>
          <span className="text-[10px] text-muted font-medium mt-1">
            {totalHabits > 0
              ? `${completedHabitsToday} of ${totalHabits} completed today`
              : "No active habits tracked"}
          </span>
        </div>
      </GlassCard>

      {/* Metric 3: Goals Overall Progress */}
      <GlassCard className="p-5 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Goal Progress</span>
          <Target className="w-4 h-4 text-accent-secondary" />
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-extrabold tracking-tight">
              {totalGoals > 0 ? `${overallGoalProgress}%` : "0%"}
            </span>
            <span className="text-[10px] text-muted font-medium">
              {totalGoals > 0 ? `${totalGoals} active ${totalGoals === 1 ? "goal" : "goals"}` : "No goals set yet"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-secondary rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, overallGoalProgress))}%` }}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

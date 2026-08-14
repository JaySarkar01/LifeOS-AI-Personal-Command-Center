import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassBadge } from "@/components/ui/GlassBadge";

export interface DayActivity {
  day: string;
  date: string;
  score: number;
  active: boolean;
  tasksCount: number;
  habitsCount: number;
}

export interface WeeklyOverviewProps {
  activity?: DayActivity[];
  avgScore?: number;
}

export function WeeklyOverview({ activity = [], avgScore = 0 }: WeeklyOverviewProps) {
  // If activity is not yet passed, fallback to default 7 days with 0 score
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const defaultDays: DayActivity[] = [];

  if (activity.length === 0) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      defaultDays.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split("T")[0],
        score: 0,
        active: i === 0,
        tasksCount: 0,
        habitsCount: 0,
      });
    }
  }

  const displayDays = activity.length > 0 ? activity : defaultDays;
  const hasActivity = displayDays.some((d) => d.score > 0);

  return (
    <GlassPanel className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-sm font-bold tracking-tight text-foreground">
            Weekly Productivity Overview
          </span>
          <span className="text-xs text-muted">
            {hasActivity
              ? "Daily output score based on completed focus tasks and habits"
              : "No activity recorded in the past 7 days"}
          </span>
        </div>
        <GlassBadge variant={avgScore > 0 ? "accent" : "default"} className="text-[10px]">
          Avg {avgScore}%
        </GlassBadge>
      </div>

      <div className="flex items-end justify-between gap-3 h-40 pt-6 px-2">
        {displayDays.map((item) => (
          <div key={item.date || item.day} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group">
            <div className="w-full bg-foreground/5 dark:bg-white/5 rounded-lg h-full max-h-[120px] flex items-end p-1 overflow-hidden relative">
              <div
                className={`w-full rounded-md transition-all duration-700 ${
                  item.active
                    ? "bg-gradient-to-t from-accent to-accent-hover shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : item.score > 0
                    ? "bg-accent/40 group-hover:bg-accent/60"
                    : "bg-foreground/5"
                }`}
                style={{ height: `${Math.max(item.score > 0 ? 12 : 4, item.score)}%` }}
                title={`${item.day}: ${item.tasksCount} tasks, ${item.habitsCount} habits completed`}
              />
            </div>
            <span className={`text-[11px] font-mono ${item.active ? "text-accent font-bold" : "text-muted"}`}>
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

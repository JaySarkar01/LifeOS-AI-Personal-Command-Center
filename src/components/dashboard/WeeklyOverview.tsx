import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassBadge } from "@/components/ui/GlassBadge";

export function WeeklyOverview() {
  const days = [
    { day: "Mon", score: 65, active: false },
    { day: "Tue", score: 88, active: true },
    { day: "Wed", score: 72, active: false },
    { day: "Thu", score: 55, active: false },
    { day: "Fri", score: 80, active: false },
    { day: "Sat", score: 40, active: false },
    { day: "Sun", score: 60, active: false },
  ];

  return (
    <GlassPanel className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-sm font-bold tracking-tight text-foreground">
            Weekly Productivity Overview
          </span>
          <span className="text-xs text-muted">Daily output score based on completed focus tasks</span>
        </div>
        <GlassBadge variant="accent" className="text-[10px]">Avg 65%</GlassBadge>
      </div>

      <div className="flex items-end justify-between gap-3 h-40 pt-6 px-2">
        {days.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group">
            <div className="w-full bg-foreground/5 dark:bg-white/5 rounded-lg h-full max-h-[120px] flex items-end p-1 overflow-hidden relative">
              <div
                className={`w-full rounded-md transition-all duration-700 ${
                  item.active
                    ? "bg-gradient-to-t from-accent to-accent-hover shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : "bg-accent/40 group-hover:bg-accent/60"
                }`}
                style={{ height: `${item.score}%` }}
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

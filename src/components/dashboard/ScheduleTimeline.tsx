import React from "react";
import { Calendar } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function ScheduleTimeline() {
  const events = [
    { time: "09:00 AM", title: "Weekly OS Architecture Sync", type: "primary" },
    { time: "02:30 PM", title: "Personal Reflection & Review", type: "secondary" },
    { time: "06:00 PM", title: "Evening Gym Workout", type: "muted" },
  ];

  return (
    <GlassPanel className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-bold tracking-tight uppercase text-muted">Timeline</span>
        <Calendar className="w-3.5 h-3.5 text-muted" />
      </div>

      <div className="relative flex flex-col gap-4 pl-2">
        {/* Timeline Line */}
        <div className="absolute left-[70px] top-2 bottom-2 w-[1px] bg-border/40" />

        {events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-3 relative z-10">
            <span className="text-[10px] font-mono text-muted w-14 shrink-0">{event.time}</span>
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                event.type === "primary"
                  ? "bg-accent"
                  : event.type === "secondary"
                  ? "bg-accent-secondary"
                  : "bg-muted/60"
              }`}
            />
            <span className="text-xs font-medium text-foreground">{event.title}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

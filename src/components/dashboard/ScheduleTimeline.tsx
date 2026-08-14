import React from "react";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";

export interface TimelineEventItem {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  type?: string;
}

export interface ScheduleTimelineProps {
  events?: TimelineEventItem[];
}

export function ScheduleTimeline({ events = [] }: ScheduleTimelineProps) {
  const formatTime = (timeVal: string | Date) => {
    try {
      const date = new Date(timeVal);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return String(timeVal);
    }
  };

  return (
    <GlassPanel className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-bold tracking-tight uppercase text-muted">Timeline</span>
        <Link href="/schedule">
          <Calendar className="w-3.5 h-3.5 text-muted hover:text-foreground transition-colors cursor-pointer" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-5 border border-dashed border-border/60 rounded-xl gap-2.5 my-1">
          <Calendar className="w-5 h-5 text-muted" />
          <span className="text-xs text-muted font-medium">No events scheduled.</span>
          <Link href="/schedule">
            <GlassButton variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2.5">
              <Plus className="w-3 h-3" /> Add Event
            </GlassButton>
          </Link>
        </div>
      ) : (
        <div className="relative flex flex-col gap-4 pl-2">
          {/* Timeline Line */}
          <div className="absolute left-[70px] top-2 bottom-2 w-[1px] bg-border/40" />

          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 relative z-10">
              <span className="text-[10px] font-mono text-muted w-14 shrink-0">
                {formatTime(event.startTime)}
              </span>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  event.type === "focus_session"
                    ? "bg-accent"
                    : event.type === "meeting"
                    ? "bg-accent-secondary"
                    : "bg-muted/60"
                }`}
              />
              <span className="text-xs font-medium text-foreground truncate">{event.title}</span>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

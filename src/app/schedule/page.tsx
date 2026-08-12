"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("focus_session");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchEvents();
    }, 0);
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          type,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvents((prev) => [...prev, data.data].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
        setIsModalOpen(false);
        setTitle("");
        setStartTime("");
        setEndTime("");
        setType("focus_session");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchEvents();
    }
  };

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Productivity Module"
          badgeIcon={Calendar}
          title="Schedule Timeline"
          description="Map out focus session blocks, meetings, and daily personal milestones."
          actions={
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Event
            </GlassButton>
          }
        />

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No scheduled events"
            description="Organize your day into structured focus blocks and timeline events."
            actionLabel="Add Event"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <GlassPanel className="p-6 md:p-8 flex flex-col gap-6">
            <div className="relative flex flex-col gap-6 pl-4 md:pl-6">
              {/* Timeline Vertical Line */}
              <div className="absolute left-[85px] md:left-[115px] top-3 bottom-3 w-[1px] bg-border/50" />

              {events.map((event) => {
                const start = new Date(event.startTime);
                const timeString = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={event.id} className="group flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                      <span className="text-xs font-mono font-semibold text-muted w-16 md:w-20 shrink-0">
                        {timeString}
                      </span>
                      <div className="w-3 h-3 rounded-full bg-accent border-2 border-background shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{event.title}</span>
                        {event.description && <span className="text-xs text-muted truncate">{event.description}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <GlassBadge variant="accent" className="text-[10px] uppercase">
                        {event.type.replace("_", " ")}
                      </GlassBadge>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1 rounded text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        )}

        {/* Create Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-md" />
            <GlassPanel className="relative w-full max-w-lg p-6 md:p-8 flex flex-col gap-6 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <h2 className="font-display font-bold text-lg text-foreground">Schedule New Event</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Event Title</label>
                  <GlassInput
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Weekly Sync, Deep Work Block..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">Start Time</label>
                    <GlassInput
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">End Time</label>
                    <GlassInput
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-card/70 border border-card-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="focus_session">Focus Session</option>
                    <option value="meeting">Meeting</option>
                    <option value="reminder">Reminder</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Event"}
                  </GlassButton>
                </div>
              </form>
            </GlassPanel>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}

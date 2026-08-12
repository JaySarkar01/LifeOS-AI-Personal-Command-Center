"use client";

import React, { useEffect, useState } from "react";
import { Repeat, Plus, Flame, CheckCircle2, Circle, Trash2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

interface HabitItem {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  targetDaysPerWeek: number;
  color: string;
  streak: number;
  completedToday: boolean;
}

export default function HabitsPage() {
  const { showToast } = useToast();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Confirmation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteHabitTargetId, setDeleteHabitTargetId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [targetDays, setTargetDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (data.success) {
        setHabits(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchHabits();
    }, 0);
  }, []);

  const toggleHabit = async (id: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;

    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          return {
            ...h,
            completedToday: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );

    showToast(
      nextCompleted ? "Habit Logged Today" : "Habit Unchecked",
      undefined,
      "success"
    );

    try {
      await fetch(`/api/habits/${id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const confirmDeleteHabit = async () => {
    if (!deleteHabitTargetId) return;
    const id = deleteHabitTargetId;
    setDeleteHabitTargetId(null);

    setHabits((prev) => prev.filter((h) => h.id !== id));
    showToast("Habit Deleted", undefined, "info");

    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          frequency,
          targetDaysPerWeek: Number(targetDays),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHabits((prev) => [data.data, ...prev]);
        setIsModalOpen(false);
        setTitle("");
        setFrequency("daily");
        setTargetDays(7);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Productivity Module"
          badgeIcon={Repeat}
          title="Habit Routine Tracker"
          description="Build consistent daily routines and protect your completion streaks."
          actions={
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Habit
            </GlassButton>
          }
        />

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : habits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits tracked"
            description="Start building consistent daily habits. Add your first habit routine to begin tracking streaks."
            actionLabel="Add Habit"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <GlassCard key={habit.id} className="p-6 flex flex-col justify-between gap-6 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display font-bold text-base text-foreground">{habit.title}</h3>
                    <span className="text-xs text-muted capitalize">
                      {habit.frequency} • {habit.targetDaysPerWeek} days/week
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteHabitTargetId(habit.id)}
                    className="p-1 rounded text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs">
                    <Flame className="w-4 h-4" />
                    <span>{habit.streak} Day Streak</span>
                  </div>

                  <GlassButton
                    variant={habit.completedToday ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => toggleHabit(habit.id, habit.completedToday)}
                    className="gap-1.5 text-xs"
                  >
                    {habit.completedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Done
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Mark Complete
                      </>
                    )}
                  </GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={!!deleteHabitTargetId}
          title="Delete Habit"
          description="Are you sure you want to delete this habit? Routine streaks and historical log data for this habit will be removed."
          confirmLabel="Delete"
          onConfirm={confirmDeleteHabit}
          onCancel={() => setDeleteHabitTargetId(null)}
        />

        {/* Create Habit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />
            <GlassPanel className="relative w-full max-w-lg p-6 md:p-8 flex flex-col gap-6 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <h2 className="font-display font-bold text-lg text-foreground">Create New Habit</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Habit Title</label>
                  <GlassInput
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Morning Study, Exercise, Meditation..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-card/70 border border-card-border text-xs text-foreground focus:outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">Target Days / Week</label>
                    <GlassInput
                      type="number"
                      min={1}
                      max={7}
                      value={targetDays}
                      onChange={(e) => setTargetDays(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Habit"}
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

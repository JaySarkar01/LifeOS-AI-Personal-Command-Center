"use client";

import React, { useEffect, useState } from "react";
import { Target, Plus, CheckCircle2, Circle, Trash2, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface MilestoneItem {
  id: string;
  title: string;
  completed: boolean;
}

interface GoalItem {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: string;
  progress: number;
  milestones: MilestoneItem[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Milestone Input State
  const [newMilestoneText, setNewMilestoneText] = useState<{ [goalId: string]: string }>({});

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchGoals();
    }, 0);
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGoals((prev) => [data.data, ...prev]);
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setTargetDate("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMilestone = async (goalId: string) => {
    const text = newMilestoneText[goalId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? { ...g, milestones: data.data.milestones, progress: data.data.progress, status: data.data.status }
              : g
          )
        );
        setNewMilestoneText((prev) => ({ ...prev, [goalId]: "" }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });

      const data = await res.json();
      if (data.success) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? { ...g, milestones: data.data.milestones, progress: data.data.progress, status: data.data.status }
              : g
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchGoals();
    }
  };

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Productivity Module"
          badgeIcon={Target}
          title="Goals & Milestones"
          description="Track high-level quarterly goals and execute incremental milestone checklists."
          actions={
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Goal
            </GlassButton>
          }
        />

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals set"
            description="Synthesize your ambitious quarterly goals and break them down into actionable milestones."
            actionLabel="Add Goal"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GlassCard key={goal.id} className="p-6 flex flex-col gap-5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-foreground">{goal.title}</h3>
                      <GlassBadge
                        variant={goal.status === "achieved" ? "accent" : "default"}
                        className="text-[9px] uppercase"
                      >
                        {goal.status}
                      </GlassBadge>
                    </div>
                    {goal.description && <p className="text-xs text-muted leading-relaxed">{goal.description}</p>}
                  </div>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 rounded text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted">Milestone Progress</span>
                    <span className="text-accent">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-foreground/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="flex flex-col gap-2 pt-3 border-t border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Milestones</span>
                  <div className="flex flex-col gap-2">
                    {goal.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        onClick={() => handleToggleMilestone(goal.id, ms.id)}
                        className="flex items-center gap-2.5 text-xs text-muted hover:text-foreground cursor-pointer select-none"
                      >
                        {ms.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted shrink-0" />
                        )}
                        <span className={ms.completed ? "line-through text-muted" : "text-foreground"}>
                          {ms.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Inline */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newMilestoneText[goal.id] || ""}
                      onChange={(e) =>
                        setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddMilestone(goal.id)}
                      placeholder="Add milestone step..."
                      className="flex-1 bg-card/60 border border-card-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none"
                    />
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddMilestone(goal.id)}
                      className="text-xs shrink-0"
                    >
                      Add
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Create Goal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-md" />
            <GlassPanel className="relative w-full max-w-lg p-6 md:p-8 flex flex-col gap-6 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <h2 className="font-display font-bold text-lg text-foreground">Create New Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Goal Title</label>
                  <GlassInput
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Launch LifeOS Product v1.0..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Description</label>
                  <GlassInput
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key objectives..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Target Date</label>
                  <GlassInput
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Goal"}
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

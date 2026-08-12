"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { EntityFactory } from "@/lib/patterns/EntityFactory";
import { Task } from "@/models/domain/Task";

export function FocusTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => [
    EntityFactory.createTask({
      userId: "usr_mock",
      title: "Finalize LifeOS Phase 3 production dashboard shell",
      priority: "urgent",
      tags: ["Core Architecture"],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
    }),
    EntityFactory.createTask({
      userId: "usr_mock",
      title: "Review weekly habit streak consistency data",
      priority: "medium",
      tags: ["Habits"],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
      status: "completed",
    }),
    EntityFactory.createTask({
      userId: "usr_mock",
      title: "Synthesize quarterly goal progress milestones",
      priority: "high",
      tags: ["Goals"],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 10),
    }),
  ]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = new Task({ ...t });
          if (updated.status === "completed") {
            updated.markIncomplete();
          } else {
            updated.markComplete();
          }
          return updated;
        }
        return t;
      })
    );
  };

  return (
    <GlassPanel className="flex flex-col gap-5 p-6 md:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="font-display text-base md:text-lg font-bold tracking-tight">Today&apos;s Focus Tasks</h2>
        </div>
        <GlassButton variant="ghost" size="sm" className="text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Task
        </GlassButton>
      </div>

      <div className="flex flex-col gap-2.5">
        {tasks.map((task) => {
          const isCompleted = task.status === "completed";

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="group flex items-center justify-between p-3.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/60 transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3.5">
                <button className="text-muted group-hover:text-accent transition-colors">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                  ) : (
                    <Circle className="w-4.5 h-4.5" />
                  )}
                </button>
                <span
                  className={
                    isCompleted
                      ? "text-xs text-muted line-through"
                      : "text-xs md:text-sm font-medium text-foreground"
                  }
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <GlassBadge
                  variant={task.priority === "urgent" || task.priority === "high" ? "accent" : "default"}
                  className="text-[10px]"
                >
                  {task.tags[0] || task.priority}
                </GlassBadge>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

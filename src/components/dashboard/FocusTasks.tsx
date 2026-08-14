"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Plus, CheckSquare } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";

export interface FocusTaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string | Date;
  tags?: string[];
}

export interface FocusTasksProps {
  tasks?: FocusTaskItem[];
  onToggleTask?: (taskId: string) => Promise<void>;
}

export function FocusTasks({ tasks = [], onToggleTask }: FocusTasksProps) {
  return (
    <GlassPanel className="flex flex-col gap-5 p-6 md:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="font-display text-base md:text-lg font-bold tracking-tight">Today&apos;s Focus Tasks</h2>
        </div>
        <Link href="/tasks">
          <GlassButton variant="ghost" size="sm" className="text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </GlassButton>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-2xl gap-3">
          <div className="p-3 rounded-xl bg-card/60 text-muted">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground">No tasks for today.</span>
            <span className="text-[11px] text-muted max-w-xs">
              Add your high-priority items to start structuring your day.
            </span>
          </div>
          <Link href="/tasks">
            <GlassButton variant="primary" size="sm" className="text-xs gap-1 mt-1">
              <Plus className="w-3.5 h-3.5" /> Create Task
            </GlassButton>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask?.(task.id)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/60 transition-all duration-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button className="text-muted group-hover:text-accent transition-colors shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                    ) : (
                      <Circle className="w-4.5 h-4.5" />
                    )}
                  </button>
                  <span
                    className={`truncate ${
                      isCompleted
                        ? "text-xs text-muted line-through"
                        : "text-xs md:text-sm font-medium text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <GlassBadge
                    variant={task.priority === "urgent" || task.priority === "high" ? "accent" : "default"}
                    className="text-[10px]"
                  >
                    {task.tags?.[0] || task.priority}
                  </GlassBadge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

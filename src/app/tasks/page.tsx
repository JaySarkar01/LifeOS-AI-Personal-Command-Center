"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  X, 
  ArrowUpDown 
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrioritySortStrategy, DueDateSortStrategy, CreatedDateSortStrategy } from "@/lib/patterns/strategies/SortStrategy";
import { Task } from "@/models/domain/Task";

interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortStrategy, setSortStrategy] = useState<"priority" | "dueDate" | "createdAt">("priority");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchTasks();
    }, 0);
  }, []);

  // Filter and Sort Tasks using Strategy Pattern
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((t) => t.status !== "completed");
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.status === "completed");
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    // Convert to domain objects for sorting strategy
    const domainTasks = result.map(
      (t) =>
        new Task({
          id: t.id,
          userId: t.userId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          tags: t.tags,
          createdAt: new Date(t.createdAt),
        })
    );

    let strategy;
    if (sortStrategy === "dueDate") {
      strategy = new DueDateSortStrategy();
    } else if (sortStrategy === "createdAt") {
      strategy = new CreatedDateSortStrategy();
    } else {
      strategy = new PrioritySortStrategy();
    }

    const sortedDomain = strategy.sort(domainTasks);
    return sortedDomain.map((dt) => ({
      id: dt.id,
      userId: dt.userId,
      title: dt.title,
      description: dt.description,
      status: dt.status,
      priority: dt.priority,
      dueDate: dt.dueDate ? dt.dueDate.toISOString() : undefined,
      tags: dt.tags,
      createdAt: dt.createdAt.toISOString(),
    }));
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortStrategy]);

  // Toggle Completion
  const toggleTask = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "todo" : "completed";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks(); // rollback on error
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  // Create Task Submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          priority: newPriority,
          dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
          tags: newTag.trim() ? [newTag.trim()] : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.data, ...prev]);
        setIsModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewPriority("medium");
        setNewDueDate("");
        setNewTag("");
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
          badgeIcon={CheckSquare}
          title="Tasks Workspace"
          description="Manage, prioritize, and track your focus tasks."
          actions={
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Task
            </GlassButton>
          }
        />

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <GlassInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              icon={Search}
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center p-1 rounded-xl bg-card/60 border border-card-border/80 text-xs">
              {(["all", "active", "completed"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    statusFilter === st
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Filter Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 border border-card-border/80 text-xs text-muted">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Strategy Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 border border-card-border/80 text-xs text-muted">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortStrategy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortStrategy(e.target.value as "priority" | "dueDate" | "createdAt")}
                className="bg-transparent text-foreground focus:outline-none cursor-pointer"
              >
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="createdAt">Sort by Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare as React.ElementType}
            title="No tasks found"
            description="You don't have any tasks matching the selected filters. Create your first task to get started."
            actionLabel="Add Task"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-card/40 hover:bg-card/70 border border-card-border/60 backdrop-blur-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTask(task.id, task.status)}
                      className="text-muted hover:text-accent transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm font-medium leading-snug truncate ${
                          isCompleted ? "text-muted line-through" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-muted truncate mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <GlassBadge
                      variant={
                        task.priority === "urgent" || task.priority === "high"
                          ? "accent"
                          : "default"
                      }
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {task.priority}
                    </GlassBadge>

                    {task.dueDate && (
                      <span className="text-[11px] font-mono text-muted hidden sm:inline">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Task Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />
            <GlassPanel className="relative w-full max-w-lg p-6 md:p-8 flex flex-col gap-6 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <h2 className="font-display font-bold text-lg text-foreground">Create New Task</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Task Title</label>
                  <GlassInput
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted uppercase">Description (Optional)</label>
                  <GlassInput
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Task details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                      className="px-3 py-2 rounded-xl bg-card/70 border border-card-border text-xs text-foreground focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted uppercase">Due Date</label>
                    <GlassInput
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Task"}
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

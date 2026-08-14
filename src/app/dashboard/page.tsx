"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FocusTasks, FocusTaskItem } from "@/components/dashboard/FocusTasks";
import { ProgressSummary, DashboardSummaryMetrics } from "@/components/dashboard/ProgressSummary";
import { ScheduleTimeline, TimelineEventItem } from "@/components/dashboard/ScheduleTimeline";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { WeeklyOverview, DayActivity } from "@/components/dashboard/WeeklyOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { pageTransition } from "@/lib/motion";
import { useToast } from "@/components/providers/ToastProvider";

interface DashboardApiResponse {
  userName: string;
  summary: DashboardSummaryMetrics & { avgWeeklyScore?: number };
  weeklyActivity: DayActivity[];
  tasks: FocusTaskItem[];
  habits: Array<{ id: string; title: string; streak: number; completedToday: boolean }>;
  goals: Array<{ id: string; title: string; status: string; progress: number }>;
  events: TimelineEventItem[];
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  const handleToggleTask = async (taskId: string) => {
    if (!dashboardData) return;

    const targetTask = dashboardData.tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nextStatus: FocusTaskItem["status"] = targetTask.status === "completed" ? "todo" : "completed";

    // Optimistic UI update
    setDashboardData((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      );
      const total = updatedTasks.length;
      const completed = updatedTasks.filter((t) => t.status === "completed").length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...prev,
        tasks: updatedTasks,
        summary: {
          ...prev.summary,
          completedTasks: completed,
          completionRate: rate,
        },
      };
    });

    showToast(
      nextStatus === "completed" ? "Task Completed" : "Task Reopened",
      undefined,
      "success"
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadDashboard();
    } catch (err) {
      console.error(err);
      loadDashboard();
    }
  };

  return (
    <AppShell>
      <PageContainer>
        <motion.div
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col gap-8 md:gap-10"
        >
          {/* Dashboard Header */}
          <DashboardHeader userName={dashboardData?.userName || "User"} />

          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8-column primary work focus */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <FocusTasks
                  tasks={dashboardData?.tasks || []}
                  onToggleTask={handleToggleTask}
                />
                <ProgressSummary summary={dashboardData?.summary} />
                <WeeklyOverview
                  activity={dashboardData?.weeklyActivity || []}
                  avgScore={dashboardData?.summary?.avgWeeklyScore || 0}
                />
              </div>

              {/* Right 4-column AI intelligence & timeline context */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <AIInsight />
                <ScheduleTimeline events={dashboardData?.events || []} />
                <QuickActions />
              </div>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </AppShell>
  );
}

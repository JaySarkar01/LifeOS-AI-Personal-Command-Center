"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FocusTasks } from "@/components/dashboard/FocusTasks";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { ScheduleTimeline } from "@/components/dashboard/ScheduleTimeline";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { WeeklyOverview } from "@/components/dashboard/WeeklyOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { pageTransition } from "@/lib/motion";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<{
    userName?: string;
    summary?: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

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
                <FocusTasks />
                <ProgressSummary />
                <WeeklyOverview />
              </div>

              {/* Right 4-column AI intelligence & timeline context */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <AIInsight />
                <ScheduleTimeline />
                <QuickActions />
              </div>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </AppShell>
  );
}

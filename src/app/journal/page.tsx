"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function JournalPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Life Module"
          badgeIcon={BookOpen}
          title="Journal"
          description="Daily reflections, mindful observations, and personal progress logs."
        />
        <EmptyState
          icon={BookOpen}
          title="Personal Journal Log"
          description="Daily reflection entries and mood tracking will be integrated in future LifeOS modules."
        />
      </PageContainer>
    </AppShell>
  );
}

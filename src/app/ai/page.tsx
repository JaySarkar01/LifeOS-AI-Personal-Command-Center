"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AIPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Intelligence Module"
          badgeIcon={Sparkles}
          title="AI Assistant"
          description="Your personal AI synthesis and productivity intelligence copilot."
        />
        <EmptyState
          icon={Sparkles}
          title="LifeOS Intelligence Center"
          description="Contextual AI chat, schedule synthesis, and automated task recommendations will be connected to the Gemini API layer in Phase 5."
        />
      </PageContainer>
    </AppShell>
  );
}

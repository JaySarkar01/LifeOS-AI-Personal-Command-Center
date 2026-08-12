"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FinancePage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="Life Module"
          badgeIcon={CreditCard}
          title="Finance"
          description="Personal budget overview, expense tracking, and savings targets."
        />
        <EmptyState
          icon={CreditCard}
          title="Finance & Budget Center"
          description="Financial logging and budget visualization will be integrated in future LifeOS modules."
        />
      </PageContainer>
    </AppShell>
  );
}

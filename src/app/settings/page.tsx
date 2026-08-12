"use client";

import React from "react";
import { Settings } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="System"
          badgeIcon={Settings}
          title="Settings"
          description="Manage application preferences, appearance, and notifications."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassPanel className="flex flex-col gap-4">
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">Appearance</h2>
            <p className="text-xs text-muted">Customize the visual theme of your LifeOS environment.</p>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs font-medium text-foreground">Color Theme</span>
              <ThemeToggle />
            </div>
          </GlassPanel>

          <GlassPanel className="flex flex-col gap-4">
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">User Preferences</h2>
            <p className="text-xs text-muted">User profile settings and authentication configuration will be enabled in Phase 4.</p>
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted">
              <span>Account Identity</span>
              <span className="font-semibold text-foreground">Jay (Local Mock)</span>
            </div>
          </GlassPanel>
        </div>
      </PageContainer>
    </AppShell>
  );
}

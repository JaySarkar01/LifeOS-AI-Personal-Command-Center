"use client";

import React from "react";
import { Settings, User, Mail, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const { data: session } = useSession();

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "Authenticated Account";

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          badge="System"
          badgeIcon={Settings}
          title="Settings"
          description="Manage application preferences, appearance, and workspace account profile."
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
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">Account & Security</h2>
            <p className="text-xs text-muted">Active authenticated workspace identity.</p>
            <div className="flex flex-col gap-3 pt-2 border-t border-border/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted">
                  <User className="w-3.5 h-3.5" /> Name
                </span>
                <span className="font-semibold text-foreground">{userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="font-semibold text-foreground">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Ownership Isolation
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </PageContainer>
    </AppShell>
  );
}

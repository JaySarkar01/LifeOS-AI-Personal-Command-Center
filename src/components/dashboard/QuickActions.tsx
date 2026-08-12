"use client";

import React from "react";
import { Plus, StickyNote, Play, Repeat } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassPanel } from "@/components/ui/GlassPanel";

export interface QuickActionsProps {
  onTriggerAction?: (actionName: string) => void;
}

export function QuickActions({ onTriggerAction }: QuickActionsProps) {
  const actions = [
    { label: "Add Task", icon: Plus, variant: "primary" as const },
    { label: "Quick Note", icon: StickyNote, variant: "secondary" as const },
    { label: "Start Focus", icon: Play, variant: "secondary" as const },
    { label: "New Habit", icon: Repeat, variant: "secondary" as const },
  ];

  return (
    <GlassPanel className="flex flex-col gap-3 p-5">
      <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
        Quick Actions
      </span>
      <div className="flex flex-wrap gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <GlassButton
              key={act.label}
              variant={act.variant}
              size="sm"
              onClick={() => onTriggerAction?.(act.label)}
              className="gap-1.5 text-xs"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{act.label}</span>
            </GlassButton>
          );
        })}
      </div>
    </GlassPanel>
  );
}

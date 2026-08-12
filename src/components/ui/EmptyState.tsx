import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard className={cn("flex flex-col items-center justify-center text-center p-8 md:p-12 gap-4", className)}>
      <div className="p-3.5 rounded-2xl bg-accent-muted text-accent border border-accent/20">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <GlassButton variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </GlassButton>
      )}
    </GlassCard>
  );
}

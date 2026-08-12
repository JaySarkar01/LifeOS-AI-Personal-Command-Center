import React from "react";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  badge?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40", className)}>
      <div className="flex flex-col gap-1.5">
        {badge && (
          <div className="flex items-center gap-2">
            <GlassBadge variant="accent" className="gap-1 text-[10px]">
              {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
              {badge}
            </GlassBadge>
          </div>
        )}
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-xs md:text-sm text-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hoverEffect = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl bg-card border border-card-border shadow-glass backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
          "before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] dark:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] before:pointer-events-none",
          "after:absolute after:inset-x-0 after:top-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-white/20 dark:after:via-white/15 after:to-transparent after:pointer-events-none",
          hoverEffect && "hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glass-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

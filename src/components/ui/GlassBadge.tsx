import React from "react";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "danger" | "success";
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 select-none border",
        
        variant === "default" && "bg-foreground/[0.03] dark:bg-white/[0.03] text-muted border-card-border",
        variant === "accent" && "bg-accent-muted text-accent border-accent/20",
        variant === "danger" && "bg-danger-muted text-danger border-danger/20",
        variant === "success" && "bg-emerald-500/8 dark:bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

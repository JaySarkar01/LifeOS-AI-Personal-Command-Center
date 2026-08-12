import React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, icon, type = "text", disabled, ...props }, ref) => {
    return (
      <div className="relative w-full flex flex-col gap-1">
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full bg-card border border-card-border rounded-xl text-sm px-4 py-2.5 text-foreground shadow-glass placeholder:text-muted transition-all duration-250 focus:outline-none backdrop-blur-md",
              icon && "pl-10",
              disabled && "opacity-40 pointer-events-none",
              error
                ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger-muted"
                : "hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent-muted",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[11px] text-danger font-medium pl-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

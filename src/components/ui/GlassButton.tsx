import React from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const GlassButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  GlassButtonProps
>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      href,
      target,
      rel,
      children,
      disabled,
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClass = cn(
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:pointer-events-none",
      
      // Size scales
      size === "sm" && "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      size === "md" && "px-4 py-2 text-sm rounded-xl gap-2",
      size === "lg" && "px-5 py-2.5 text-base rounded-xl gap-2.5",
      
      // Design styles
      variant === "primary" && [
        "bg-accent text-accent-foreground shadow-glass",
        "hover:bg-accent-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
      ],
      variant === "secondary" && [
        "bg-card border border-card-border text-foreground shadow-glass backdrop-blur-md",
        "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] hover:border-accent/30 active:scale-[0.98]",
      ],
      variant === "ghost" && [
        "text-muted hover:text-foreground",
        "hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04] active:bg-foreground/[0.08] dark:active:bg-white/[0.08] active:scale-[0.98]",
      ],
      variant === "danger" && [
        "bg-danger text-danger-foreground shadow-glass",
        "hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
      ],
      className
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          className={baseClass}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={baseClass}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const GlassDivider: React.FC<GlassDividerProps> = ({
  className,
  orientation = "horizontal",
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-border/40 backdrop-blur-sm shrink-0 self-stretch",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        className
      )}
      {...props}
    />
  );
};

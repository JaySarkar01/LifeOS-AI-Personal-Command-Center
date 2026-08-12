import React from "react";
import { cn } from "@/lib/utils";

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1536px] mx-auto px-4 md:px-8 lg:px-10 py-6 md:py-8 flex flex-col gap-8 md:gap-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

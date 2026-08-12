import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-foreground/10 dark:bg-white/10 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-card-border"
        >
          <div className="flex items-center gap-3.5 w-full">
            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
          <Skeleton className="h-4 w-16 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  const heights = [45, 70, 55, 85, 40, 75, 60];

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-panel/60 border border-panel-border">
      <Skeleton className="h-5 w-40 rounded-md" />
      <div className="flex items-end justify-between gap-2 h-44 pt-6">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <ListSkeleton count={4} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
}

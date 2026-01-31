"use client";

import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  type: "chart" | "stats" | "panel" | "text";
  className?: string;
}

export function SkeletonLoader({ type, className }: SkeletonLoaderProps) {
  if (type === "chart") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-card p-6",
          className
        )}
      >
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="flex h-64 items-end justify-between gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-t bg-muted"
              style={{
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="shimmer absolute inset-0" />
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-4",
          className
        )}
      >
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (type === "panel") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-5",
          className
        )}
      >
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
    </div>
  );
}

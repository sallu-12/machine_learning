"use client";

import React from "react"

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface StatsCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  animate?: boolean;
  className?: string;
  color?: "default" | "primary" | "accent" | "success" | "warning";
}

export function StatsCard({
  label,
  value,
  unit,
  icon,
  trend,
  animate = true,
  className,
  color = "default",
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === "number" ? 0 : value);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof value !== "number" || !animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 400; // Slightly faster
    const startValue = typeof displayValue === "number" ? displayValue : 0;
    const diff = value - startValue;

    const animateFrame = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateFrame);
      } else {
        setDisplayValue(value);
      }
    };

    frameRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      startTimeRef.current = null;
    };
  }, [value, animate]);

  const colorClasses = {
    default: "border-border bg-card",
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    success: "border-green-500/20 bg-green-500/5",
    warning: "border-yellow-500/20 bg-yellow-500/5",
  };

  const textColors = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    success: "text-green-500",
    warning: "text-yellow-500",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-3 sm:p-4 transition-all duration-200 hover:shadow-lg",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1">
            <span
              className={cn("text-lg sm:text-2xl font-bold font-mono", textColors[color])}
            >
              {typeof displayValue === "number"
                ? displayValue.toFixed(displayValue < 1 ? 4 : 2)
                : displayValue}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-secondary",
              textColors[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"}
          </span>
          <span className="text-xs text-muted-foreground">
            {trend === "up" && "Improving"}
            {trend === "down" && "Decreasing"}
            {trend === "neutral" && "Stable"}
          </span>
        </div>
      )}
    </div>
  );
}

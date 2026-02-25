"use client";

import { cn } from "@/lib/utils";
import { Info, Lightbulb, ArrowRight } from "lucide-react";

interface ExplanationPanelProps {
  title: string;
  whatChanged: string;
  whyItChanged: string;
  conceptualMeaning: string;
  className?: string;
  algorithmColor?: string;
}

export function ExplanationPanel({
  title,
  whatChanged,
  whyItChanged,
  conceptualMeaning,
  className,
  algorithmColor = "primary",
}: ExplanationPanelProps) {
  const colorMap: Record<string, string> = {
    primary: "border-primary/30 bg-primary/5",
    regression: "border-chart-1/30 bg-chart-1/5",
    clustering: "border-chart-2/30 bg-chart-2/5",
    tree: "border-chart-3/30 bg-chart-3/5",
  };

  const accentMap: Record<string, string> = {
    primary: "text-primary",
    regression: "text-chart-1",
    clustering: "text-chart-2",
    tree: "text-chart-3",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-3 sm:p-4 md:p-5 transition-all duration-300",
        colorMap[algorithmColor] || colorMap.primary,
        className
      )}
    >
      <div className="mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
        <Lightbulb className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5", accentMap[algorithmColor])} />
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {/* What Changed */}
        <div className="group">
          <div className="mb-0.5 sm:mb-1 md:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <div className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full", `bg-${algorithmColor === 'primary' ? 'primary' : `chart-${algorithmColor === 'regression' ? '1' : algorithmColor === 'clustering' ? '2' : '3'}`}`)} />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What Changed
            </span>
          </div>
          <p className="pl-3 sm:pl-4 text-[11px] sm:text-xs md:text-sm leading-relaxed text-foreground">
            {whatChanged}
          </p>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-muted-foreground/50" />
        </div>

        {/* Why It Changed */}
        <div className="group">
          <div className="mb-0.5 sm:mb-1 md:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Why It Changed
            </span>
          </div>
          <p className="pl-3 sm:pl-4 text-[11px] sm:text-xs md:text-sm leading-relaxed text-muted-foreground">
            {whyItChanged}
          </p>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-muted-foreground/50" />
        </div>

        {/* Conceptual Meaning */}
        <div className="group">
          <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center gap-1.5 sm:gap-2">
            <Lightbulb className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What This Means
            </span>
          </div>
          <p className={cn("pl-3 sm:pl-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed", accentMap[algorithmColor])}>
            {conceptualMeaning}
          </p>
        </div>
      </div>
    </div>
  );
}

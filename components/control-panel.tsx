"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface SliderControl {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

interface ControlPanelProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  sliders: SliderControl[];
  className?: string;
  disabled?: boolean;
}

export function ControlPanel({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  sliders,
  className,
  disabled = false,
}: ControlPanelProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3 sm:p-5", className)}>
      <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Controls
      </h3>

      {/* Playback Controls */}
      <div className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={disabled}
          className="h-9 sm:h-10 w-9 sm:w-10 border-border bg-secondary hover:bg-secondary/80"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          className={cn(
            "h-9 sm:h-10 w-9 sm:w-10 transition-all",
            isPlaying
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStep}
          disabled={disabled || isPlaying}
          className="h-9 sm:h-10 w-9 sm:w-10 border-border bg-secondary hover:bg-secondary/80"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="ml-1 sm:ml-2 flex items-center gap-1.5 sm:gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              isPlaying ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
            )}
          />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {isPlaying ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 sm:space-y-5">
        {sliders.map((slider) => (
          <div key={slider.label}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {slider.label}
              </label>
              <span className="text-xs sm:text-sm font-mono text-primary">
                {slider.formatValue
                  ? slider.formatValue(slider.value)
                  : slider.value}
              </span>
            </div>
            <Slider
              value={[slider.value]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onValueChange={([value]) => slider.onChange(value)}
              disabled={disabled}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

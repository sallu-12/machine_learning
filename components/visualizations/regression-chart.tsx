"use client";

import { useEffect, useRef } from "react";
import type { Point, RegressionState } from "@/lib/ml-algorithms";

interface RegressionChartProps {
  points: Point[];
  state: RegressionState;
  width?: number;
  height?: number;
}

export function RegressionChart({
  points,
  state,
  width = 600,
  height = 400,
}: RegressionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevStateRef = useRef<RegressionState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate data bounds
    const xMin = 0;
    const xMax = 100;
    const yMin = 0;
    const yMax = 180;

    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * chartWidth;
    const scaleY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * chartHeight;

    // Animation for smooth transitions
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x <= 100; x += 20) {
        ctx.beginPath();
        ctx.moveTo(scaleX(x), padding);
        ctx.lineTo(scaleX(x), height - padding);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y <= 180; y += 30) {
        ctx.beginPath();
        ctx.moveTo(padding, scaleY(y));
        ctx.lineTo(width - padding, scaleY(y));
        ctx.stroke();
      }

      // Draw axes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;

      // X-axis
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "center";

      // X-axis labels
      for (let x = 0; x <= 100; x += 20) {
        ctx.fillText(x.toString(), scaleX(x), height - padding + 20);
      }

      // Y-axis labels
      ctx.textAlign = "right";
      for (let y = 0; y <= 180; y += 30) {
        ctx.fillText(y.toString(), padding - 10, scaleY(y) + 4);
      }

      // Draw data points
      points.forEach((point) => {
        const x = scaleX(point.x);
        const y = scaleY(point.y);

        // Point glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Point
        ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Point border
        ctx.strokeStyle = "rgba(139, 92, 246, 1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw regression line
      if (state.iteration > 0) {
        const x1 = xMin;
        const y1 = state.slope * x1 + state.intercept;
        const x2 = xMax;
        const y2 = state.slope * x2 + state.intercept;

        // Line glow
        ctx.strokeStyle = "rgba(20, 184, 166, 0.3)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(scaleX(x1), scaleY(y1));
        ctx.lineTo(scaleX(x2), scaleY(y2));
        ctx.stroke();

        // Main line
        ctx.strokeStyle = "rgba(20, 184, 166, 1)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX(x1), scaleY(y1));
        ctx.lineTo(scaleX(x2), scaleY(y2));
        ctx.stroke();

        // Draw residuals
        ctx.strokeStyle = "rgba(255, 100, 100, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        points.forEach((point) => {
          const predicted = state.slope * point.x + state.intercept;
          ctx.beginPath();
          ctx.moveTo(scaleX(point.x), scaleY(point.y));
          ctx.lineTo(scaleX(point.x), scaleY(predicted));
          ctx.stroke();
        });

        ctx.setLineDash([]);
      }

      // Draw equation
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      const equation = `y = ${state.slope.toFixed(3)}x + ${state.intercept.toFixed(3)}`;
      ctx.fillText(equation, padding + 10, padding + 20);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [points, state, width, height]);

  return (
    <div className="relative rounded-xl border border-border bg-card p-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-1" />
          <span>Data Points</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-chart-2" />
          <span>Best Fit Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t border-dashed border-red-400" />
          <span>Residuals</span>
        </div>
      </div>
    </div>
  );
}
